# Tasks: Foundation — Angular scaffold, design system, SEO infra, `/` + `/contacto`

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~3,100–4,050 (excludes `package-lock.json` and binary font/image assets) |
| 800-line session budget (Engram #2267 preflight, supersedes config.yaml's stated 400) | **High** — total exceeds it ~4x; even most individual work units below sit near/above it |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | 5 work units (PR1→PR5), not the coarser 3-unit example — see note below |
| Delivery strategy | ask-on-risk (default; not overridden in this launch) |
| Chain strategy | pending — user must choose stacked-to-main vs feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

**Honesty note:** design.md's own Risk G already anticipated chaining ("scaffold → tokens/fonts →
layout+SEO infra → / → /contacto") — 5 stages, not 3. A 3-unit split (scaffold+tokens+typography /
layout+SEO+scripts / home+contact+tests) still puts unit 2 alone at ~1,500–1,900 lines (layout shell +
4 shared UI primitives + image pipeline + full SEO infra), well past even the 800-line real budget. This
plan therefore uses **5 work units**, splitting layout/shared-UI/images from SEO infra. PR1 is
mechanical/generated (Angular scaffold) — high line count, low authored-logic risk — but still its own
slice for a clean verification boundary. Re-measure actual diffs during apply; split PR3 or PR4 further
if either exceeds 800 lines once real code lands.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Scaffold + rendering config (Phase 1) | PR1 | `npx ng build` | `npx ng serve`, confirm boot with no route content | Delete generated app tree; nothing downstream exists yet |
| 2 | Design tokens + typography (Phase 2) | PR2 | `npx vitest run src/styles/tokens.contrast.spec.ts` | N/A — pure CSS/font assets, no interactive scenario until PR3 | Revert `src/styles/`, font files, `index.html` preload line, `angular.json` comment; PR1 untouched |
| 3 | Layout shell + shared UI + image pipeline (Phases 3–4) | PR3 | `npx vitest run src/app/shared` | `npx ng serve`, view `/` — shell renders header/footer, no page content yet | Revert `shared/layout/`, `shared/ui/`, `shared/utils`, `scripts/generate-image-variants.mjs`, `public/images/`; PR1/PR2 unaffected, no route consumes these yet |
| 4 | SEO infrastructure (Phase 5) | PR4 | `npx vitest run src/app/seo && node scripts/validate-keyword-uniqueness.mjs` | `npm run build`, inspect `dist/pureza/browser/sitemap.xml` | Revert `src/app/seo/`, both scripts, `package.json` pre/postbuild hooks; layout/UI (PR3) unaffected |
| 5 | Home + contact routes + E2E gates + cleanup (Phases 6–9) | PR5 | `npx vitest run src/app/contact && npx playwright test` | `npm run build && npx playwright test` over prerendered `dist` | Revert `src/app/salon/`, `src/app/contact/`, route wiring, Playwright specs, README; PR3/PR4 infra stays reusable |

---

## Phase 1: Scaffold & rendering config — PR1

- [x] 1.1 Run `npx @angular/cli@22 new pureza --standalone --strict --style=scss --ssr` at repo root; verify `package.json` pins `@angular/core` 22.x. (app-shell: Scaffold pinned to CLI 22)
- [x] 1.2 Confirm no `@NgModule` in `src/app/`; confirm `@angular/ssr` listed in deps. (app-shell: standalone+signals+ssr baseline)
- [x] 1.3 Write `src/app/app.routes.server.ts`: `{path:'', renderMode: RenderMode.Prerender}` + `{path:'contacto', renderMode: RenderMode.Prerender}`; wire `provideServerRendering(withRoutes(serverRoutes))` in `app.config.server.ts`. (app-shell: hybrid prerender config)
- [x] 1.4 Set `test` target to `@angular/build:unit-test` (vitest runner); add `vitest`+`jsdom` devDeps. (exploration §2.8)
- [x] 1.5 Expand `angular.json` `optimization` to object form, `fonts.inline: false` with inline JSONC guard comment (design.md §2); verify parser accepts it via a build, else fall back to a README note. (design-system: optimization.fonts regression guard)
- [x] 1.6 Verify `npm run build` succeeds with the scaffold as-is (smoke check before layering the rest). (app-shell: build output is static HTML)

## Phase 2: Design tokens & typography — PR2

- [x] 2.1 Create `src/styles/_tokens.scss` with the exact token set from design.md §1 (4 neutral roles + 5 plant accents ×2 variants + `--pz-accent-live/text` fallback pair + spacing/type scale). (design-system: neutral base + five plant-accent tokens)
- [x] 2.2 Add `[data-planta='...']` scope rules for all 5 plants, sibling-only, no nesting. (design-system: one accent per route, never mixed)
- [x] 2.3 Wire `src/styles.scss` → `@use 'styles/tokens'` before any component style.
- [x] 2.4 Place 4 latin-subset `.woff2` files under `public/fonts/` (EB Garamond 400/400-italic, Alegreya Sans 400/700).
- [x] 2.5 Write `src/styles/_typography.scss`: hand-written `@font-face` + `font-display: swap` + latin `unicode-range`; label/eyebrow utility class. (design-system: self-hosted typography only)
- [x] 2.6 Add `<link rel="preload" as="font" type="font/woff2" crossorigin>` in `index.html` for EB Garamond 400 only.
- [x] 2.7 Vitest: contrast assertions for all 5 `-text` tokens vs `#FFFFFF` ≥4.5:1, pure function. (design-system: text variant meets AA contrast)
- [x] 2.8 Verify no `prefers-color-scheme: dark` rule anywhere in compiled styles. (design-system: no dark theme)

## Phase 3: Layout shell — PR3

- [x] 3.1 Create `shared/layout/site-header/` — nav filtered from registry `status==='live' && inNav` (yields brand link + `/contacto` only, zero edits needed when `content` flips more routes live).
- [x] 3.2 Create `shared/layout/site-footer/` rendering NAP from one shared `SITE` constant. (app-shell: NAP consistency)
- [x] 3.3 Create `shared/layout/shell/` = header + `<router-outlet>` + footer; wire as `app.ts` root template. (app-shell: shared layout shell, every route renders through it)

## Phase 4: Shared UI primitives & image pipeline — PR3

- [x] 4.1 Create `shared/ui/pz-picture/` — required `base` input, derives `{base}-{w}.{avif|webp|jpg}` URLs, `fetchpriority`, `loading`/`decoding`, explicit `width`/`height`.
- [x] 4.2 Create `shared/ui/pz-plate/` — required `specimen` (SVG, `aria-hidden`, `stroke=currentColor`) + `photo` inputs, non-interactive in this change.
- [x] 4.3 Create `shared/ui/pz-static-map/` — static image in a `<button>`, click swaps to Maps iframe, plain "Cómo llegar" link fallback.
- [x] 4.4 Create `shared/ui/pz-cta/` — primary/secondary button variants.
- [x] 4.5 Copy `info/images/{atmosfera-romero,atmosfera-espliego,atmosfera-esparto,atmosfera-vid,atmosfera-olivo,manos-pigmento,textura-lino}.jpg` into `public/images/`; skip `bodegon-botanico.jpg` (out of scope, `/precios`/`/diario`). Source: AI placeholders, `info/fotos-ia-brief.md`.
- [x] 4.6 Write `scripts/generate-image-variants.mjs` (sharp, prebuild) — emits `{base}-{w}.{avif|webp|jpg}` for every file in `public/images/` at 2–3 widths.
- [x] 4.7 Vitest: extract and test the pure filename/URL-derivation logic from 4.6, not just script side effects.
- [ ] 4.8 **BLOCKED** — Generate one static map PNG (Google Static Maps API, salon address) once; commit to `public/images/mapa-estatico.png`; no runtime re-fetch. No `GOOGLE_MAPS_API_KEY` (or similar) was available in this environment/session — deliberately not fabricated. `pz-static-map` (4.3) already degrades to a verified "Cómo llegar" text-link fallback while this asset is absent (`STATIC_MAP_ASSET_AVAILABLE = false` in `pz-static-map.ts`); flip that flag the same commit this asset lands. Requires a human with Google Maps API access.
- [x] 4.9 Place `info/virginia.jpeg`-derived hero portrait as the sole explicit duotone exception (design.md §6 — every other photo ships untinted); comment inline where used. (`pz-picture`'s `duotone` input + `pz-plate`'s doc comment — actual home-page hero wiring is PR5's job, not done here.)

## Phase 5: SEO infrastructure — PR4

- [x] 5.1 Create `seo/route-seo.registry.json`, all 12 routes (2 `status:'live'` — `/`, `/contacto`; 10 `planned`); `/` primaryKeyword = `"peluquería sin químicos Ciudad Real"`, `/contacto` primaryKeyword = `null`. (seo-infrastructure: registry single source, both proof-route scenarios)
- [x] 5.2 Create `seo/domain/{route-seo.ts,site.ts,ports.ts}` — `RouteSeo` interface + `SITE` NAP constant + port interfaces.
- [x] 5.3 Create `seo/application/seo.service.ts` — `apply()` sets title/description/canonical/OG/Twitter; `setJsonLd()` upserts by `data-pz-schema`; subscribed once from `app.config.ts` router events. (seo-infrastructure: SeoService applies registry data)
- [x] 5.4 Create `seo/infrastructure/{angular-metadata.adapter.ts,json-ld.adapter.ts}` — DOCUMENT-based upsert, not append (design risk C: hydration must replace, not duplicate).
- [x] 5.5 Create `seo/generators/hair-salon.schema.ts` (`@type: "HairSalon"` — confirmed real schema.org subtype, Engram #2291 — name/address/telephone/URL) and `breadcrumb-list.schema.ts`. (seo-infrastructure: JSON-LD contract)
- [x] 5.6 Wire `route.data.seo = seoData('contacto')` (etc.) in `app.routes.ts` for both routes. **Partial by design**: added the `seoRouteData(path)` helper (`seo/domain/route-seo.ts`) and documented the exact wiring pattern as a comment in `app.routes.ts`; `routes: Routes = []` stays empty because the home/contact route *components* are Phase 6/7 (PR5) — adding route entries pointing at nonexistent components would break `npm run build`. PR5's 6.3/7.4 add the real `{ path, component, data: seoRouteData(path) }` entries using this helper.
- [x] 5.7 Write `scripts/validate-keyword-uniqueness.mjs` — exported pure functions + self-executing main; checks duplicate normalized keyword, duplicate path, duplicate `planta`, `title>60`/`description>155`/priority-range; wire as `prebuild`. (seo-infrastructure: build-breaking validator, unique-pass + duplicate-fail + navigational-exempt scenarios)
- [x] 5.8 Vitest: `findDuplicateKeywords` + the other 3 validator checks, pure functions.
- [x] 5.9 Write `scripts/generate-sitemap.mjs` — `postbuild`; walks `dist/pureza/browser/**/index.html`, joins registry for changefreq/priority, no `lastmod`, fails on missing registry entry or a dropped `live` route. (seo-infrastructure: postbuild generation, both scenarios)
- [x] 5.10 Vitest: sitemap `pathToUrl` mapping function, pure.
- [x] 5.11 Vitest: both JSON-LD generator functions produce valid, parseable schema.org objects.
- [x] 5.12 Vitest+TestBed (jsdom): `SeoService.apply` sets title/description/canonical exactly once per navigation; JSON-LD adapter replaces the existing node on re-navigation instead of duplicating. (design risk C)

## Phase 6: Home route `/` — PR5

- [x] 6.1 Create `salon/home/home-page.ts`: `hero-portrait` (pz-picture priority, LCP), `manifest` (3 columns), `carta-teaser` (5 non-linking `pz-plate` rows, one per plant), `salon-strip` (`textura-lino` band), `quote` (`manos-pigmento` + italic blockquote), CTA → `/contacto`. (home-page: route composition)
- [x] 6.2 Verify no `<a href>` targets any of the 5 service routes, `/virginia`, `/el-salon`, `/precios`, `/reservar`, `/diario`. (home-page: no dead links to future routes)
- [x] 6.3 Wire `/` to `home-page.ts`; confirm shell present; `SeoService` applies title/description/canonical + `HairSalon`+`BreadcrumbList` JSON-LD from registry. (home-page: SEO contract satisfied)
- [x] 6.4 Confirm no eager Maps `<iframe>` in `/`'s initial HTML. (home-page: no eager map iframe)

## Phase 7: Contact route `/contacto` — PR5

- [x] 7.1 Create `shared/utils/contact-links.ts` — pure `buildWhatsAppUrl(phone, message)` / `buildTelUrl(phone)`. (contact-page: WhatsApp-first primary CTA)
- [x] 7.2 Vitest: both link-builder functions, encoding + format.
- [x] 7.3 Create `contact/contact-page.ts`: `nap-block`, WhatsApp CTA first via `pz-cta` primary, `tel:` CTA second via `pz-cta` secondary, `hours` block, `pz-static-map` click-to-load, no form (no backend in this change). (contact-page: WhatsApp-first + click-to-load map)
- [x] 7.4 Wire `/contacto`; confirm shell present, `RenderMode.Prerender`, `SeoService` applies null-keyword entry + `BreadcrumbList` only (no `HairSalon` block). (contact-page: navigational SEO entry)
- [x] 7.5 Confirm no Maps `<iframe>` before click; confirm it loads after clicking the static map image. (contact-page: click-to-load static map)

## Phase 8: Build gates & E2E — PR5

- [x] 8.1 Run `npm run build`; verify prebuild validator exits 0, `dist/pureza/browser/index.html` + `contacto/index.html` exist, postbuild sitemap contains both URLs. (app-shell: static build output; seo-infrastructure: sitemap scenarios)
- [x] 8.2 Fixture test: deliberately duplicate a keyword in a registry copy, run the validator directly, assert non-zero exit — never committed to the real registry. (seo-infrastructure: duplicate keyword fails build)
- [x] 8.3 Playwright: axe-core AA scan on `/` and `/contacto`; assert zero external network requests (no `fonts.googleapis.com`/`fonts.gstatic.com`/eager Maps).
- [x] 8.4 Playwright: one desktop + one mobile visual snapshot per route.
- [x] 8.5 Playwright: assert each prerendered page's `<link rel="canonical">` equals its `sitemap.xml` entry. (design risk E; config.yaml verify gate)

## Phase 9: Cleanup — PR5

- [x] 9.1 Add README.md section: `optimization.fonts` must stay `false`; note `_tokens.scss` as the sole hex source; note `info/direccion-diseno.build.SUPERSEDED-v2.html` is historical only.
- [x] 9.2 Document that CI must run `npm run build` (never bare `ng build`) so the prebuild gate cannot be bypassed. (design risk D)

---

**PR5 status: DONE.** 53/54 tasks across all 5 PRs are now `[x]`. The sole remaining item is task
4.8 (committed static-map PNG), still **BLOCKED** on a human-supplied `GOOGLE_MAPS_API_KEY` — not a
code gap; `pz-static-map` degrades to a verified "Cómo llegar" fallback everywhere it's used. `/` and
`/contacto` are a genuinely working, buildable, tested site: `npm run build` prerenders both routes
and writes a correct `sitemap.xml`; `npm test -- --watch=false` is 83/83; `npx playwright test` is
10/10 (axe-core AA, zero eager font/Maps requests, 4 visual snapshots, canonical↔sitemap parity,
click-to-load map fallback). See `sdd/foundation/apply-progress` (Engram, project "virginia") for the
full PR1–PR5 history, including a real `pz-cta` content-projection bug found and fixed in this batch.

**Verify-phase Lighthouse gate (2026-08-12 addendum):** `config.yaml`'s `phase_rules.verify` also
requires a "Lighthouse SEO/perf pass" — no task above named it explicitly, and `sdd-verify` flagged
it as a CRITICAL governance gap. Closed post-hoc, directly on this branch: real `npx lighthouse` runs
against both routes served from a fresh `npm run build` via `scripts/serve-dist.mjs`. Accessibility,
Best Practices, and SEO are 100/100 on both `/` and `/contacto`; Performance is 68/82 respectively —
not chased to 100. See README.md's "Lighthouse audit (verify-phase gate)" section for the accurate
explanation: the committed evidence attributes the gap to `unused-javascript` (~100 KiB, normal
Angular framework overhead) plus slow FCP/LCP under Lighthouse's default simulated mobile-4G
throttling; AI-placeholder photo weight plausibly contributes given the priority hero image, but the
condensed report has no byte-weight/LCP-element audit proving that split — durable numeric evidence
at `lighthouse-reports/home.json` and `lighthouse-reports/contacto.json`.
