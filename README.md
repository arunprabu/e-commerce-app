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

## Engineering principles

This project is maintained to a production-ready standard. Every change should follow the
existing architecture, patterns, and conventions, and be organized so the codebase stays easy to
maintain.

- **Follow the established architecture.** Respect the layering already in place: `api/`
  (transport) → `lib/` (pure domain logic) → `hooks/` (React data access) → `store/` (client
  state) → `components/` + `pages/` (presentation). Don't bypass a layer — e.g. never call the API
  client directly from a page; go through `useProducts`.
- **Reuse before you build.** Prefer existing stores, hooks, helpers, and shadcn/ui primitives over
  new ones. Introduce a new abstraction only when there's a concrete, present need.
- **Apply the right design pattern deliberately.** Match the pattern already used for the problem
  (zustand `persist` for durable client state, an overlay/merge strategy for non-persisting APIs, a
  route guard component for auth). If a better pattern is warranted, explain the trade-off first.
- **Keep it type-safe and strict.** Honor `verbatimModuleSyntax` (`import type` for types),
  `noUnusedLocals`/`noUnusedParameters`, and the `@/*` path alias. Avoid `any`.
- **Organize for maintainability.** Put code where its responsibility belongs, keep modules small
  and single-purpose, name things clearly, and avoid duplication. Update the matching `docs/` page
  when behavior or architecture changes.
- **Validate before you're done.** Run `npm run build` (or at least `npm run lint`) after
  non-trivial changes and fix all errors.
- **Stay in scope.** Make the smallest change that fully solves the task; don't refactor unrelated
  code or add unrequested features, tests, or dependencies.

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
