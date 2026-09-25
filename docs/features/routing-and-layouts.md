# Feature: Routing & layouts

**Status:** Implemented
**Last updated:** 2026-09-25

## Summary

ShopEasy uses `react-router-dom` v7 with `BrowserRouter`. All routes are declared in a single table
(`src/routes/AppRoutes.tsx`), split into two layout trees — the **storefront** (public) and the
**admin** panel (behind a mock auth guard) — plus a catch-all 404. This doc is the one place that
records the complete route table; the feature docs show only the slices relevant to them.

## Why it works this way

The app has two distinct audiences with different chrome, so it uses **nested routes with layout
components** rather than duplicating headers/footers per page. Layout components render an `<Outlet />`
and the route table nests pages inside them. Admin routes additionally nest behind
`RequireAdminAuth` so a single guard protects the whole subtree.

## Route table

Defined in `src/routes/AppRoutes.tsx`:

| Path                           | Element                              | Layout     | Guard              | Doc                                   |
| ------------------------------ | ------------------------------------ | ---------- | ------------------ | ------------------------------------- |
| `/` (index)                    | `HomePage`                           | Storefront | —                  | [Storefront](./storefront.md)         |
| `/product/:id`                 | `ProductDetailPage`                  | Storefront | —                  | [Storefront](./storefront.md)         |
| `/cart`                        | `CartPage`                           | Storefront | —                  | [Shopping cart](./shopping-cart.md)   |
| `/checkout`                    | `CheckoutPage`                       | Storefront | —                  | [Guest checkout](./guest-checkout.md) |
| `/order-confirmation/:orderId` | `OrderConfirmationPage`              | Storefront | —                  | [Guest checkout](./guest-checkout.md) |
| `/admin/login`                 | `AdminLoginPage`                     | _(none)_   | —                  | [Admin auth](./admin-auth.md)         |
| `/admin`                       | `<Navigate to="products" replace />` | Admin      | `RequireAdminAuth` | [Admin CRUD](./admin-product-crud.md) |
| `/admin/products`              | `AdminProductsPage`                  | Admin      | `RequireAdminAuth` | [Admin CRUD](./admin-product-crud.md) |
| `/admin/products/new`          | `AdminProductFormPage`               | Admin      | `RequireAdminAuth` | [Admin CRUD](./admin-product-crud.md) |
| `/admin/products/:id/edit`     | `AdminProductFormPage`               | Admin      | `RequireAdminAuth` | [Admin CRUD](./admin-product-crud.md) |
| `*`                            | `NotFoundPage`                       | _(none)_   | —                  | below                                 |

```tsx
<Routes>
  <Route element={<StorefrontLayout />}>
    <Route index element={<HomePage />} />
    <Route path="product/:id" element={<ProductDetailPage />} />
    <Route path="cart" element={<CartPage />} />
    <Route path="checkout" element={<CheckoutPage />} />
    <Route
      path="order-confirmation/:orderId"
      element={<OrderConfirmationPage />}
    />
  </Route>

  <Route path="admin/login" element={<AdminLoginPage />} />
  <Route
    path="admin"
    element={
      <RequireAdminAuth>
        <AdminLayout />
      </RequireAdminAuth>
    }
  >
    <Route index element={<Navigate to="products" replace />} />
    <Route path="products" element={<AdminProductsPage />} />
    <Route path="products/new" element={<AdminProductFormPage />} />
    <Route path="products/:id/edit" element={<AdminProductFormPage />} />
  </Route>

  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

## Key implementation details

### App shell

`src/main.tsx` mounts `<App />` in `StrictMode`. `src/App.tsx` is the router + toast shell:

```tsx
<BrowserRouter>
  <AppRoutes />
  <Toaster richColors position="top-center" />
</BrowserRouter>
```

`BrowserRouter` means routes are real URL paths (history API), **not** hash routes — so a production
deploy needs SPA fallback rewrites on the host. `Toaster` is mounted once at the root, which is why
any component can call `toast.success(...)` from `sonner` without rendering its own container.

### Storefront tree

- **`StorefrontLayout`** (`src/components/layout/StorefrontLayout.tsx`) — `min-h-svh` flex column:
  `StorefrontHeader` (sticky) → `<main>` with `max-w-6xl` content width → `StorefrontFooter`.
- **`StorefrontHeader`** — brand link to `/` and a cart link with a live count badge
  (`getCartCount`), hidden when the count is 0.
- **`StorefrontFooter`** — copyright with the current year, plus the only entry point to
  `/admin/login` (the "Admin" link). There is no other admin entry in the storefront UI.

The storefront tree has **no index redirect** — the index route _is_ `HomePage`.

### Admin tree

- **`/admin/login` is declared outside both layouts** — it renders full-screen on its own, with no
  storefront chrome and no admin header. Don't move it inside the guarded tree or an unauthenticated
  user would be redirected to a route that requires auth (a loop).
- **`RequireAdminAuth` wraps `AdminLayout`**, so the guard runs before the admin chrome renders.
- **`/admin` redirects to `/admin/products`** via `<Navigate replace />` — `replace` keeps the bare
  `/admin` out of the history stack so Back doesn't bounce.
- **`AdminLayout`** — header with "Admin Panel", a Products link, "View store" (back to `/`), and a
  "Log out" button; then `<Outlet />`.

### The 404 catch-all

`<Route path="*" element={<NotFoundPage />} />` is last and **outside both layouts**, so an unknown
URL renders the bare 404 page (no storefront header/footer). `NotFoundPage`
(`src/pages/storefront/NotFoundPage.tsx`) shows "404 / Page not found." with a "Go home" button.
It lives under `pages/storefront/` by folder, but is not part of the storefront layout tree.

### Layout vs. page responsibilities

- **Layouts** own chrome and the `<Outlet />`; they do not fetch data.
- **Pages** own data (`useProducts`), local UI state, and navigation.
- Both layouts share the `mx-auto w-full max-w-6xl px-4 py-6` content wrapper convention.

## Gotchas

- **Login must stay outside the guard.** Nesting `/admin/login` inside the `RequireAdminAuth` tree
  creates a redirect loop for logged-out users.
- **`BrowserRouter`, not `HashRouter`.** Deep links like `/product/3` require SPA fallback config on
  whatever host serves the build (Vite preview handles it; static hosts may not by default).
- **`replace` on redirects.** Both the `/admin` index redirect and the auth guard use
  `navigate(..., { replace: true })` / `<Navigate replace />` to avoid polluting history. The
  checkout empty-cart redirect does too (see [Guest checkout](./guest-checkout.md)).
- **The 404 is outside the layouts** — if you want the storefront chrome on 404s, move that route
  inside the `StorefrontLayout` subtree.
- **Route params are strings.** Pages convert as needed — `ProductDetailPage` and
  `AdminProductFormPage` both use `Number(id)` because product ids are numeric.
- **No lazy loading / code splitting.** All pages are imported eagerly, so the admin code ships in
  the storefront bundle.

## Constraints / non-goals

- No route-level code splitting or lazy imports.
- No loaders/actions or data-router APIs — plain element-based routes.
- No nested admin sub-navigation beyond the products link.
- No auth redirect "return to intended page" behavior — the guard always sends you to
  `/admin/login`, then login always goes to `/admin/products`.
- Route selection, storefront/admin layout rendering, admin redirects, and the standalone 404 are
  covered by `src/routes/AppRoutes.test.tsx`.

## Possible future extensions (not implemented)

- `React.lazy` + `Suspense` per route to split the admin bundle.
- Remember the attempted admin URL and return there after login.
- A 404 that renders inside `StorefrontLayout` for consistent chrome.
- Scroll restoration on navigation.
- Route-level error boundaries.

## Related docs

- [Storefront](./storefront.md) — the public pages in this table.
- [Admin authentication](./admin-auth.md) — `RequireAdminAuth` and `/admin/login`.
- [Admin product CRUD](./admin-product-crud.md) — the guarded admin routes.
- [Guest checkout](./guest-checkout.md) — `/checkout` and `/order-confirmation/:orderId`.
- [Architecture overview](../architecture.md) — where routing sits in the app as a whole.
