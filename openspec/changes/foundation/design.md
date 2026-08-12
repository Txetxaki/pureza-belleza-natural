# Design — `foundation`

**Change:** Angular 22 scaffold, pinned design tokens, shared layout shell, SEO infrastructure, `/` + `/contacto`.
**Date:** 2026-08-12 · **Engram mirror:** `sdd/foundation/design` (project `virginia`)
**Inputs:** `proposal.md`, `exploration.md`, `openspec/config.yaml`, Engram #2289 / #2283 / #2280 / #2277.

---

## Technical approach

Three artefacts carry the whole change and everything else consumes them:

1. **One token file** (`src/styles/_tokens.scss`) — the single authoritative palette. Components never
   name a plant; they read a contextual alias that a `data-planta` scope rebinds. Mixing two accents in
   one context becomes impossible by construction rather than by review.
2. **One route registry** (`src/app/seo/route-seo.registry.json`) — read by `SeoService` at runtime, by
   the keyword validator at prebuild, by the sitemap generator at postbuild. Three consumers, one file.
3. **One image contract** (`pz-picture` + fixed filenames under `public/images/`) — swapping AI
   placeholders for the real photoshoot is a file replacement, never a code edit.

Structure is domain-first per `config.yaml`. The ports/adapters split applies **only** to `seo/`; route
folders stay flat (container + `ui/`), atomic design stays inside `shared/ui/`.

---

## 1. The token contract (authoritative — supersedes `info/direccion-diseno.build.html`)

`src/styles/_tokens.scss`, loaded from `src/styles.scss` (`@use 'styles/tokens'`) so tokens exist before
any component style. Neutral/structural tokens are English; the five accents keep their Spanish plant
names because they are proper nouns of the domain, not translated concepts.

```scss
:root {
  /* ── Ground & ink — light only. No dark branch, by decision. ─────────── */
  --pz-surface:   #FFFFFF;  /* literal white, every page, every section */
  --pz-ink:       #1C221C;  /* ~16:1 — headings and body */
  --pz-ink-soft:  #4F574F;  /* ~7:1  — captions, secondary copy, labels */
  --pz-hairline:  #EBEBE7;  /* 1px borders ONLY — never box-shadow, never elevation */
  --pz-radius:    2px;      /* the only radius in the system */

  /* ── Five plant accents. Each owns exactly one service route. ─────────── */
  --pz-romero-live:   #3D8B6B;  --pz-romero-text:   #2C6A4F; /* Coloración Vegetal */
  --pz-espliego-live: #7C6BC4;  --pz-espliego-text: #5B4B9E; /* Mechas de Autor    */
  --pz-esparto-live:  #C1912B;  --pz-esparto-text:  #7D5A10; /* Rastas             */
  --pz-vid-live:      #B44A63;  --pz-vid-text:      #8E2F44; /* Extensiones Nat.   */
  --pz-olivo-live:    #7A8B2F;  --pz-olivo-text:    #4E5A17; /* Rituales Capilares */

  /* ── The ONLY accent handles a component may reference. ───────────────── */
  --pz-accent-live: var(--pz-ink);       /* unowned context degrades to ink */
  --pz-accent-text: var(--pz-ink-soft);  /* → no loose colour anywhere      */

  /* ── Type ─────────────────────────────────────────────────────────────── */
  --pz-display: 'EB Garamond', 'Iowan Old Style', Palatino, 'Times New Roman', serif;
  --pz-body:    'Alegreya Sans', 'Segoe UI', system-ui, sans-serif;
  --pz-text-label: 0.6875rem;  /* 11px */   --pz-track-label: 0.2em;
  --pz-text-small: 0.8125rem;  /* 13px */   --pz-track-tight: -0.014em;
  --pz-text-body:  1.0625rem;  /* 17px */
  --pz-text-lead:  1.1875rem;  /* 19px */
  --pz-text-h3: clamp(1.25rem, 2.2vw, 1.5rem);
  --pz-text-h2: clamp(1.9rem, 4.2vw, 2.6rem);
  --pz-text-h1: clamp(2.6rem, 7vw, 4.4rem);

  /* ── Space & measure ──────────────────────────────────────────────────── */
  --pz-space-3xs: 4px;  --pz-space-2xs: 8px;  --pz-space-xs: 12px; --pz-space-s: 20px;
  --pz-space-m:  32px;  --pz-space-l:  56px;  --pz-space-xl: 96px;
  --pz-measure: 33rem;  --pz-wrap: 1120px;
}

/* One scope rule binds a plant to a subtree. Never nested — siblings only. */
[data-planta='romero']   { --pz-accent-live: var(--pz-romero-live);   --pz-accent-text: var(--pz-romero-text); }
[data-planta='espliego'] { --pz-accent-live: var(--pz-espliego-live); --pz-accent-text: var(--pz-espliego-text); }
[data-planta='esparto']  { --pz-accent-live: var(--pz-esparto-live);  --pz-accent-text: var(--pz-esparto-text); }
[data-planta='vid']      { --pz-accent-live: var(--pz-vid-live);      --pz-accent-text: var(--pz-vid-text); }
[data-planta='olivo']    { --pz-accent-live: var(--pz-olivo-live);    --pz-accent-text: var(--pz-olivo-text); }
```

**Rules that follow from the shape, not from discipline**

| Rule | How it is enforced |
| --- | --- |
| One accent per single-service context | Only one `--pz-accent-*` pair resolves in any subtree |
| All five may coexist on a future index (`/precios`) | Sibling `data-planta` rows; nesting is a lint/test failure |
| No dark theme | No `prefers-color-scheme` branch and no `[data-theme]` selector exists to extend |
| No elevation | No shadow token exists; `--pz-hairline` is the only separator |
| One radius | `--pz-radius` only; literal `border-radius` values are a stylelint error |

**Verified contrast on `--pz-surface`** (computed, to be re-asserted by unit test):
romero 6.4:1 · espliego 7.1:1 · esparto 6.3:1 · vid 8.0:1 · olivo 7.5:1 — all AA for normal text.
`*-live` hexes are decorative only (esparto measures 2.9:1): every specimen SVG is `aria-hidden` and
always accompanied by its text label, so no meaning is ever carried by colour alone.

**Why this is not the AI-default look:** the superseded on-disk mockup (`--ground:#FCFBF7`, four accents)
*was* the cream-plus-serif default. The pin to literal `#FFFFFF` with five botanical accents is the
correction, and it matches the awarded references (Il Colorista, Heleen Hülsmann — Engram #2280) where
white is the gallery and photography carries the weight.

---

## 2. Typography and font self-hosting

Four `woff2` files, latin subset, in `public/fonts/` (copied verbatim to output root → `/fonts/…`):

| File | Role |
| --- | --- |
| `eb-garamond-400-latin.woff2` | Headings, pull-quotes. **Preloaded** — the only preload. |
| `eb-garamond-400-italic-latin.woff2` | Latin binomials, quote body |
| `alegreya-sans-400-latin.woff2` | Body copy |
| `alegreya-sans-700-latin.woff2` | Uppercase labels/eyebrows |

`@font-face` hand-written in `src/styles/_typography.scss` with `font-display: swap` and `unicode-range`
for latin. Preload in `index.html` needs `crossorigin` even same-origin (fonts fetch in anonymous CORS
mode). Label/eyebrow style is a single class in `_typography.scss`: `--pz-text-label`, `700`,
`text-transform: uppercase`, `--pz-track-label`, `--pz-ink-soft`.

`angular.json` must expand `optimization` to object form so `fonts.inline` can be turned off, with the
reason inline (the CLI parses `angular.json` as JSONC):

```jsonc
"optimization": {
  "scripts": true,
  "styles": { "minify": true, "inlineCritical": true },
  // DO NOT ENABLE. fonts.inline inlines the Google Fonts *CSS*, but the @font-face
  // src inside it still points at fonts.gstatic.com — an external runtime request.
  // We self-host from public/fonts. See openspec exploration §2.2.
  "fonts": { "inline": false }
}
```

If the workspace parser rejects the comment, fall back to a `README.md` note — but the build must be
re-run after adding it, as an apply-phase check.

---

## 3. Folder structure and layout shell

```
src/
├── styles.scss                       # build entry → @use styles/{tokens,typography,base}
├── styles/_tokens.scss _typography.scss _base.scss
├── app/
│   ├── app.ts  app.config.ts  app.config.server.ts  app.routes.ts  app.routes.server.ts
│   ├── shared/
│   │   ├── layout/{shell,site-header,site-footer}/
│   │   ├── ui/{pz-picture,pz-plate,pz-static-map,pz-cta}/
│   │   └── utils/contact-links.ts
│   ├── seo/
│   │   ├── route-seo.registry.json   # SINGLE SOURCE — 12 routes, 2 live
│   │   ├── domain/{route-seo.ts,site.ts,ports.ts}
│   │   ├── application/seo.service.ts
│   │   ├── infrastructure/{angular-metadata.adapter.ts,json-ld.adapter.ts}
│   │   └── generators/{hair-salon.schema.ts,breadcrumb-list.schema.ts}
│   ├── salon/home/{home-page.ts, ui/}
│   └── contact/{contact-page.ts, ui/}
├── public/{fonts,images,robots.txt}
└── scripts/{validate-keyword-uniqueness.mjs,generate-sitemap.mjs,generate-image-variants.mjs}
```

`app.ts` renders `<pz-shell>` = `site-header` + `<router-outlet>` + `site-footer`.

**The header nav is data-driven from the registry**, filtered `status === 'live' && inNav`. In
`foundation` that yields the brand link plus `/contacto`; when `content` flips ten entries to `live`,
the nav grows with **zero edits to the header component**. This is the main validation that the layout
contract does not change shape later.

`site-footer` renders the canonical NAP from `SITE` — the same literal string used by the `HairSalon`
schema and by `/contacto`. One constant, three consumers, per the study's phase-0 requirement.

---

## 4. SEO architecture

```
route-seo.registry.json ──┬─→ registry.ts (typed) ─→ app.routes.ts data ─→ SeoService ─→ ports ─→ DOM
                          ├─→ validate-keyword-uniqueness.mjs   (prebuild gate)
                          └─→ generate-sitemap.mjs              (postbuild, joined with dist/)
```

```ts
export interface RouteSeo {
  path: string;                 // '' | 'contacto' — Angular path, no leading slash
  title: string;                // ≤ 60 chars
  description: string;          // ≤ 155 chars
  primaryKeyword: string | null;// null = deliberately untargeted (/contacto, /el-salon)
  breadcrumb: string;
  planta: Planta | null;        // accent owner — at most one route per plant
  changefreq: 'weekly' | 'monthly' | 'yearly';
  priority: number;             // 0..1
  inNav: boolean;
  status: 'live' | 'planned';   // 'planned' = ships in the `content` change
}
```

```ts
@Injectable({ providedIn: 'root' })
export class SeoService {
  apply(seo: RouteSeo): void;              // title, description, canonical, OG/Twitter
  setJsonLd(id: string, schema: object): void;  // upsert by data-pz-schema="<id>"
}
```

`SeoService` subscribes to the router **once** from `app.config.ts` and reads the deepest activated
route's `data.seo`; page containers never call it, so a route cannot be shipped without metadata.
`data` is built by `seoData('contacto')`, which spreads the registry entry — so `route.data` literally
carries `primaryKeyword`, satisfying `config.yaml phase_rules.spec`, while the value has one origin.

JSON-LD adapter **upserts** `<script type="application/ld+json" data-pz-schema="…">` via `DOCUMENT`.
Gotcha to test: prerendered HTML already contains the node, so hydration must replace, not append.
`foundation` emits `HairSalon` (once, from the shell) and `BreadcrumbList` (per route, skipped on `/`).

### Registry as JSON, not TypeScript

| Option | Verdict |
| --- | --- |
| **JSON + `resolveJsonModule`** | **Chosen.** Angular imports it typed; Node scripts `JSON.parse` it. Zero deps, no build step. |
| `.ts` registry compiled before scripts run | Rejected — the prebuild gate would depend on the build it is meant to gate. |
| Duplicate the map in a `.mjs` file | Rejected — two sources is the exact drift the registry exists to prevent. |

The registry holds all **twelve** routes now (ten `planned`), so the anti-cannibalization check already
covers routes that do not exist yet and `content` only flips `status`.

---

## 5. Build gates

**`scripts/validate-keyword-uniqueness.mjs`** — npm auto-runs it as `prebuild`, so `npm run build`
cannot bypass it (CI must invoke `npm run build`, never `ng build`). Exported pure functions,
self-executes only as main. It fails the build on:

1. two routes sharing a normalized `primaryKeyword` (trim + lowercase + NFC + collapse whitespace);
2. duplicate `path`;
3. two routes claiming the same `planta` — the accent-ownership rule becomes a build gate;
4. `title > 60`, `description > 155`, `priority` outside `0..1`.

**`scripts/generate-sitemap.mjs`** — `postbuild`. Walks `dist/pureza/browser/**/index.html`, maps
directory paths to URLs, joins with the registry for `changefreq`/`priority`, writes `sitemap.xml`
into the same output. Fails if a prerendered path has no registry entry, or if a `status: 'live'`
entry produced no output (catches a route silently dropped from `app.routes.server.ts`).
`lastmod` is **omitted** deliberately: a build-time date is false and an unreliable `lastmod` is a
negative signal. `robots.txt` stays static in `public/`.

---

## 6. The herbarium plate and the image contract

Signature element, and the only place all five accents appear in this change:

```
┌───────────────────────────────────────────────────────────┐
│  ╱│╲   Coloración vegetal                    ▓▓▓▓▓▓▓      │  data-planta="romero"
│ ╱ │ ╲  Rosmarinus officinalis  ← italic,     ▓ foto ▓      │
│   │    one line of plain copy   --pz-accent- ▓▓▓▓▓▓▓      │
│ specimen SVG, stroke=currentColor            square swatch │
│ colour = --pz-accent-live                                  │
└───────────────────────────────────────────────────────────┘  1px --pz-hairline
```

`pz-plate` declares `specimen` and `photo` as **required inputs**, so "illustration and photograph,
never one alone" is a compile error rather than a review note. In `foundation` the plates are
non-interactive (the service routes do not exist yet, per #2289); `content` adds `routerLink` to the
title without restructuring markup.

**Image contract — zero-code swap.** `public/images/{base}.jpg` is the fixed, human-meaningful source
name (`atmosfera-romero.jpg`, `manos-pigmento.jpg`, `bodegon-botanico.jpg`, `textura-lino.jpg`, per
`info/fotos-ia-brief.md`). `scripts/generate-image-variants.mjs` (sharp, prebuild) emits
`{base}-{w}.{avif|webp|jpg}` by convention; `pz-picture` derives every URL from `base` alone. Angular
does not hash `public/`, so paths are stable. Replacing the file with the real photograph and rebuilding
is the entire swap. `NgOptimizedImage` is not used — Vercel has no loader and it cannot emit
multi-format `<picture>`; `fetchpriority="high"` on the hero and `loading="lazy" decoding="async"`
elsewhere are set explicitly, with `width`/`height` always present for CLS.

**Photographs ship untinted.** The v4 duotone wash in `fotos-ia-brief.md` is dropped: it would spread an
accent across a whole image area, competing with the specimen line that is supposed to carry it, and it
would degrade the professional shoot later. The accent lives in the stroke; the photograph stays real.

Motion: specimen strokes draw once on viewport entry (`stroke-dasharray`), sections rise 14px. One
orchestrated moment, nothing else. `prefers-reduced-motion: reduce` disables both — quality floor, not
a feature.

---

## 7. How `/` and `/contacto` are composed

Both `RenderMode.Prerender` in `app.routes.server.ts`; no server route, no Vercel function (Risk 1).

| `/` (`salon/home`) | `/contacto` (`contact`) |
| --- | --- |
| `hero-portrait` — LCP, `pz-picture priority` | `nap-block` — canonical NAP from `SITE` |
| `manifest` — three columns | **WhatsApp CTA first** (#2289), phone secondary |
| `carta-teaser` — five `pz-plate` rows, non-linking | `hours` — same data as `openingHoursSpecification` |
| `salon-strip` — `textura-lino` band | `pz-static-map` — committed PNG in a `<button>`; the Maps iframe is injected only on click, plus a plain "Cómo llegar" link for keyboard/no-JS |
| `quote` — `manos-pigmento` + italic blockquote | No form: a form needs a backend, and this change ships no server |
| CTA → `/contacto` | Context stays neutral — no `data-planta`, accent resolves to ink |

`buildWhatsAppUrl(phone, message)` and `buildTelUrl(phone)` are pure functions in
`shared/utils/contact-links.ts` (`https://wa.me/34633101155?text=…`, `tel:+34633101155`), unit-tested
for encoding.

---

## Testing strategy

| Layer | What | Approach |
| --- | --- | --- |
| Unit | `findDuplicateKeywords`, `buildWhatsAppUrl`, `canonicalUrl`, both schema generators, sitemap `pathToUrl`, **token contrast assertions** | Vitest, pure functions, no TestBed |
| Component | `SeoService.apply` sets title/description/canonical once; JSON-LD adapter replaces an existing node instead of duplicating | Vitest + TestBed, jsdom |
| Build gate | deliberate duplicate keyword → exit 1 | fixture run in CI (success criterion) |
| E2E | `/` + `/contacto`: axe-core AA, **zero external network requests**, map iframe absent before click / present after, `<link rel=canonical>` equals the sitemap entry | Playwright over the prerendered `dist` |
| Visual | one desktop + one mobile snapshot per route | Playwright screenshot |

## Threat matrix

| Boundary | Applicability | Reason |
| --- | --- | --- |
| Documentation-like paths | N/A | No file-type classification or execution of repository content. |
| Git repository selection | N/A | No VCS automation in this change. |
| Commit state | N/A | No commit automation. |
| Push state | N/A | No push automation. |
| PR commands | N/A | No PR automation. |

The only process boundary is `npm` invoking two first-party Node scripts with no external input; the
sitemap generator writes exclusively inside `dist/`, on paths derived from its own build output.

## Migration / rollout

No migration — greenfield. First commit is the rollback boundary (proposal §Rollback).

## Open questions

- [ ] Service-route slugs (`/coloracion-vegetal-aveda`, …) enter the registry as `planned` now. The
      `-aveda` slug intersects the open GBP listing-name policy issue (#2259) — confirm before `content`.
- [ ] Whether `generate-image-variants.mjs` ships here or slips to `content`. The `pz-picture` API is
      identical either way; if it slips, the component emits a single `<img>` and no contract changes.
- [ ] Committed static-map PNG must be generated once from Google Static Maps before `/contacto` is
      built (asset task, not code).

## Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| **A.** Token drift resurfaces — `info/direccion-diseno.build.html` still sits on disk with the cream ground and four accents | High | §1 is authoritative; add a README line marking the on-disk mockup superseded, and a stylelint `declaration-property-value-allowed-list` so raw hex outside `_tokens.scss` fails |
| **B.** `angular.json` comment rejected by the workspace parser | Low | Verify with a build in apply; fall back to `README.md` if rejected |
| **C.** JSON-LD duplicated after hydration (prerendered node + client append) | Med | Upsert by `data-pz-schema`; explicit component test |
| **D.** `ng build` invoked directly bypasses the `prebuild` gate | Med | CI runs `npm run build` only; document in README |
| **E.** Canonical URL rule is expressed twice (TS + `.mjs` sitemap) | Med | Playwright asserts each page's canonical equals its sitemap entry — drift fails the verify gate |
| **F.** `pz-picture` requires variants to exist; a missing `.avif` breaks `<picture>` silently | Med | Variant script runs as `prebuild`; sitemap-style existence check, or ship single-`<img>` fallback |
| **G.** Five plates plus the shell in one slice exceeds the review budget | Med | `sdd-tasks` chains: scaffold → tokens/fonts → layout+SEO infra → `/` → `/contacto` |
