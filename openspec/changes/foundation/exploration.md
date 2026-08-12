# Exploration — `foundation`

**Change:** Angular 22 scaffold + rendering strategy, design tokens, self-hosted typography, shared layout shell, SEO infrastructure, and two proof routes (`/`, `/contacto`).
**Date:** 2026-08-12
**Status:** complete
**Engram mirror:** `sdd/foundation/explore` (observation #2272, project `virginia`)

> This file is the OpenSpec half of the hybrid artifact store. It was written by the
> orchestrator because the exploration sub-agent had no write access to the filesystem.

---

## 1. Current state

Greenfield. The repository contains no source code. Substantive inputs:

| File | Role |
| --- | --- |
| `info/inicial.txt` | Client brief from Virginia (Spanish) |
| `info/virginia.jpeg` | Owner photo — phone snapshot, **not** launch-quality hero art |
| `info/estudio-pureza.html` | Strategy study: SEO architecture, keyword map, design tokens, CWV targets |
| `openspec/config.yaml` | Stack and phase rules recorded by `sdd-init` |

Tooling verified on the machine: Node 22.19.0, npm 11.11.0, git 2.51.0.
**The global Angular CLI is 21.0.3, not 22** — scaffolding must pin the version
explicitly (`npx @angular/cli@22 new`) or the project is generated on the previous major.

---

## 2. Verified technical findings

Every version-specific claim below was checked against a current source in August 2026.
Items marked *assumption* were not verifiable and are deferred to the design phase.

### 2.1 Angular SSR on Vercel — no first-party support

Vercel's framework infrastructure support matrix (`vercel.com/docs/frameworks`,
updated 2026-06-16) lists Next.js, SvelteKit, Nuxt, TanStack, Astro, Remix, Vite and CRA.
**There is no Angular row.** Vercel's own Angular deployment guide covers only static
CLI builds and never mentions `@angular/ssr`, `RenderMode`, or hybrid rendering.

`"angular"` is a recognised framework slug in Vercel's project configuration, but it
only drives static build detection (`ng build` → `dist/<project>/browser`). It does not
provision a Node server.

The community workaround wraps the Angular SSR Express server in `api/index.js` plus a
`vercel.json` that rewrites every request to that single function. That pattern routes
**prerendered routes through the serverless function too**, which defeats the
"static routes served free from the CDN" assumption the strategy study relies on.

**Confirmed `@angular/ssr` API surface in v22:**

```ts
// app.routes.server.ts
export const serverRoutes: ServerRoute[] = [
  { path: '',         renderMode: RenderMode.Prerender },
  { path: 'contacto', renderMode: RenderMode.Prerender },
];

// app.config.server.ts
providers: [provideServerRendering(withRoutes(serverRoutes))]
```

- `RenderMode` = `{ Client, Server, Prerender }`.
- `getPrerenderParams()` drives parameterised prerender routes; `inject()` inside it
  must be called synchronously.
- `provideServerRendering()` gained a `maxResponseBodySize` option in v22 (default 1 MB).
- **Incremental hydration is the default in v22**; `withIncrementalHydration()` is
  deprecated as redundant. This confirms `@defer (on viewport)` is production-ready.

### 2.2 Self-hosted fonts — the built-in Angular option does not achieve this

`optimization.fonts` in `angular.json` inlines Google/Adobe Fonts **CSS** into
`index.html` at build time. The `src: url(...)` inside that inlined CSS still points at
`fonts.gstatic.com`, so the browser still makes an external request at runtime.

This project forbids external font CDNs. **`optimization.fonts` must stay disabled**,
and the constraint needs a comment in `angular.json` so nobody enables it later
believing it self-hosts.

Correct approach:

1. Obtain real `.woff2` binaries, subset to latin.
2. Commit under `public/fonts/`.
3. Hand-write `@font-face` with `font-display: swap`.
4. `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the display
   weight only. `crossorigin` is required even same-origin — fonts are always fetched
   in anonymous CORS mode.

Preload and `swap` are both required; neither alone prevents FOIT or the resulting CLS.

### 2.3 Keyword-uniqueness validator — plain Node prebuild script

Requirement: each route declares its primary SEO keyword in `route.data`; the build must
fail if two routes declare the same keyword (anti-cannibalization rule 4).

| Option | Verdict |
| --- | --- |
| Node script chained into `npm run build` | **Recommended.** Trivial, pure, unit-testable, and enforced on the exact command the deploy runs. |
| Custom Angular CLI builder | Rejected. Architect builder interface plus integration-test burden, fragile across CLI internals, disproportionate for one rule. |
| Vitest test only | Useful as a fast local check, but only gates the build if CI enforces it. Add alongside, not instead. |
| Custom ESLint rule | Rejected. Requires cross-file aggregation, which lint rules handle badly. |

### 2.4 sitemap.xml — generate from build output, never by hand

Prerendering emits one `index.html` per prerendered path, so `dist/<project>/browser`
*is* the deployed URL structure. A `postbuild` script walks that tree and emits
`sitemap.xml` into the same output, which makes drift structurally impossible.

Enrich each entry with `changefreq`/`priority` from the same route registry the keyword
validator reads, so there is one source of truth rather than two files to keep in sync.

`ngx-sitemap` was considered and rejected: low adoption, unverified v22 compatibility,
and the first-party script is roughly forty lines.

### 2.5 Analytics — Umami

| | Umami | Plausible |
| --- | --- | --- |
| Cloud entry cost | Free to 1M events/month | From $9/month |
| Self-host requirement | Node + Postgres, ~2 GB VPS | ClickHouse, 4 GB+ VPS |
| Cookieless | Yes | Yes |

At this traffic level Umami Cloud is free with no operational burden, and the self-host
path stays open. Plausible remains a reasonable B-option if the dashboard is preferred.

**Both need explicit SPA handling.** After hydration, in-app navigations are not real
page loads, so the vendor script's automatic pageview never fires again. A
`Router.events` / `NavigationEnd` subscription must call the vendor's track function.
This is implementation work, not a script tag.

### 2.6 Images — no Vercel loader for NgOptimizedImage

`NgOptimizedImage` only emits HTML attributes; resizing is delegated to a configured
loader. Built-in loaders are Imgix, Cloudinary, Cloudflare, ImageKit and Netlify —
**Vercel is not among them**. Vercel's generic `/_vercel/image` endpoint would require
manual Build Output API wiring and bills per transformation.

Recommendation: a `sharp` prebuild step generating AVIF + WebP + JPEG at two or three
widths, referenced through a `<picture>` element with `ngSrc priority` on the hero.
`NgOptimizedImage` does not synthesise multi-format `<picture>` markup on its own.

### 2.7 Map — static image, interactive embed on click

Confirms the study. Google Static Maps API allows 10,000 free requests/month, then
$2–7 per 1,000. Because the salon address never changes, the static image is generated
once and served from our own assets — real cost exposure is effectively zero, provided
it is not re-requested from Google per page view.

### 2.8 Vitest — first-party in v22, still experimental

`@angular/build:unit-test` is Angular's own Vitest builder. **`@analogjs/vitest-angular`
is not needed.**

```jsonc
"test": {
  "builder": "@angular/build:unit-test",
  "options": { "tsConfig": "tsconfig.spec.json", "runner": "vitest", "buildTarget": "::development" }
}
```

Requires `vitest` and `jsdom` as dev dependencies and the `application` builder.
Zone.js supports Vitest `fakeAsync`/`flush`/`waitForAsync` as of 22.0. Angular generates
the Vitest config and direct customisation is currently unsupported.

Still labelled experimental with no SemVer guarantee. Acceptable given `strict_tdd: false`;
re-evaluate if that flips in phase 2.

---

## 3. Proposed folder structure

Domain-first at the top level. The full hexagonal split is applied only where swappable
adapters genuinely exist, to avoid over-abstracting a twelve-page marketing site.

```
src/
├── app/
│   ├── app.config.ts / app.config.server.ts
│   ├── app.routes.ts / app.routes.server.ts
│   ├── app.ts                       # root shell
│   │
│   ├── shared/                      # cross-domain support, not a domain
│   │   ├── ui/                      # primitives reused by 2+ domains
│   │   ├── layout/                  # header, footer (NAP), shell
│   │   └── utils/
│   │
│   ├── seo/                         # the one place ports/adapters earn their keep
│   │   ├── domain/                  # RouteSeoData, JSON-LD value objects
│   │   ├── application/             # SeoService
│   │   ├── infrastructure/          # Meta/Title adapters, JSON-LD injection
│   │   └── generators/              # buildHairSalonSchema, buildServiceSchema, ...
│   │
│   ├── salon/                       # brand and home content
│   ├── services/                    # service catalogue (reserved, out of scope here)
│   ├── contact/                     # second proof route
│   └── booking/                     # /reservar
│
├── assets/fonts/                    # self-hosted, latin subset
└── styles/{tokens,typography,base}.scss

scripts/                             # build-time Node, never shipped
├── validate-keyword-uniqueness.mjs
└── generate-sitemap.mjs
```

`salon`, `services` and `contact` stay flat (container page plus `ui/`). Atomic design is
confined to `shared/ui/` rather than forced onto every route.

---

## 4. Open decisions for the design phase

1. **Rendering strategy for `/reservar`.** The study recorded
   `{ path: 'reservar/**', renderMode: RenderMode.Server }`. Given finding 2.1, the
   orchestrator's recommendation is to **drop `RenderMode.Server` entirely** and
   prerender all twelve routes, in phase 1 *and* phase 2. Booking availability is
   per-user, must not be indexed, and has to be fetched fresh regardless — so
   server-rendering it buys no SEO value. The prerendered shell carries the SEO content;
   the calendar hydrates client-side against an API. This removes the Vercel/Angular SSR
   gap from the project permanently.
2. **Display typeface.** The stack in the study's mockup CSS
   (`Iowan Old Style, Palatino Linotype, …`) is a system-font fallback chain, not a
   licensable file. The design phase must pick a concrete, self-hostable old-style serif
   with genuine italics.
3. **`optimization.fonts` must remain off** — see 2.2. Worth an inline comment in
   `angular.json` so it is not enabled later by mistake.
4. **Vitest builder is experimental.** Acceptable now; revisit at phase 2.

---

## 5. Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Scaffolding on Angular CLI 21 by accident | High | Pin `npx @angular/cli@22 new`; assert version in CI |
| `optimization.fonts` silently re-enabled | Medium | Comment in `angular.json`, note in README |
| Hero asset is a phone snapshot | Medium | Studio photoshoot blocks launch; schedule early |
| Vitest builder churn | Low | `strict_tdd: false`; carve-outs only |
