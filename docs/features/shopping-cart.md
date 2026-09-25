# Feature: Shopping cart

**Status:** Implemented (demo-scope)
**Last updated:** 2026-09-25

## Summary

The cart holds the shopper's selected products and quantities, persists them to localStorage, and
drives the header badge, the cart page, and checkout. It is entirely client-side — there is no
server cart and no account association, since every shopper is a guest.

## Why it works this way

With no backend and no accounts, the cart is pure local state. zustand provides the store and its
`persist` middleware writes it to localStorage, so a cart survives reloads and browser restarts
without any server round-trip. Cart items store a **snapshot** of the product object rather than
just an id, which keeps the cart page self-contained (no lookup needed) at the cost of not
reflecting later admin edits — see Gotchas.

## User flow

```
ProductCard / ProductDetailPage ──addItem──▶ cartStore ──▶ header badge
                                                  │
                                                  ▼
                                             /cart  CartPage
                                                  │
                                        "Proceed to checkout"
                                                  ▼
                                             /checkout  (see Guest checkout)
```

1. **Add** — from a product card (quantity 1) or the detail page (chosen quantity). A success toast
   confirms and the header badge increments.
2. **Review** — `/cart` lists each line with a thumbnail, title link, unit price, a quantity
   stepper, the line total, and a remove button; an order summary shows the grand total.
3. **Adjust** — the `−`/`+` steppers call `setQuantity`; `−` at quantity 1 removes the line (via the
   `quantity <= 0` rule). The trash button calls `removeItem`.
4. **Empty** — if the cart has no items, the cart page shows "Your cart is empty" with a
   "Continue shopping" link.
5. **Checkout** — "Proceed to checkout" navigates to `/checkout` (see
   [Guest checkout](./guest-checkout.md)).

## Key implementation details

### The store

`src/store/cartStore.ts` — zustand with `persist`, storage key `cart-storage`.

```ts
interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
}
```

Behavior:

- **`addItem(product, quantity = 1)`** — if the product is already in the cart, **increments** its
  quantity; otherwise appends a new line. Adding the same product never creates a duplicate line.
- **`removeItem(productId)`** — filters the line out.
- **`setQuantity(productId, quantity)`** — sets an absolute quantity; **`quantity <= 0` removes the
  line** rather than storing a zero/negative quantity.
- **`clear()`** — empties the cart (called by checkout when an order is placed).

All operations match on `item.product.id` — ids are numeric (see Gotchas).

### Types

`src/types/cart.ts`:

```ts
export interface CartItem {
  product: Product;
  quantity: number;
}
```

`src/types/product.ts` holds the full `Product` (including `rating`), so cart lines carry the whole
product snapshot.

### Helpers

`src/lib/cart.ts`:

```ts
export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0,
  );
}
```

`getCartCount` counts **total units** (sum of quantities), which is what the header badge shows —
not the number of distinct lines.

### Consumers

| Consumer                                     | Uses                                                       |
| -------------------------------------------- | ---------------------------------------------------------- |
| `src/components/layout/StorefrontHeader.tsx` | `items`, `getCartCount` → badge (hidden at 0)              |
| `src/components/products/ProductCard.tsx`    | `addItem(product, 1)` + toast                              |
| `src/pages/storefront/ProductDetailPage.tsx` | local quantity state, `addItem(product, quantity)` + toast |
| `src/pages/storefront/CartPage.tsx`          | `items`, `setQuantity`, `removeItem`, `getCartTotal`       |
| `src/pages/storefront/CheckoutPage.tsx`      | `items`, `clear`, `getCartTotal`                           |

Persistence means the badge and cart contents are restored on reload without any fetch.

## Gotchas

- **Items are product snapshots, not references.** If an admin edits a product's price or title,
  existing cart lines keep the old values until the item is removed and re-added. This is existing
  behavior — not a bug to "fix" unless asked.
- **`setQuantity` with `<= 0` deletes the line.** Don't add a separate "decrement to zero" path that
  stores a zero quantity.
- **`addItem` merges by product id.** Adding an item that's already present increments instead of
  duplicating, so there is never more than one line per product.
- **Ids are numeric** (`product.id: number`), while route params are strings — comparisons must not
  stringify ids.
- **Storage key is `cart-storage`.** Clearing it resets the cart; there is no reset UI.
- **The cart is not cleared on logout or admin actions** — it's shopper state, independent of the
  admin session.

## Constraints / non-goals

- No server cart, account sync, or cross-device persistence.
- No stock/inventory checks, quantity caps, or per-product limits.
- No coupons, promotions, taxes, or shipping costs — the total is a plain sum.
- No save-for-later, wishlist, or recently-viewed.
- Covered by `src/lib/cart.test.ts` (count/total) and `src/store/cartStore.test.ts` (actions).

## Possible future extensions (not implemented)

- Re-resolve cart lines against fresh product data so edits/prices stay current.
- Quantity caps or stock validation.
- A "reset cart" action in the UI.
- Persist an order history so carts/orders could be revisited.
- Cross-tab sync (the `storage` event) so two tabs share one cart view live.

## Related docs

- [Storefront](./storefront.md) — where items are added from.
- [Guest checkout](./guest-checkout.md) — what happens on "Place order".
