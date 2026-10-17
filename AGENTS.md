# AGENTS.md

## What this repo is

PWA for a nail salon: inventory + services + point of sale ("pymeapp",
formerly the Expo app "NailApp").

- Stack: SvelteKit 3 + Svelte 5 (runes) + Tailwind v4 + Prisma 7 + PostgreSQL
  (Prisma Postgres), with Lucide icons (`@lucide/svelte`) and auto-animate
  (`@formkit/auto-animate`). Package manager is pnpm; the project is ESM
  (`"type": "module"`).
- `legacy/` is the previous Expo / React Native app. Treat it as the **reference
  source to port domain logic and UI from**. Do not import from it, build it, or
  run its scripts. It has its own `package.json`, `node_modules`, tsconfig, and
  `@/` alias (mapped to the `legacy/` root — not the project alias).
- Phases: data layer first, **auth (Better Auth) comes later**. There is no auth
  yet, so nothing is protected — do not deploy this publicly as-is.
- Deploy target is Vercel, but `vite.config.ts` still uses `adapter-auto`. Switch
  it to `@sveltejs/adapter-vercel` only when wiring up deployment.
- `git status` shows the old app's files as deleted and `legacy/` as untracked.
  That is the intended migration state.

## Commands

Use pnpm (`pnpm-lock.yaml`; `.npmrc` sets `engine-strict=true`).

- `pnpm dev` (runs `prisma generate` first)
- `pnpm build` (runs `prisma generate` first), `pnpm preview`
- `pnpm check` / `pnpm check:watch` — the typecheck; both run `prisma generate`
  first
- Database:
  - `pnpm db:dev` — start the local Prisma Postgres (`prisma dev`). Run detached
    with `pnpm prisma dev -d`; stop with `pnpm db:stop`.
  - `pnpm db:generate` — regenerate the Prisma client (see below)
  - `pnpm db:migrate` (dev) · `pnpm db:deploy` (prod) · `pnpm db:seed` · `pnpm db:studio`
- `pnpm lint` (Biome check) · `pnpm lint:fix` (Biome check --write) ·
  `pnpm format` (Biome format --write). Biome uses tabs and double quotes
  (`biome.json`) and scans everything except `legacy/`. There is **no test
  runner** — do not invent `pnpm test`.

## Local database

- `.env` (gitignored) points at the local `prisma dev` Postgres on
  `localhost:51214`. Start from `.env.example`.
- Fresh setup order: `pnpm install` → `pnpm db:dev` → `pnpm db:generate` →
  `pnpm db:migrate` → `pnpm db:seed`.
- The generated Prisma client lives in `src/lib/shared/server/generated/prisma/`
  and is **gitignored** (run `pnpm db:generate` after cloning). Import it from
  `.../generated/prisma/client`. Use the singleton in
  `src/lib/shared/server/prisma.ts` and never import it from client code.
- `prisma.config.ts` holds the datasource URL and seed command; migrations live
  in `prisma/migrations/` (committed).
- After changing `prisma/schema.prisma`, run `pnpm db:generate` **and restart the
  dev server** — the Prisma client singleton is cached on `globalThis`, so HMR
  won't pick up a regenerated client and Prisma throws `Unknown argument`. A
  fresh `pnpm dev` regenerates automatically.

## SvelteKit 3 quirks (they differ from most tutorials / SvelteKit 2)

- Environment variables are declared in `src/env.ts` with `defineEnvVars` and
  imported from `$app/env/private` (server) or `$app/env/public` (client). There
  is no `$env/dynamic/*` or `$env/static/*` module.
- `$app/environment` no longer exists — use `$app/env` (`dev`, `browser`,
  `building`, `version`).
- `$lib` no longer exists — use `#lib` (defined in `package.json` `imports`).
  TypeScript cannot resolve the extensionless `#lib/*` target, so `tsconfig.json`
  adds a manual `paths` map; keep `imports` and `paths` in sync when adding
  aliases.
- Runes mode is forced for every non-`node_modules` file (see `vite.config.ts`).
  Use `$state`, `$props`, `$derived`, `$effect` — not `export let` or stores.

## App structure

- Code is organized by feature module under `src/lib/`: `categories/`,
  `products/`, `cart/`, `history/`, `settings/` and `shared/`.
- Each module has `dtos.ts` (Zod schemas + inferred types), `services.ts`
  (a singleton service class, server-only) and `components/`. Service methods are
  `public async` with explicit return types (Prisma model / payload types), and
  their parameters use the zod-inferred DTO types (`CategoryInput`,
  `SubcategoryInput`, `ProductInput`, `CheckoutInput`, `DateRange`) — never inline
  object literals.
- Services (exported singletons): `categoriesService` (categories +
  subcategories), `productsService` (products + archiving), `cartService.checkout()`
  (records sales), `historyService.list(range)`. `buildCatalog()`
  (`categories/catalog.ts`) composes the navigation tree from categories +
  products, keeping responsibilities separate.
- Routes (`src/routes/*`) stay thin: `load` calls services, the page renders
  module components. Route paths are in English while UI text stays Spanish:
  `/` (POS), `/inventory`, `/history`, `/settings`.
- Client persistence goes through `LocalStorage`
  (`src/lib/shared/local-storage.ts`), a static-only class that does the JSON
  parse/stringify and no-ops on the server. Keys live in `STORAGE_KEYS`
  (`pymeapp:cart`, `pymeapp:settings`). The `app.html` pre-paint script still
  reads `localStorage` directly.
- Server-only code (`shared/server/prisma.ts`, every `services.ts`, `catalog.ts`)
  must never be imported from client code.
- The cart is client state in `src/lib/cart/cart.svelte.ts` (runes + localStorage),
  hydrated once from the layout via `$effect`. Do **not** clear it from an
  `$effect` — that loops with `effect_update_depth_exceeded`; clear it in the
  checkout form's `use:enhance` callback instead.
- Checkout posts the cart as JSON to `?/checkout`; `cartService` re-reads prices
  from the database, so client-sent prices are never trusted.
- Zod schemas live in each module's `dtos.ts` and use **Zod Mini**
  (`import * as z from "zod/mini"`); validators are functions passed to
  `.check(...)` (e.g. `z.trim()`, `z.minLength(1, msg)`), with `z.coerce`,
  `z.catch(schema, fallback)` and `z.refine`. `Money` and `DateTime` are value
  object classes in `src/lib/shared/value-objects/` (`static from`, `static
  format`, `toDisplay`). Date-range math for the history lives in
  `src/lib/history/period.ts` and assumes the `America/Santiago` timezone for
  day/month boundaries (sales are stored in UTC).
- Form actions return `{ action, success, errors, values }`; the UI submits them
  with `use:enhance` + the shared `formHandler` (`src/lib/shared/form.ts`).
- **Import order is manual** (Biome's `organizeImports` is intentionally off, and
  it's removed from the Zed format actions too). Blocks separated by a blank line,
  each sorted by imported-name length ascending; `default`, `named` and `type` are
  each split into external packages first, then `#lib`/relative:
  (1) side-effect, (2) default external, (3) default local, (4) named external,
  (5) named local, (6) `import type` external, (7) `import type` local.

### UI

- Mobile-first: a centered `max-w-md` column (`+layout.svelte`) with a fixed
  bottom nav (`src/lib/shared/components/BottomNav.svelte`) and iOS safe-area
  padding (top inset on the headers, bottom on the nav).
- Shared components live in `src/lib/shared/components/` (`BottomNav`,
  `BottomSheet`, `PageHeader`, `Toasts`, `Confetti`); toasts are a store in
  `src/lib/shared/toast.svelte.ts`.
- Module components: `categories/components/` (`CategoryIcon`, `CategoryTabs`,
  `CategoryForm`, `SubcategoryForm`), `products/components/ProductForm.svelte`,
  `cart/components/` (`ProductCard`, `CartBar`, `CartSheet`),
  `history/components/SaleCard.svelte`.
- Tailwind v4 tokens live in `src/routes/layout.css`: brand scale
  `--color-primary-50..900` (`#6300a6` = `primary-600`), plus `--color-primary`
  and the `animate-pop` / `animate-fade-up` keyframes. Prefer `bg-primary-600`,
  `text-primary-600`, etc.
- Motion uses Svelte transitions, `@formkit/auto-animate` on lists, and route
  changes wrapped in `document.startViewTransition` via `onNavigate` in the
  layout. `prefers-reduced-motion` is respected globally in `layout.css`.
- Subcategories carry an `icon` (Lucide name) and a `tone` (0–7); categories are
  the top-level tabs (`src/lib/categories/components/CategoryTabs.svelte`). The
  color is derived from the accent via `accentTones()` in
  `src/lib/settings/palette.ts`, so changing the accent in Ajustes re-themes every
  subcategory. Render the icon via `CategoryIcon.svelte`; apply the color with
  inline styles and `tint()` (Tailwind can't generate colors at runtime).
- Settings live in `src/lib/settings/settings.svelte.ts` (localStorage:
  `storeName`, `accent`, `uiScale`, `radius`, derived `palette`). `applySettings`
  overrides `--color-primary-*`, the `--radius-*` scale and the root font size on
  `<html>`; a small pre-paint inline script in `src/app.html` applies them early to
  avoid a flash. The `/settings` screen edits them.
- Radii are tokenized: `rounded-lg/xl/2xl/3xl` and `rounded-pill` (used app-wide
  instead of `rounded-full`) read `--radius-*`, so the "Redondeo" profile can
  change every corner at runtime.
- Sale celebration: `confetti.fire()` (`src/lib/shared/confetti.svelte.ts`) drives
  `Confetti.svelte` — a dependency-free CSS burst, skipped under reduced motion.

## Domain

- UI is in Spanish. Prices are integer Chilean pesos (CLP, no decimals); format
  with `Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" })`.
- Data model (`prisma/schema.prisma`): `Category` → `Subcategory` (with `icon` +
  `tone`) → `Product` → `SaleItem`. Only subcategories carry `tone` (color derived
  from the accent). `SaleItem` snapshots `name` and `price` so sales history stays
  correct even if a product is renamed, re-priced, or deleted. Seed data is ported
  from `legacy/lib/db.ts`.
- Deletes are **soft**: `deletedAt` on `Category`/`Subcategory`/`Product`. Deleting
  a category/subcategory archives its children too; queries filter
  `deletedAt: null` and archived products can't be sold. Sales history is never
  touched.
