# Feature: Storefront

**Status:** Implemented (demo-scope)
**Last updated:** 2026-09-25

## Summary

The storefront is the customer-facing half of ShopEasy: browse all products, search by title,
filter by category, open a product detail page, add items to a cart, and proceed to guest
checkout. It is served under `StorefrontLayout` (header + footer) and reads its product data
exclusively through the `useProducts` hook.

## Why it works this way

The catalog comes from the public [Fake Store API](https://fakestoreapi.com/products), which is
read-only in practice — admin writes never persist server-side. To make the storefront reflect
admin changes anyway, `useProducts` fetches the base catalog once and layers a locally-persisted
admin overlay on top (the admin side of this is documented separately). The storefront itself is a
plain read path: it never calls the API client directly and never writes products.

Cart state is client-side only (zustand + `persist` to localStorage). There is no account system —
every shopper is a guest, which is why checkout needs no login (see
[Guest checkout](./guest-checkout.md)).

## User flow

```
/                         HomePage          browse, search, filter by category
/product/:id              ProductDetailPage view one product, pick quantity, add to cart
/cart                     CartPage          review items, change quantity, remove, go to checkout
/checkout                 CheckoutPage      order summary + "Place order"
/order-confirmation/:id   OrderConfirmationPage
*                         NotFoundPage      404
```

1. **Browse** — `/` shows a responsive grid of all products with a search box and category pills.
2. **Filter** — typing in search filters by title substring; clicking a category pill filters by
   category. The two filters combine (AND).
3. **View** — clicking a card (image/title) opens `/product/:id` with a large image, category
   badge, rating, price, description, and a quantity stepper.
4. **Add to cart** — from either the card ("Add to cart", qty 1) or the detail page (chosen
   quantity). Both show a success toast and update the header cart badge.
5. **Cart** — `/cart` lists line items with quantity steppers, per-line totals, and remove buttons,
   plus an order summary and "Proceed to checkout".

## Key implementation details

### Data read path

`src/hooks/useProducts.ts` is the **single read path** for product data — pages and components must
not call `src/api/products.ts` directly.

```ts
const { products, categories, loading, error, refetch } = useProducts();
```

- Fetches the base catalog once via `fetchProducts()` on mount (`load` is a `useCallback`, run from
  a `useEffect`).
- Merges the persisted admin overlay via `mergeProducts(base, { added, edited, deletedIds })`
  (`src/lib/products.ts`): drops `deletedIds`, applies `edited[id]` overrides, then prepends
  `added` (new admin products appear first).
- Derives `categories` client-side: `Array.from(new Set(products.map(p => p.category))).sort()` —
  no call to the API's `/products/categories` endpoint.
- Exposes `loading`, `error`, and `refetch` for skeletons and the retry affordance.

The merge is memoized on `[base, added, edited, deletedIds]`, so storefront data updates reactively
when an admin adds/edits/deletes a product in the same browser.

### Pages and components

| Concern                                 | Location                                     |
| --------------------------------------- | -------------------------------------------- |
| Home (search + category filter + grid)  | `src/pages/storefront/HomePage.tsx`          |
| Product detail (quantity + add to cart) | `src/pages/storefront/ProductDetailPage.tsx` |
| Product card                            | `src/components/products/ProductCard.tsx`    |
| Grid layout wrapper                     | `src/components/products/ProductGrid.tsx`    |
| Layout shell (header/main/footer)       | `src/components/layout/StorefrontLayout.tsx` |
| Header with cart badge                  | `src/components/layout/StorefrontHeader.tsx` |
| Footer (incl. Admin link)               | `src/components/layout/StorefrontFooter.tsx` |
| 404 page                                | `src/pages/storefront/NotFoundPage.tsx`      |
| Route table                             | `src/routes/AppRoutes.tsx`                   |

### Home filtering

`HomePage` holds two pieces of local state — `query` and `category` — and computes the visible list
with a memoized filter:

```ts
const filtered = useMemo(() => {
  const q = query.trim().toLowerCase();
  return products.filter((p) => {
    const matchesCategory = category === "all" || p.category === category;
    const matchesQuery = q === "" || p.title.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });
}, [products, query, category]);
```

Search is a case-insensitive substring match on `title` only (not description or category).
Category defaults to `"all"`, rendered as an "All" pill followed by one pill per derived category.

Three render states: skeleton grid while `loading` (8 placeholder cards), an empty-state message
when `filtered.length === 0`, otherwise `<ProductGrid>`.

### Loading, error, and empty states

- **Loading** — `HomePage` renders a skeleton grid; `ProductDetailPage` renders a two-column
  skeleton.
- **Error** — `HomePage` renders a destructive `Alert` with the error text and a **Retry** button
  wired to `refetch`.
- **No matches** — "No products found." centered message.
- **Unknown product id** — `ProductDetailPage` renders "Product not found" with a back link when
  `products.find(p => p.id === Number(id))` yields nothing.

### Cart integration

The header badge count and add-to-cart actions both use the cart store:

- `StorefrontHeader` — `getCartCount(items)` from `src/lib/cart.ts`; badge hidden when count is 0.
- `ProductCard` — `addItem(product, 1)` + `toast.success("Added to cart", { description: product.title })`.
- `ProductDetailPage` — local `quantity` state (min 1 via `Math.max(1, q - 1)`), `addItem(product, quantity)`,
  toast description `"{quantity} × {title}"`.

Adding an existing product increments its quantity rather than duplicating the line (handled inside
`cartStore.addItem`).

### Data shapes

`src/types/product.ts`:

```ts
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}
```

`src/types/cart.ts`: `CartItem = { product: Product; quantity: number }`.

## Gotchas

- **Product ids are numbers.** The route param is a string, so `ProductDetailPage` compares with
  `Number(id)`. New admin products use a `Date.now()`-based id, which is also numeric — no
  conversion needed, but be careful never to stringify ids in a comparison.
- **Cart stores a snapshot of the product**, not just an id. If an admin edits a product, items
  already in the cart keep the old price/title until re-added. This is existing behavior, not a bug
  to "fix" without being asked.
- **`categories` is derived, not fetched** — adding a product with a brand-new category
  automatically creates a new pill; there is no separate category list to keep in sync.
- **Don't bypass `useProducts`.** Calling `fetchProducts` (or the API client) from a page/component
  skips the admin overlay merge and will show stale/incorrect data.

## Constraints / non-goals

- No pagination, sorting, price-range filter, or fuzzy search — title substring + category only.
- No product reviews, wishlists, or related-product recommendations.
- No account/login for shoppers; every shopper is a guest.
- No server-side rendering or data caching layer (React Query/SWR) — a single fetch on mount.
- No automated tests (the project has no test suite by design).

## Possible future extensions (not implemented)

- Debounced search and/or URL-synced query params (`?q=…&category=…`) so filters are shareable and
  survive refresh/back.
- Sort options (price, rating, title).
- Pagination or infinite scroll for larger catalogs.
- Search across description/category as well as title.
- A data-caching layer to avoid refetching on every mount.

## Related docs

- [Product overlay](./product-overlay.md) — how admin changes reach the storefront catalog.
- [Shopping cart](./shopping-cart.md) — cart store, badge, and cart page.
- [Guest checkout](./guest-checkout.md) — the checkout flow.
- [Admin product CRUD](./admin-product-crud.md) — the write side that edits this catalog.
