# AGENTS.md — e-commerce-app (ShopEasy)

Instructions for GitHub Copilot and other AI coding agents working in this repository.

## Project overview

ShopEasy is a minimal e-commerce demo app: a storefront (browse, search, cart, guest
checkout) plus a mock admin panel (login, product CRUD), backed by the public
[Fake Store API](https://fakestoreapi.com/products). It's a training/course project, not a
production system — there is no real backend, no real auth, and no payment processing.

## Engineering principles (apply to every change)

Every change you make must be **production-ready** and easy to maintain. Before writing code,
read the surrounding code and the relevant `docs/` page, then follow the existing architecture,
patterns, and conventions rather than inventing new ones.

- **Follow the established architecture.** Respect the layering already in place: `api/` (transport)
  → `lib/` (pure domain logic) → `hooks/` (React data access) → `store/` (client state) →
  `components/` + `pages/` (presentation). Don't bypass a layer (e.g. never call the API client
  directly from a page — go through `useProducts`).
- **Reuse before you build.** Prefer existing stores, hooks, helpers, and shadcn/ui primitives over
  new ones. Only introduce a new abstraction when there's a concrete, present need — not a
  speculative one.
- **Apply the right design pattern deliberately.** Match the pattern already used for the problem
  (e.g. zustand `persist` for durable client state, an overlay/merge strategy for non-persisting
  APIs, a route guard component for auth). If a genuinely better pattern is warranted, explain the
  trade-off before adopting it.
- **Keep it type-safe and strict.** Honor `verbatimModuleSyntax` (`import type` for types),
  `noUnusedLocals`/`noUnusedParameters`, and the `@/*` path alias. No `any` unless unavoidable and
  justified.
- **Organize for maintainability.** Put code where its responsibility belongs, keep modules small
  and single-purpose, name things clearly, and avoid duplication. Update the matching `docs/`
  page when behavior or architecture changes.
- **Validate before you're done.** Run `npm run build` (or at least `npm run lint`) after
  non-trivial changes and fix all errors. Don't leave the tree in a broken state.
- **Stay in scope.** Make the smallest change that fully solves the task; don't refactor unrelated
  code or add unrequested features, tests, or dependencies.

## Tech stack

- **Build tool**: Vite 8
- **Framework**: React 19 + TypeScript (~6.0), strict compiler options
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` plugin)
- **UI components**: shadcn/ui (radix base) in `src/components/ui/`
- **Routing**: react-router-dom v7
- **State**: zustand v5 (with `persist` middleware for cart, auth, product overlay)
- **Icons**: lucide-react
- **Linting**: ESLint 10 + typescript-eslint

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — `tsc -b && vite build` (type-check then build)
- `npm run lint` — ESLint over the whole repo
- `npm run preview` — preview a production build

Always run `npm run build` (or at least `npm run lint`) after non-trivial changes and fix
any errors before considering a task done.

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

## Coding conventions

- Path alias `@/*` maps to `src/*`. There is **no** `baseUrl` in tsconfig (this TS version
  deprecates it) — `paths` alone works with `moduleResolution: "bundler"`.
- `verbatimModuleSyntax: true` — always use `import type { Foo } from '...'` for type-only
  imports, never a plain `import` for types.
- `noUnusedLocals` / `noUnusedParameters` are on. Don't destructure-and-discard a key with
  `const { key: _, ...rest } = obj` (unused var error) — copy the object and `delete
rest.key` instead.
- Match existing component style: function components, shadcn/ui primitives from
  `src/components/ui/` instead of hand-rolled markup for buttons/dialogs/inputs/etc.
- Keep `src/hooks/useProducts.ts` as the single read path for product data — don't call the
  API client directly from pages/components.

## Architecture decisions (already made — don't relitigate without being asked)

- **fakestoreapi doesn't persist writes.** POST/PUT/DELETE calls are still made, but since
  the API never actually saves changes server-side, admin add/edit/delete is layered on top
  via a localStorage overlay (`src/store/productOverlayStore.ts`) merged over fresh API data
  in `src/lib/products.ts`. New admin products get a client-generated id (`Date.now()`), not
  the API's returned id.
- **Admin auth is a client-side mock** (`src/store/authStore.ts`, hardcoded
  `admin`/`admin123`, persisted to localStorage). This is not a real security boundary —
  don't try to "harden" it unless explicitly asked.
- **Checkout is intentionally minimal** — no shipping/payment form, just an order summary
  and a "Place order" button.
- Categories are derived client-side from the product list, not a separate API call.
- No automated test suite exists, per project scope.

## Known gotcha

`CheckoutPage` has an `isPlacingOrder` guard flag around its cart-empty redirect `useEffect`.
Placing an order clears the cart before navigating to the confirmation page, which would
otherwise race with the "redirect to /cart if empty" effect and bounce the user back. Keep
that guard if you touch `CheckoutPage`.

## Environment files — read this before touching anything under `.env*`

This repo has `.env.example`, `.env.dev`, `.env.stage`, `.env.prod`, and `.env.test`.

- **Only `.env.example` may be read, opened, or edited.** It is the checked-in template and
  contains no real secrets.
- **Never read, open, print, quote, or otherwise access the contents of `.env.dev`,
  `.env.stage`, `.env.prod`, or `.env.test`.** They may contain real credentials/secrets.
  If a task seems to require their contents, stop and ask the user instead of opening them.
- Never commit real `.env.*` files or print their contents in chat, logs, or generated
  files. `.gitignore` already excludes all `.env.*` except `.env.example`.
- When adding a new environment variable, add it (with a placeholder/dummy value) to
  `.env.example` only, and mention to the user that the real per-environment files need to
  be updated manually.

## GitHub account

This repo is committed, pushed, and PR'd/merged using the personal GitHub account
(`arunprabu`), not any work account — use `gh auth switch --user arunprabu` and the
`git@github-personal:arunprabu/...` remote/SSH alias, and ensure local git commit identity
(`user.name`/`user.email`) matches `arunprabu`, not a work identity.

## Do

- Keep changes scoped to what's asked; this is a small demo app, not a place for
  speculative abstractions.
- Use existing zustand stores and hooks rather than introducing new state management.
- Follow the existing file/folder layout (`storefront/` vs `admin/` split in `pages/`,
  `types/` for shared interfaces, etc.).

## Don't

- Don't add a real backend, database, or payment integration unless explicitly requested.
- Don't add automated tests/CI unless explicitly requested (none exist today by design).
- Don't rename "ShopEasy" or restructure `src/` without being asked — it's a placeholder
  brand name but changing it is a deliberate, explicit task.
- Don't touch `.env.dev`, `.env.stage`, `.env.prod`, or `.env.test` (see above).
