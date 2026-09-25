# Tech stack & tooling

**Last updated:** 2026-09-25

Exact versions and tooling for ShopEasy. Versions below are the **resolved** versions from
`package-lock.json` (what `npm install` actually installs), not the semver ranges in
`package.json`. Ranges are shown alongside for reference.

## Runtime & package manager

| Tool    | Version      | Notes                                                                     |
| ------- | ------------ | ------------------------------------------------------------------------- |
| Node.js | **v24.11.1** | Verified locally. No `.nvmrc` / `engines` pin — any Node 20+ should work. |
| npm     | **11.6.2**   | Lockfile is `package-lock.json` (lockfileVersion 3). No pnpm/yarn.        |

## Core framework

| Concern      | Package                | `package.json` range | Resolved   |
| ------------ | ---------------------- | -------------------- | ---------- |
| Build tool   | `vite`                 | `^8.3.0`             | **8.3.0**  |
| React plugin | `@vitejs/plugin-react` | `^6.1.1`             | **6.1.1**  |
| UI library   | `react`                | `^19.2.8`            | **19.3.0** |
| UI library   | `react-dom`            | `^19.2.8`            | **19.3.0** |
| Language     | `typescript`           | `~6.0.2`             | **6.0.3**  |
| Routing      | `react-router-dom`     | `^7.18.4`            | **7.18.4** |
| State        | `zustand`              | `^5.0.15`            | **5.0.15** |

## Styling & UI

| Concern                 | Package                      | `package.json` range | Resolved   |
| ----------------------- | ---------------------------- | -------------------- | ---------- |
| CSS framework           | `tailwindcss`                | `^4.3.3`             | **4.3.3**  |
| Tailwind Vite plugin    | `@tailwindcss/vite`          | `^4.3.3`             | **4.3.3**  |
| Animation utilities     | `tw-animate-css`             | `^1.4.0`             | **1.4.0**  |
| Component primitives    | `radix-ui`                   | `^1.6.7`             | **1.6.7**  |
| Component CLI / runtime | `shadcn`                     | `^4.21.0`            | **4.21.0** |
| Variant helper          | `class-variance-authority`   | `^0.7.1`             | **0.7.1**  |
| Class merge helper      | `cn`                         | `^0.4.0`             | **0.4.0**  |
| Icons                   | `lucide-react`               | `^1.48.0`            | **1.48.0** |
| Toasts                  | `sonner`                     | `^2.0.8`             | **2.0.8**  |
| Theme handling          | `next-themes`                | `^0.4.6`             | **0.4.6**  |
| Font                    | `@fontsource-variable/inter` | `^5.3.0`             | **5.3.0**  |

### Styling setup

- Tailwind v4 is wired through the Vite plugin (`@tailwindcss/vite`) — **no `tailwind.config.js`**.
  Theme tokens live in `src/index.css` via `@theme inline { ... }` and CSS variables.
- `src/index.css` imports, in order: `tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css`,
  `@fontsource-variable/inter`.
- Dark mode uses a custom variant: `@custom-variant dark (&:is(.dark *))`.
- Font stack: `--font-sans: 'Inter Variable', sans-serif` (Inter Variable, self-hosted via
  `@fontsource-variable/inter`).
- `cn` is **not** defined inline in `src/lib/utils.ts` — it re-exports from the `cn` npm package
  (which wraps `clsx` + `tailwind-merge`).

### shadcn/ui configuration (`components.json`)

| Setting       | Value                                                                |
| ------------- | -------------------------------------------------------------------- |
| Style         | `radix-vega`                                                         |
| Base color    | `neutral`                                                            |
| CSS variables | enabled                                                              |
| CSS entry     | `src/index.css`                                                      |
| Icon library  | `lucide`                                                             |
| RSC           | `false`                                                              |
| Aliases       | `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks` |

Primitives live in `src/components/ui/` (`alert`, `badge`, `button`, `card`, `dialog`, `input`,
`label`, `select`, `separator`, `skeleton`, `sonner`, `table`, `textarea`). Add more with
`npx shadcn@latest add <component> --yes`.

## Linting

| Package                       | `package.json` range | Resolved    |
| ----------------------------- | -------------------- | ----------- |
| `eslint`                      | `^10.10.0`           | **10.11.0** |
| `typescript-eslint`           | `^8.69.0`            | **8.70.1**  |
| `@eslint/js`                  | `^10.0.1`            | **10.0.1**  |
| `eslint-plugin-react-hooks`   | `^7.1.1`             | **7.1.1**   |
| `eslint-plugin-react-refresh` | `^0.5.6`             | **0.5.7**   |
| `globals`                     | `^17.12.0`           | **17.12.0** |

`eslint.config.js` uses the flat config format (`defineConfig` + `globalIgnores(['dist'])`) and
extends `js.configs.recommended`, `tseslint.configs.recommended`,
`reactHooks.configs.flat.recommended`, and `reactRefresh.configs.vite` over `**/*.{ts,tsx}`.

## Type definitions

| Package            | `package.json` range | Resolved    |
| ------------------ | -------------------- | ----------- |
| `@types/node`      | `^24.13.6`           | **24.13.6** |
| `@types/react`     | `^19.2.18`           | **19.3.0**  |
| `@types/react-dom` | `^19.2.7`            | **19.3.0**  |

## TypeScript configuration

Three-project setup: `tsconfig.json` is a solution file with `references` to `tsconfig.app.json`
(app code, `include: ["src"]`) and `tsconfig.node.json` (build tooling, `include: ["vite.config.ts"]`).

Shared compiler options:

| Option                       | Value                                           |
| ---------------------------- | ----------------------------------------------- |
| `target`                     | `es2023`                                        |
| `lib`                        | `["ES2023", "DOM"]` (app) / `["ES2023"]` (node) |
| `module`                     | `esnext` (app) / `nodenext` (node)              |
| `moduleResolution`           | `bundler` (app)                                 |
| `jsx`                        | `react-jsx`                                     |
| `verbatimModuleSyntax`       | `true`                                          |
| `moduleDetection`            | `force`                                         |
| `allowImportingTsExtensions` | `true`                                          |
| `noEmit`                     | `true`                                          |
| `skipLibCheck`               | `true`                                          |
| `noUnusedLocals`             | `true`                                          |
| `noUnusedParameters`         | `true`                                          |
| `erasableSyntaxOnly`         | `true`                                          |
| `noFallthroughCasesInSwitch` | `true`                                          |

Notable:

- **No `baseUrl`** — deprecated in TypeScript 6.0 (TS5101). The `@/*` → `./src/*` alias is declared
  in `paths` only, which resolves relative to the tsconfig file under `moduleResolution: "bundler"`.
- `verbatimModuleSyntax: true` means type-only imports **must** use `import type { Foo } from '...'`.
- `noUnusedLocals` means you can't destructure-and-discard a key (`const { key: _, ...rest } = obj`);
  copy the object and `delete rest.key` instead.

## Vite configuration (`vite.config.ts`)

- Plugins: `react()`, `tailwindcss()`.
- Alias: `@` → `path.resolve(import.meta.dirname, "./src")` (uses `import.meta.dirname`, not
  `__dirname`, to avoid Vite 8's native config-loader warning).
- No custom `server`, `build`, or `env` config — defaults apply.

## Scripts

| Script    | Command                | Purpose                             |
| --------- | ---------------------- | ----------------------------------- |
| `dev`     | `vite`                 | Start the dev server                |
| `build`   | `tsc -b && vite build` | Type-check all projects, then build |
| `lint`    | `eslint .`             | Lint the whole repo                 |
| `preview` | `vite preview`         | Serve a production build locally    |

Run `npm run build` (or at least `npm run lint`) after non-trivial changes.

## Not present (by design)

Per `AGENTS.md`, this is a training/demo project — the following are deliberately absent:

- No test runner or test framework (no Vitest, Jest, Playwright, Testing Library).
- No CI/CD configuration.
- No formatter config (no Prettier / Biome) — ESLint only.
- No backend, database, or payment SDK.
- No SSR framework (Next.js/Remix) — plain client-side SPA.
- No Node version pin (`.nvmrc` / `engines`).

## External services

| Service                                             | Usage                                                                                                                        |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| [Fake Store API](https://fakestoreapi.com/products) | Product data source. `GET` is the only meaningful operation; `POST`/`PUT`/`DELETE` are called but never persist server-side. |

## Related docs

- [`architecture.md`](./architecture.md) — system context, data flow, stores, conventions.
- [`README.md`](./README.md) — feature doc index and template.
- `AGENTS.md` — agent instructions and the environment-file policy.
