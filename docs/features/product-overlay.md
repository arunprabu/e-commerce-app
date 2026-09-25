# Feature: Product Overlay (local persistence)

**Status:** Implemented (demo-scope)
**Last updated:** 2026-09-25

## Summary

The product overlay is the mechanism that lets admin add/edit/delete changes survive even though
the public [Fake Store API](https://fakestoreapi.com/products) never persists writes. Admin changes
are stored locally in a zustand store persisted to localStorage, and then **merged on top of** fresh
API data every time products are read. It is the foundation that the storefront and the admin panel
both sit on.

## Why it works this way

`fakestoreapi` simulates write responses but does not actually save anything server-side — a
`POST /products` always echoes back `id: 21`, and subsequent `GET /products` returns the original
20 products unchanged. So the write calls are still made (to keep the app realistic), but the real
source of truth for admin changes is a client-side overlay:

- `added` — products created in this browser, prepended to the catalog.
- `edited` — a map of `id → updated Product` applied over the base data.
- `deletedIds` — ids filtered out of the base data.

This keeps the app honest (it really does call the API) while still making admin CRUD visibly work
across reloads, without adding a backend — which is explicitly out of scope per `AGENTS.md`.

## Data shape

`src/types/product.ts`:

```ts
export interface ProductOverlay {
  added: Product[];
  edited: Record<number, Product>;
  deletedIds: number[];
}
```

## How it fits together

```
fakestoreapi GET /products
        │
        ▼
   fetchProducts()            src/api/products.ts        (base catalog)
        │
        ▼
   mergeProducts(base, overlay)   src/lib/products.ts    (overlay applied)
        ▲
        │
   useProductOverlayStore     src/store/productOverlayStore.ts  (localStorage)
        ▲
        │
   admin add / edit / delete
```

- `useProducts()` (`src/hooks/useProducts.ts`) fetches the base catalog once, subscribes to the
  three overlay slices, and merges them with `mergeProducts`. Every read of product data in the app
  goes through this hook.
- Because the hook subscribes to the store, an admin change re-renders the storefront in the same
  browser immediately — no refetch needed.

## Key implementation details

### The store

`src/store/productOverlayStore.ts` — zustand with `persist`, storage key `product-overlay-storage`.

```ts
addProduct: (product) =>
  set((state) => ({ added: [product, ...state.added] })),

editProduct: (id, product) =>
  set((state) =>
    state.added.some((p) => p.id === id)
      ? { added: state.added.map((p) => (p.id === id ? product : p)) }
      : { edited: { ...state.edited, [id]: product } },
  ),

deleteProduct: (id) =>
  set((state) => {
    if (state.added.some((p) => p.id === id)) {
      return { added: state.added.filter((p) => p.id !== id) };
    }
    const restEdited = { ...state.edited };
    delete restEdited[id];
    return { edited: restEdited, deletedIds: [...state.deletedIds, id] };
  }),
```

Key behaviors:

- **Add prepends** (`[product, ...state.added]`) so newly created products appear first.
- **Edit is overlay-aware** — it branches on whether the id belongs to a locally-added product. If
  so, it rewrites `added`; otherwise it writes an `edited[id]` override. This avoids an edit to a
  local product also creating a redundant `edited` entry.
- **Delete is overlay-aware** — locally-added products are simply removed from `added`; base
  products get any pending edit cleared _and_ their id appended to `deletedIds`. `deletedIds` is an
  array (not a set) and is never deduplicated, so re-deleting the same id would add it twice — the
  merge tolerates this because it only uses `includes`.

### The merge

`src/lib/products.ts`:

```ts
export function mergeProducts(
  base: Product[],
  overlay: ProductOverlay,
): Product[] {
  const visible = base.filter((p) => !overlay.deletedIds.includes(p.id));
  const withEdits = visible.map((p) => overlay.edited[p.id] ?? p);
  return [...overlay.added, ...withEdits];
}
```

Order matters: **filter deleted → apply edits → prepend added**.

### Client-generated ids

New admin products get `id: Date.now()` rather than the API's echoed id (which is always 21 for
`fakestoreapi`). See `AdminProductFormPage`. The overlay merge relies on ids being unique, so this
is what keeps added products addressable for later edit/delete.

### Persistence and reset

- Stored under localStorage key `product-overlay-storage` (zustand `persist`).
- Survives reloads and browser restarts.
- There is **no UI to reset the overlay** — clearing it means clearing that localStorage key (or
  `localStorage.clear()`).

## Gotchas

- **The overlay is per-browser, not per-user or global.** Two browsers/devices see different
  catalogs; nothing is shared.
- **Edits are full-product snapshots**, not field patches. `editProduct` receives the entire product
  object; a stale snapshot would overwrite newer fields.
- **Ordering in `mergeProducts` is load-bearing.** Filtering deleted before applying edits means a
  deleted product's edit is irrelevant (and cleaned up on delete). Reordering these steps changes
  behavior.
- **Ids must stay numeric and unique.** `edited` is `Record<number, Product>` and `deletedIds` is
  `number[]`; `Date.now()` collisions are theoretically possible if two products were added in the
  same millisecond.
- **Don't bypass the hook.** Reading `fetchProducts()` directly shows the raw API catalog with none
  of the admin changes.

## Constraints / non-goals

- No backend, database, or sync — localStorage only, by design.
- No conflict resolution, versioning, or multi-user merge.
- No reset/export UI.
- No automated tests (the project has no test suite by design).

## Possible future extensions (not implemented)

- A "reset demo data" action that clears the overlay key.
- A more collision-resistant id scheme (e.g. `crypto.randomUUID()` with a string id type).
- Deduplicating `deletedIds` or switching it to a `Set` in persisted state.
- Optimistic-UI status flags (e.g. marking a product as "unsaved to server").

## Related docs

- [Storefront](./storefront.md) — the primary read consumer of merged products.
- [Admin product CRUD](./admin-product-crud.md) — the primary writer.
