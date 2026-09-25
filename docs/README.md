# Feature Documentation

Per-feature documentation for ShopEasy. Each feature gets its own file under
`docs/features/<feature-slug>.md` using the template below.

- **[Architecture overview](./architecture.md)** — start here: stack, data flow, stores, conventions.
- **[Tech stack & tooling](./tech-stack.md)** — exact resolved versions, config, and scripts.

## Index

| Feature            | Doc                                                                  | Status                   |
| ------------------ | -------------------------------------------------------------------- | ------------------------ |
| Storefront         | [features/storefront.md](./features/storefront.md)                   | Implemented (demo-scope) |
| Product overlay    | [features/product-overlay.md](./features/product-overlay.md)         | Implemented (demo-scope) |
| Admin auth         | [features/admin-auth.md](./features/admin-auth.md)                   | Implemented (mock)       |
| Admin product CRUD | [features/admin-product-crud.md](./features/admin-product-crud.md)   | Implemented (demo-scope) |
| Shopping cart      | [features/shopping-cart.md](./features/shopping-cart.md)             | Implemented (demo-scope) |
| Guest checkout     | [features/guest-checkout.md](./features/guest-checkout.md)           | Implemented (demo-scope) |
| Routing & layouts  | [features/routing-and-layouts.md](./features/routing-and-layouts.md) | Implemented              |

## Template

New feature docs should follow this structure (see `features/guest-checkout.md` for a filled-in
example):

```markdown
# Feature: <Name>

**Status:** Implemented / In progress / Planned
**Last updated:** YYYY-MM-DD

## Summary

What the feature does, in a paragraph.

## Why it works this way

Design rationale, constraints, links to relevant AGENTS.md rules.

## User flow

Step-by-step flow, with the routes/files involved.

## Key implementation details

Files, types, stores, helpers, and notable code.

## Gotchas

Anything easy to break or non-obvious.

## Constraints / non-goals

What is deliberately out of scope.

## Possible future extensions (not implemented)

Ideas that were considered but not built.
```
