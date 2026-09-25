# Feature: Admin product CRUD

**Status:** Implemented (demo-scope)
**Last updated:** 2026-09-25

## Summary

The admin panel behind the mock login: a searchable product table, an add/edit form with
validation and an image preview, and a delete confirmation dialog. Write calls are sent to the
Fake Store API for realism, but the actual persisted change is recorded in the local
[product overlay](./product-overlay.md) so it shows up across reloads.

## Why it works this way

`fakestoreapi` accepts `POST`/`PUT`/`DELETE` but never persists them (a new product always echoes
back `id: 21`). The admin flow therefore does two things on every write:

1. Makes the real API call (so the app behaves like a normal client).
2. Records the change locally in `useProductOverlayStore`.

`useProducts` then merges the overlay over fresh API data, which is why the storefront and the
admin table both reflect changes immediately and after reload. See
[Product overlay](./product-overlay.md) for the merge mechanics.

## User flow

```
/admin/products            AdminProductsPage     table + search + delete dialog
/admin/products/new        AdminProductFormPage  create
/admin/products/:id/edit   AdminProductFormPage  update
```

1. **List** — `/admin/products` shows a table (thumbnail + title, category badge, price, actions)
   with a search box and an "Add product" button.
2. **Create** — "Add product" opens the empty form; on success a toast says "Product created" and
   the app returns to the list.
3. **Edit** — the pencil icon opens the form pre-filled; on success, "Product updated".
4. **Delete** — the trash icon opens a confirmation dialog; confirming calls the API, removes it
   from the overlay, and toasts "Product deleted".

## Key implementation details

### Routes

In `src/routes/AppRoutes.tsx`, the admin tree is nested under `/admin` behind `RequireAdminAuth`
(see [Admin authentication](./admin-auth.md)):

```tsx
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
```

`/admin` itself redirects to `/admin/products`. The same `AdminProductFormPage` serves both create
and edit; `isEditMode` is derived from the presence of the `:id` param.

### List page (`src/pages/admin/AdminProductsPage.tsx`)

- Reads products through `useProducts()` — never the API client directly.
- **Search** — local `query` state, case-insensitive substring match on `title` only.
- **Loading** — 5 skeleton rows.
- **Error** — destructive alert with a Retry button wired to `refetch`.
- **Empty** — a full-width table row reading "No products found." when the filter matches nothing.
- **Delete** — tracks `productPendingDelete` (the row awaiting confirmation) and a `deleting` flag,
  and passes both to `DeleteProductDialog`.

Delete handler:

```ts
await deleteProductRequest(productPendingDelete.id); // API call
removeFromOverlay(productPendingDelete.id); // local overlay
toast.success("Product deleted");
```

On failure it toasts "Could not delete product. Please try again." and leaves the row in place.

### Form page (`src/pages/admin/AdminProductFormPage.tsx`)

A single component handling both create and edit.

- **Fields** — `title`, `price` (string in state, numeric on submit), `category`, `image` (URL),
  `description`.
- **Pre-fill on edit** — a `hydrated` flag guards a `useEffect` that copies the existing product
  into form state **once**, so background re-renders (e.g. the `useProducts` merge resolving) don't
  clobber what the admin is typing. This is the subtle part of the file — preserve it.
- **Category suggestions** — badges for the derived `categories` from `useProducts`; clicking one
  fills the category field. Free-text entry is still allowed.
- **Image preview** — shows the entered URL in a small box; `onError` hides the broken image and
  `onLoad` re-shows it.
- **Validation** (`validate()`) — required title, category, description, image; price must parse as
  a number `> 0`. Errors render as inline destructive text under each field.
- **Submitting** — disables the button and shows "Saving…"; label is "Create product" or
  "Save changes".

Write paths:

```ts
// edit
await updateProductRequest(existingProduct.id, input);
editInOverlay(existingProduct.id, { ...existingProduct, ...input });

// create
await createProductRequest(input);
addToOverlay({ id: Date.now(), ...input, rating: { rate: 0, count: 0 } });
```

Note the create path **ignores the API's returned product** and builds its own with a
client-generated `Date.now()` id and a neutral rating — because the API always echoes `id: 21`.

Unknown id on edit renders a "Product not found" state with a back link.

### Delete dialog (`src/components/admin/DeleteProductDialog.tsx`)

A controlled shadcn/ui `Dialog`: `open` is `product !== null`, closing calls `onCancel`, and the
destructive button shows "Deleting…" while `loading` is true. It's presentational — the parent owns
the delete logic and state.

## Gotchas

- **`Date.now()` ids, not API ids.** New products must get a client id or the overlay can't address
  them for later edit/delete. Don't switch to the API response id.
- **The `hydrated` guard in the form is load-bearing.** Without it, the pre-fill effect could re-run
  after `useProducts` updates and overwrite in-progress edits.
- **Delete needs both steps** — the API call _and_ `removeFromOverlay`. Calling only the API
  changes nothing visible (the API doesn't persist); calling only the overlay skips the realistic
  request.
- **Delete removes the pending edit too.** `deleteProduct` clears `edited[id]` before adding to
  `deletedIds`, so a previously-edited-then-deleted product doesn't leave stale state.
- **List search is title-only** and not URL-synced — it resets on navigation.
- **Form errors are cleared only on submit**, not as the user types.

## Constraints / non-goals

- No pagination, sorting, or bulk actions.
- No server-side validation or persistence.
- No image upload — image is a URL string only.
- No slug/SKU, stock, or inventory fields.
- No undo for deletes.
- No automated tests (the project has no test suite by design).

## Possible future extensions (not implemented)

- URL-synced search + sorting/pagination on the list.
- Debounced search and clearing field errors as the user types.
- Image upload or a picker instead of a raw URL.
- Bulk select + delete.
- Toast-based undo for deletes.

## Related docs

- [Product overlay](./product-overlay.md) — where admin writes are actually stored.
- [Admin authentication](./admin-auth.md) — the guard in front of these routes.
- [Storefront](./storefront.md) — the read side that reflects these changes.
