A minimal e-commerce demo built with React, TypeScript, Vite, Tailwind CSS, and shadcn/ui, backed by the [Fake Store API](https://fakestoreapi.com/products).

## Features

**Storefront (guest, no login required)**

- Browse products, filter by category, search by title
- Product detail page with quantity selector
- Cart (persisted in `localStorage`)
- Guest checkout — order summary + "Place order" → confirmation page

**Admin** (`/admin/login`)

- Mock login — no real backend auth. Credentials: `admin` / `admin123`
- List, search, add, edit, and delete products

## Getting started

```bash
npm install
npm run dev
```

Build for production with `npm run build`.

## Key decisions

- **fakestoreapi doesn't persist writes.** `POST`/`PUT`/`DELETE` calls are still made to the API, but since it never actually saves changes server-side, admin add/edit/delete actions are also stored in a `localStorage` overlay (`src/store/productOverlayStore.ts`) and merged over the base API data (`src/lib/products.ts`) so changes survive a page refresh in this browser.
- **Admin auth is a client-side mock** (`src/store/authStore.ts`) — there is no real backend, so this is not a real security boundary.
- **Checkout is intentionally minimal** — no shipping form or payment fields, just an order summary and a "Place order" button that generates a mock order ID.
- No automated tests, per project scope.

## Project structure

```
src/
  api/        fakestoreapi client (fetch/create/update/delete)
  store/      zustand stores: cart, admin auth, product overlay
  hooks/      useProducts — merges API data with local admin changes
  components/ layout, product cards, admin dialogs, shadcn/ui primitives
  pages/      storefront/ and admin/ route pages
  routes/     react-router route table + admin auth guard
  types/      Product, CartItem, Order
```
