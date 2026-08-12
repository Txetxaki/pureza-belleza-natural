# Pureza

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm run build
```

**Always use `npm run build`, not `ng build` / `npx ng build`** — see "Build & CI" below for why: a
bare `ng build` silently skips the SEO keyword-uniqueness gate and the sitemap generator.

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

See the dedicated "End-to-end tests" section below — this project uses Playwright, run against the
real build output, not `ng e2e` (Angular CLI ships no e2e framework by default).

## End-to-end tests

This project uses [Playwright](https://playwright.dev/) for e2e/visual/accessibility testing, run
against the **real prerendered build** (not `ng serve`):

```bash
npm run build   # required first — see "Build & CI" below
npx playwright install --with-deps chromium   # first time only
npm run e2e
```

`playwright.config.ts`'s `webServer` starts `scripts/serve-dist.mjs`, a minimal static file server
for `dist/pureza/browser/` — it does **not** rebuild the app. The suite covers: axe-core WCAG 2.2 AA
scans, zero eager requests to font CDNs/Maps domains, desktop + mobile visual snapshots (baselines
committed under `e2e/*-snapshots/`), the click-to-load static map fallback, and the canonical-URL ↔
sitemap.xml cross-check (design.md risk E).

## Lighthouse audit (verify-phase gate)

`openspec/config.yaml`'s `phase_rules.verify` requires a "Lighthouse SEO/perf pass". This was run
for real on **2026-08-12** against a fresh `npm run build`, served locally with
`node scripts/serve-dist.mjs` (the same static server Playwright's e2e suite uses), via
`npx lighthouse` (v13.4.1, headless Chrome, default mobile/simulated-throttling config — the same
profile Lighthouse/PageSpeed Insights uses by default). Condensed, durable results (category scores
+ Core Web Vitals + any sub-100 audit) are committed at `lighthouse-reports/home.json` and
`lighthouse-reports/contacto.json`; the full raw Lighthouse JSON (~450 KB each, mostly a base64
screenshot and internal trace data) was not committed.

| Route       | Performance | Accessibility | Best Practices | SEO |
|-------------|:-----------:|:--------------:|:---------------:|:---:|
| `/`         | 68          | 100            | 100             | 100 |
| `/contacto` | 82          | 100            | 100             | 100 |

- **Accessibility, Best Practices, SEO: 100/100 on both routes.** This confirms `config.yaml`'s
  WCAG 2.2 AA and SEO gates end-to-end (the same result the axe-core Playwright suite already
  asserts, now cross-confirmed by Lighthouse's independent audit engine).
- **Performance is not 100 and that's expected, not a defect.** Lighthouse's default profile
  simulates a mid-tier mobile device on a throttled ~1.6 Mbps connection (`cpuSlowdownMultiplier: 4`,
  `rttMs: 150`) — real page weight is measured against that, not local network speed. The `/` score
  (68) is lower than `/contacto` (82) because the home route ships the LCP hero portrait plus 5
  below-the-fold "atmósfera" images; `pz-picture` (`src/app/shared/ui/pz-picture/pz-picture.ts`)
  already does the correct thing — `loading="lazy"` + `decoding="async"` on every non-hero image,
  `fetchpriority="high"` + eager only on the hero — and every image already ships as `avif`/`webp`
  next-gen variants (`scripts/generate-image-variants.mjs`). The remaining weight is the AI
  placeholder photography itself (real image bytes: 6 photos × ~35-53 KB avif each), which design
  decision #2259 explicitly defers until the real photoshoot lands (`apply` rule in
  `openspec/config.yaml`: "No stock photography ... placeholder/defer image work until the
  photoshoot asset is available"). The one remaining generic finding (`unused-javascript`, ~100 KiB
  estimated savings on both routes) is normal Angular framework overhead for a 2-route app, not a
  `foundation`-scope defect. No code change was made for this reason — chasing a perfect performance
  score here would mean either optimizing images that are about to be replaced by real content (the
  `content` change) or non-trivial framework-level bundle work outside this change's scope.

## Build & CI

**CI must always run `npm run build`, never a bare `ng build` / `npx ng build`.** `npm run build`
chains three steps via npm's `pre`/`postbuild` lifecycle hooks:

1. `prebuild` — `scripts/validate-keyword-uniqueness.mjs` (fails the build on a duplicate SEO
   keyword/path/planta or an out-of-budget title/description — design.md risk D), then
   `scripts/generate-image-variants.mjs` (derives every `{base}-{width}.{format}` image).
2. `build` — the actual `ng build` (SSR + prerender).
3. `postbuild` — `scripts/generate-sitemap.mjs`, which fails loudly if a `status: 'live'` route in
   the registry didn't actually get prerendered.

Invoking `ng build` (or `npx ng build`) directly skips **all three** of the above — the
keyword-uniqueness gate can't stop a bad deploy, and no `sitemap.xml` is written. There is no
current CI workflow file in this repo (`foundation` ships the app, not its pipeline) — when one is
added, its build step must invoke `npm run build`, and this note should move to a comment in that
file alongside the command.

## Design-system notes

- **`angular.json`'s `optimization.fonts` must stay `false`.** Angular's `fonts.inline: true` only
  inlines the Google/Adobe Fonts **CSS** — the `@font-face src` inside that CSS still points at
  `fonts.gstatic.com`, an external runtime request this project forbids (design.md §2). Fonts are
  self-hosted from `public/fonts/` (`src/styles/_typography.scss`'s hand-written `@font-face` rules)
  specifically so no such CSS ever exists to inline in the first place. Do not remove the `fonts:
  { inline: false }` line or its guard comment in `angular.json`.
- **`src/styles/_tokens.scss` is the sole hex-color source of truth** (design.md §1 — 4 neutral
  roles + 5 plant accents, each with a `-live`/`-text` pair). Components read the generic
  `--pz-accent-live`/`--pz-accent-text` pair, never a plant-specific token or a literal hex value; a
  `[data-planta="…"]` scope on an ancestor rebinds those two properties to one plant.
- **`info/direccion-diseno.build.SUPERSEDED-v2.html` is historical only** — an earlier mockup
  iteration with a different (rejected) token set. `openspec/changes/foundation/design.md` is the
  canonical design reference; do not copy values from the superseded file.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
