# Feature: Admin authentication

**Status:** Implemented (mock / demo-scope)
**Last updated:** 2026-09-25

## Summary

A minimal client-side login that gates the admin panel. Credentials are hardcoded
(`admin` / `admin123`), the authenticated flag is stored in localStorage, and a route guard
redirects unauthenticated users to the login page. **This is not a real security boundary.**

## Why it works this way

The app has no backend, so there is nothing to authenticate against. Rather than skip the concept
entirely, auth is mocked so the admin flow feels realistic: a login screen, a persisted session, a
protected route tree, and a logout action. `AGENTS.md` is explicit that this must not be "hardened"
unless asked — the mock is intentional, and the credentials are even shown on the login card.

## User flow

```
/admin/login   AdminLoginPage     enter credentials → /admin/products
/admin/*       RequireAdminAuth   redirects to /admin/login when not authenticated
/admin/products AdminLayout       header with "View store" + "Log out"
```

1. Visiting any `/admin/*` route while unauthenticated redirects to `/admin/login`.
2. The login card states the demo credentials (`admin` / `admin123`).
3. Correct credentials set `isAuthenticated: true`, persist, and navigate to `/admin/products`.
4. Wrong credentials show an inline destructive alert: _"Invalid username or password."_
5. "Log out" in the admin header clears the flag and navigates back to `/admin/login`.
6. If already authenticated and the user opens `/admin/login`, they are redirected straight to
   `/admin/products`.

## Key implementation details

### The store

`src/store/authStore.ts` — zustand with `persist`, storage key `admin-auth-storage`.

```ts
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

interface AuthState {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}
```

- `login` compares against the constants, sets `isAuthenticated: true` on success, and **returns a
  boolean** so the caller can branch on it (the login page uses this to show the error).
- `logout` sets `isAuthenticated: false`.
- Only the boolean is persisted — credentials live in the bundle, not storage.

### The route guard

`src/routes/RequireAdminAuth.tsx` — a simple wrapper component:

```tsx
const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
return children;
```

It wraps the nested `/admin` route in `AppRoutes`, so the guard applies to the whole admin tree
(products list, add, edit). Note it guards the **route tree**, not the individual components.

### The login page

`src/pages/admin/AdminLoginPage.tsx`:

- Local state for `username`, `password`, and `error`.
- Early `<Navigate to="/admin/products" replace />` when already authenticated.
- `handleSubmit` calls `login(...)`; on `false`, sets the error message.
- Uses shadcn/ui `Card`, `Input`, `Label`, `Alert`, and `Button`; username field is `autoFocus`.

### Logout

`src/components/layout/AdminLayout.tsx` header button calls `logout()` then
`navigate("/admin/login")` — both, since `logout` only clears state.

## Gotchas

- **It is not security.** Anyone can read the credentials from the login UI or the bundle, and the
  flag can be set by hand in localStorage (`admin-auth-storage`). Don't treat it as a boundary.
- **The guard is route-level, not data-level.** API calls in admin pages are not authenticated at
  all — the Fake Store API is public and read-only.
- **Login returns a boolean, it doesn't navigate.** The page is responsible for navigation; keep
  that split if you refactor.
- **Persisted flag survives reloads** — to "log out" for testing, use the button or clear the
  `admin-auth-storage` key.

## Constraints / non-goals

- No real backend auth, tokens, sessions, expiry, or refresh.
- No user accounts, roles, or permissions.
- No password hashing or storage.
- No "remember me", password reset, or rate limiting.
- Login, protected-route, redirect, and logout flows are covered by
  `src/routes/AppRoutes.test.tsx`; the mock auth store is covered by
  `src/store/authStore.test.ts`.

## Possible future extensions (not implemented)

- Move credentials to an env var (`.env.example` only, per the repo policy) if this were ever more
  than a demo.
- Replace the mock with a real auth provider — a deliberate, larger change requiring a backend.
- Add session expiry / idle timeout.
- Role-based access (e.g. read-only vs. full CRUD admins).

## Related docs

- [Admin product CRUD](./admin-product-crud.md) — the protected feature behind this guard.
