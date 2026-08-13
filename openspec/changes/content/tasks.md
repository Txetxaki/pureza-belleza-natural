# Tasks: `content` — the ten remaining routes

Read `BRIEF.md`, `proposal.md`, `design.md`, and `specs/*/spec.md` before starting any slice.
This file only sequences and scopes work — it does not restate copy, tokens, or contracts already
decided in `design.md`.

## Corrected before slicing began

`specs/app-shell/spec.md`'s "Hybrid prerender rendering config" requirement still said eleven routes
`RenderMode.Prerender` + `/reservar` as `RenderMode.Server` — a stale draft that predates the
`reservar-page`/`config.yaml` correction recorded in Engram decision #2310. It has been rewritten in
place to "Full prerender rendering config — twelve routes, no server exception" so it no longer
contradicts `specs/reservar-page/spec.md`. **All twelve routes are `RenderMode.Prerender`. There is no
server-rendered route in this project.** Do not reintroduce a `/reservar` Server branch in any task
below.

## Traceability legend

Each task cites `Spec: <capability> — "<Scenario name>"` and, where relevant, `Design: <decision id>`.
`[P]` marks a task that is file-independent from its siblings in the same slice and may be written in
either order/parallel by the implementing agent; unmarked tasks are sequential within their slice
(later ones depend on earlier ones in the same slice, noted explicitly).

Budget: **800 changed lines per slice** (Engram #2267 — supersedes the stale "400-line" mentions in
`proposal.md`'s risk table and `openspec/config.yaml`'s `phase_rules.tasks`, same class of drift as the
`/reservar` correction above). Chain strategy: **stacked-to-main**, each branch off the previous, the
first branch off `main`.

---

## Slice 1 — Domain & schema layer (no visible UI)

**Status: DONE** — all 7 tasks implemented and committed on `content/01-domain-schema`
(base `main`). 30 new unit tests added (113/113 full suite passing), `npm run build` green.
See `sdd/content/apply-progress` (Engram, project "virginia") for exact landed API shapes.

Branch: `content/01-domain-schema`. Base: `main`.

### 1.1 `src/app/services/domain/service-index.ts` (+ `.spec.ts`) [P] — DONE
`SERVICE_INDEX`: derive the five plant-owned entries (`planta !== null`) from `ROUTE_SEO_REGISTRY`,
typed `ServicePath` union of the five paths. Spec asserts the derived list has exactly five entries and
each one's `planta` matches its registry row.
Spec: `pricing` — "Bijection holds" (shared fixture with 1.2). Design: Data Flow diagram, D2.

### 1.2 `src/app/services/domain/pricing.ts` (+ `.spec.ts`) [P] — DONE
Discriminated union per `design.md`'s `ServicePricing` interface (`pending` branch types `fromEur`/
`durationMinutes` as `null`); `TariffRow[]` per entry (the Stitch tariff-table rows, all `Consultar` at
launch); `formatFrom`/`formatDuration`. All five entries `status: 'pending'` at launch — do not invent a
figure (BRIEF §"Critical implementation details").
- Acceptance: bijection spec — every `SERVICE_INDEX` path has exactly one pricing entry and vice versa;
  a pricing entry with no matching registry path fails the spec (drift caught).
- Acceptance: `formatFrom(pending)` → `'Consultar'`; a pending entry's `durationMinutes` is `null` (never
  an approximate figure — "the two MUST NOT be independently pending/confirmed").
Spec: `pricing` — "One source, three consumers", "Bijection holds", "Drift is caught", "Pending price
implies pending duration". Design: D4.

### 1.3 `src/app/services/domain/word-count.ts` (+ `.spec.ts`) [P] — DONE
Pure `countWords(text: string): number` (whitespace-collapse + trim, matching how the service-page specs
below will measure prose). Small, reusable across every service-page spec's word-floor assertions —
built once here instead of five times.
Spec: `service-pages` — "Word count within range" (both the 150–200 and 700–900 scenarios; this is the
shared measuring stick).

### 1.4 `src/app/seo/domain/schema-ids.ts` — DONE
`SCHEMA_ID` map (`salon`, `person`, plus a `service(path)` builder) + `salonRef()`/`personRef()` inline
`{ '@id': ... }` helpers. No dedicated spec — exercised indirectly by 1.5/1.6's generator specs (their
assertions on `provider`/`worksFor`/`@id` equality are the real coverage).
Depends on: nothing. Design: Data Flow "JSON-LD entity graph" diagram.

### 1.5 `src/app/seo/generators/faq-page.schema.ts` (+ `.spec.ts`) [P] — DONE
`buildFaqPageSchema(faq: {question, answer}[])` → `FAQPage` with `mainEntity` 1:1 to the input array.
Spec: `seo-infrastructure` — "All four generators produce valid JSON-LD". `service-pages` — "FAQ count
and schema match" (the generator side of that scenario; the rendering side lands in Slice 2b).

### 1.6 `src/app/seo/generators/service.schema.ts` (+ `.spec.ts`) — DONE
`buildServiceSchema` exactly per `design.md`'s `Interfaces/Contracts` snippet: `offers` key present only
when `pricing.status === 'confirmed'`, absent (not `undefined`-valued, actually absent) while `pending`.
`provider` uses `salonRef()` from 1.4.
- Acceptance: given a `pending` pricing fixture, `'offers' in result` is `false`.
- Acceptance: given a `confirmed` fixture, `result.offers = { '@type': 'Offer', price, priceCurrency: 'EUR' }`.
Spec: `seo-infrastructure` — "No offers node at launch"; `pricing` — "Confirmed entry unlocks Offer".
Design: D4, Interfaces/Contracts.

### 1.7 `src/app/seo/generators/hair-salon.schema.ts` (Modify, + spec update) — DONE
Add `'@id': SCHEMA_ID.salon` from 1.4. Update the existing assertion in `hair-salon.schema.spec.ts` to
check the new field; do not touch any other emitted field.
Spec: `seo-infrastructure` — "HairSalon schema on home", "@id stable and referenced by other nodes".

**Deferred to their first real consumer** (kept out of this slice to hold the line-count budget):
`person.schema.ts` → Slice 6a (`/virginia`); `blog-posting.schema.ts` → Slice 8b (articles).

**Slice 1 estimate: ~600 changed lines.** Margin exists (budget 800) — if apply-time count runs hot,
`schema-ids.ts` + `service.schema.ts` can be pulled into their own micro-slice ahead of 1.5/1.7.

---

## Slice 2a — Service-page & design-system primitives (no visible UI)

**Status: DONE** — all 6 tasks implemented and committed on `content/02a-service-infra-primitives`
(base `content/01-domain-schema`). 19 new unit tests added (132/132 full suite passing), `npm run
build` green. See `sdd/content/apply-progress` (Engram, project "virginia") for exact landed
component selectors/inputs.

Branch: `content/02a-service-infra-primitives`. Base: Slice 1.

### 2.1 `src/app/shared/ui/pz-specimen/*` (+ `.spec.ts`) — DONE
Extract the five inline botanical SVGs currently duplicated in `home-page.html` (lines 80–183) into one
component: `planta` input (`Planta` union from `route-seo.ts`), `@switch` over the five, `aria-hidden`,
`stroke="currentColor"`. **Does not touch `home-page.html` in this slice** — that swap happens in Slice 7
alongside the frieze, so this stays a pure addition. Spec: renders exactly one `<svg>` per `planta` value,
each `aria-hidden="true"`.
Design: D3 ("needed in four places" — frieze, `/precios`, service pages, home carta; this slice ships the
component itself).

### 2.2 `src/app/shared/ui/pz-photo-pending/*` (+ `.spec.ts`) — sequential, depends on 2.3 — DONE
`base`/`alt`/`width`/`height` inputs, same contract shape as `pz-picture`. Renders the styled "foto
pendiente de la sesión" label (correct final `width`/`height`/`aspect-ratio`, not a broken-image state)
when `base` is absent from `available-photos.generated.ts` (2.3); renders `pz-picture` once present.
Spec: `service-pages` — "No fabricated hair photography", "Placeholder reads as pending, not broken";
`salon-page` — "One honest placeholder, no fabricated interior".

### 2.3 `scripts/generate-image-variants.mjs` (Modify) + `src/app/shared/ui/pz-photo-pending/available-photos.generated.ts` (Create, committed) + sync-guard spec [P] — DONE
Script emits the generated file (list of `base` names actually present under `public/images/`) as its
last step. Commit the current output (today: the seven existing `atmosfera-*`/`manos-pigmento`/
`textura-lino`/`retrato-virginia` bases — none of the pending service-photo bases). Add a spec **under
`src/`** (Angular's vitest builder only discovers `src/**/*.spec.ts` — a spec beside the `.mjs` script
never runs, per that script's own header comment) asserting the generated file's contents match a fresh
`readdirSync('public/images')` scan.
Design: D9 ("makes the swap a genuine file drop... a spec asserts the generated file matches the
directory").

### 2.4 `src/app/shared/ui/pz-cta/pz-cta.ts` (+ `.html`, `.spec.ts` update) — DONE
Add `accent` boolean input. When `true`, rebind the internal `--pz-cta-ink` custom property to
`var(--pz-accent-text)` — **not** `--pz-accent-live` (Engram #2311: `#3D8B6B` under white is ~3.4:1,
fails AA; `--pz-accent-text` is ~6:1). Applies to both filled and outlined variants via one flag.
Spec: none of the delta specs name this directly — it is the mechanism `service-pages`' "Double CTA"
scenario and the Stitch reading's filled CTA depend on. Design: D8 (accepted per Engram #2311 — narrows
decision #2289 for service routes only).

### 2.5 `src/styles/_tokens.scss` (`--pz-space-2xl: 144px`, additive), `src/styles/_sections.scss`
(Create, `.pz-section-head`: centred `.pz-eyebrow` over a 1px `--pz-hairline` rule over an italic
`--pz-display` title), `src/styles/_typography.scss` (`.pz-eyebrow--accent { color: var(--pz-accent-text) }`) [P] — DONE
Purely additive — no existing rule touched, `#FFFFFF`/hairline/radius/no-shadow invariants untouched.
Design: "Closing the four Stitch gaps" table, row "Section rhythm".

### 2.6 `src/styles/tokens.contrast.spec.ts` (Extend — file already existed from `foundation`) — DONE
Assert all five `--pz-*-text` values (hex-duplicated in the spec per the existing pattern noted in
`generate-image-variants.mjs`'s header comment — a `.spec.ts` can't `getComputedStyle` a `.scss` file) meet
≥4.5:1 against `#FFFFFF` at 11px/700 (`.pz-eyebrow--accent`'s actual size/weight — not large text, needs
4.5:1 not 3:1). Any plant that fails must fall back to `--pz-ink-soft` — if all five already pass (from
`_tokens.scss`'s current values), assert that and leave the fallback path documented, not implemented
speculatively.
Design: Engram #2311 point 1; design.md Open Questions (resolved).

**Slice 2a estimate: ~620 changed lines.**

---

## Slice 2b — `pz-service-page` shared layout

**Status: DONE** — task 2.7 implemented and committed on `content/02b-service-page-layout`
(base `content/02a-service-infra-primitives`). Component-only spec file, no route wired yet
(Slice 4/5 wire the five real containers through this layout). See `sdd/content/apply-progress`
(Engram, project "virginia") for the exact landed `ServiceContent` input contract.

Branch: `content/02b-service-page-layout`. Base: Slice 2a.

### 2.7 `src/app/services/ui/pz-service-page/*` (+ `.spec.ts`) — DONE
The one presentational layout rendering all 9 anatomy parts in fixed order (D1). Inputs: a typed
`ServiceContent` (H1 text, value-prop line, latin binomial, `pricing: ServicePricing`, `faq: {question,
answer}[]`, `crossLinks: [ServicePath, ServicePath]`, photo/before-after `base` names for 2.2) + two named
`<ng-content>` slots for the "qué es y para quién" and "cómo lo hace Virginia" prose (D1 hybrid — order
stays structural, copy stays authorable, no `innerHTML`).
- `host: { '[attr.data-planta]': planta() }`, `planta` **derived** from `seoData(content.path).planta`,
  never a free input (D2) — this is what makes "one accent, never nested" a construction guarantee, not a
  review note.
- Renders both CTAs (reserve → `/reservar`, WhatsApp) together, "visible without scrolling past the
  page's primary content" — place in the closing CTA band per the Stitch reading, item 10.
- Renders the FAQ from the **same** `faq` array passed to `buildFaqPageSchema` (1.5) — literally the
  same reference, not a re-typed copy, so the "answers === visible answers" scenario can't drift.
- Main prose region carries an identifiable class (e.g. `.pz-service-page__body`) excluding CTA/nav/footer
  text, so word-count specs (1.3) can select it precisely.
- Component spec (fixture `ServiceContent`, no real route): exactly one `[data-planta]` in the rendered
  tree; all 9 sections present in DOM order; FAQ `mainEntity.length` equals rendered question count;
  cross-links render as exactly the two paths passed in.
Spec: `service-pages` — "Anatomy parts present and ordered", "Single accent scope per page", "FAQ count
and schema match", "Both CTAs present", "Cross-links match the pairing map". Design: D1, D2.

**Slice 2b estimate: ~330 changed lines** — intentionally small and reviewed in isolation before real
copy lands on top of it in Slices 4/5.

---

## Slice 3 — App shell: header dropdown + centred footer

**Status: DONE** — all 3 tasks implemented and committed on `content/03-header-footer-shell`
(base `content/02a-service-infra-primitives`, commit `28e1655` — branched directly off 2a per this
section's own note below, since 2b and 3 are independent; ran in parallel with 2b in the same working
tree). 14 new/changed unit tests on this branch (26 spec files / 146 tests, all green — 132 baseline +
14). `npm run build` green, 2 prerendered routes (unchanged — no registry flip in this slice). See
`sdd/content/apply-progress` (Engram, project "virginia") for exact landed shapes.

Branch: `content/03-header-footer-shell`. Base: Slice 2b. (Independent of 2b's content — could instead
base directly on 2a if the orchestrator wants 2b and 3 reviewed in parallel by different reviewers; listed
sequential here to keep one linear chain.)

**Why this is safe to ship before any service route exists**: `filterNavEntries`/`buildHeaderNav` (3.1)
and the dropdown's entry list both filter to `status === 'live'` at render time — this is the existing,
already-proven pattern (`site-header.ts`'s current `filterNavEntries(NAV_ROUTES)`), not new design. The
dropdown renders zero entries until Slice 4 starts flipping routes live, then grows automatically with no
further edits — the same "rollback property" D7 already claims for the flat nav. The **home page's own**
frieze/carta markup does not get this filtering for free (it is bespoke, not a `NAV_ROUTES` projection) —
that is why home's own linking work is scheduled later, in Slice 7, after it exists.

### 3.1 `src/app/shared/layout/route-registry.ts` (Modify, + `.spec.ts` update) — DONE
Add pure `buildHeaderNav(entries): { navLeft, wordmark, dropdownServices, reserveCta }` (exact shape is an
implementation choice; must satisfy 3.2's three-zone consumption) filtering `dropdownServices` to
`SERVICE_INDEX` entries whose registry `status === 'live'`. Unit spec: fixture registry with 2/5 service
routes live → dropdown list has exactly those 2; flip one back to `'planned'` → it disappears (D7's
rollback property, tested directly rather than asserted by prose).
Spec: `app-shell` — "Dropdown links to five service routes, no index page" (component-level assertion of
the *filtering logic*; the end-state "exactly five" E2E assertion moves to Slice 9 once all five are
actually live).

### 3.2 `src/app/shared/layout/site-header/*` (Modify) — DONE
`grid-template-columns: 1fr auto 1fr` — nav left, wordmark centred, `RESERVAR` (small-caps, accent-text
colour per the Stitch header reading) right. Disclosure pattern for "Carta" (not `role="menu"` — five
links don't need the APG menu contract):
- `<button aria-expanded aria-controls="header-carta">` + `<ul id="header-carta">`.
- Keyboard: `Enter`/`Space` toggle, `Escape` closes + returns focus to trigger, `ArrowDown` opens + focuses
  first item, blur-outside closes, focus never trapped.
- No-JS path: panel always in prerendered DOM, hidden via `visibility:hidden;opacity:0` (never
  `display:none`) so links stay tabbable; `.header-carta:focus-within .header-carta__panel { visibility:
  visible }` reveals with zero script; `prefers-reduced-motion` removes the transition.
- Below 720px: static expanded list, no hamburger (out of scope).
Component spec: `aria-expanded` toggles on click/Enter/Space; `Escape` closes and moves focus back to the
trigger; panel `role`/`aria-controls` wiring present.
Spec: `app-shell` — "Wordmark centred", "Dropdown links to five service routes, no index page". Design:
"Header dropdown (accessible, degrades without JS)" section.

### 3.3 `src/app/shared/layout/site-footer/*` (Modify) — DONE
Column-centred: italic wordmark → centred small-caps link row (NAV_ROUTES filtered live, **including**
the five service links once they're live) → centred copyright line, in that order. NAP stays present,
only re-laid-out (do not regress `app-shell`'s existing "NAP consistency" scenario).
Spec: `app-shell` — "Footer content order and centring", "NAP consistency" (regression guard — assert it
still holds after the re-layout, don't just add new assertions).

**Slice 3 estimate: ~500 changed lines.**

---

## Slice 4 — Service pages, batch A (2 of 5)

Branch: `content/04-service-pages-batch-a`. Base: Slice 3.

Pages: `/coloracion-vegetal-aveda` (romero) and `/mechas-babylights-balayage` (espliego) — the two
routes the "Raíz Botánica" study identifies as attacking a contested keyword sideways (`babylights`
instead of head-on `mechas`), grouped together since they cross-link each other AND both cross-link
`/tratamientos-capilares` (shipping in batch B — cross-link hrefs render fine via `routerLink` before the
target route exists in `app.routes.ts`, same "grows without further edits" property as Slice 3; this
transient state is the same one `design.md`'s own rollout note already accepts for the sitemap's
half-flipped intermediate builds).

### 4.1 `src/app/services/coloracion-vegetal-aveda/*` [P — independent file tree from 4.2] — DONE
Container passing a `ServiceContent` to `pz-service-page` (2.7): H1 = registry `primaryKeyword`
("coloración sin amoniaco Ciudad Real") + value-prop line; 150–200-word "qué es y para quién" (client
language, not stylist jargon); "cómo lo hace Virginia" process narrative; FAQ 4–6 real Q&A; cross-links
`['tratamientos-capilares', 'mechas-babylights-balayage']` per the pairing table; total body copy 700–900
useful words (word-floor is a spec assertion via `countWords` from 1.3 — reviewers still check
usefulness, padding is a review-time judgment call, not a passing test). Flip `route-seo.registry.json`'s
`coloracion-vegetal-aveda` entry `status: 'planned' → 'live'`. Wire `app.routes.ts` + `app.routes.server.ts`
(`RenderMode.Prerender`).
Spec: `service-pages` (all requirements) — "Client-language... section" (150–200), "700-900 useful words",
"One plant accent, scoped", "Two cross-links per the study's pairing map" (this route's row), "Unique
primary keyword, registry-driven, live status".

### 4.2 `src/app/services/mechas-babylights-balayage/*` [P — independent file tree from 4.1] — DONE
Same shape as 4.1: H1 = "babylights Ciudad Real"; cross-links `['coloracion-vegetal-aveda',
'tratamientos-capilares']`; registry flip + routes wiring, same as above.
Spec: same scenarios as 4.1, this route's registry row.

**Slice 4 estimate: ~460 changed lines.**

---

## Slice 5 — Service pages, batch B (3 of 5)

Branch: `content/05-service-pages-batch-b`. Base: Slice 4.

Pages: `/rastas` (esparto), `/extensiones-cabello-natural` (vid), `/tratamientos-capilares` (olivo) — the
open-ground niche (`rastas Ciudad Real` has zero local competition) plus the two that complete every
pairing-map cross-link started in Slice 4.

### 5.1 `src/app/services/rastas/*` [P] — DONE
Cross-links `['tratamientos-capilares', 'extensiones-cabello-natural']`. Same shape/spec references as 4.1.

### 5.2 `src/app/services/extensiones-cabello-natural/*` [P] — DONE
Cross-links `['mechas-babylights-balayage', 'tratamientos-capilares']`. Same shape/spec references.

### 5.3 `src/app/services/tratamientos-capilares/*` [P] — DONE
Cross-links `['coloracion-vegetal-aveda', 'rastas']`. Same shape/spec references. **After this task, all
five service routes are mutually cross-link-resolvable and all five registry entries are `'live'`** — the
pairing-map table in `service-pages` spec is now fully satisfiable end-to-end for the first time.

**Slice 5 estimate: ~680 changed lines.**

---

## Slice 6a — `/virginia` + `/el-salon`

**Status: DONE** — all 3 tasks implemented and committed on `content/06a-virginia-el-salon`
(base `content/05-service-pages-batch-b`, commit `d8fdb81`). 16 new unit tests added (35 spec
files / 221 tests, all green — 205 baseline + 16). `npm run build` green, 9 prerendered routes,
sitemap carries 9 URLs. See `sdd/content/apply-progress` (Engram, project "virginia") for exact
landed shapes.

Branch: `content/06a-virginia-el-salon`. Base: Slice 5.

### 6.1 `src/app/seo/generators/person.schema.ts` (+ `.spec.ts`) — DONE
Deferred from Slice 1 to its first real consumer. `buildPersonSchema` with stable `@id` (`SCHEMA_ID`,
1.4), `name`, `worksFor: salonRef()`. Spec: `@id` is a fixed string, not derived per-call (stability is
literally "the same value on every build", assert by calling twice and comparing).
Spec: `seo-infrastructure` — "All four generators produce valid JSON-LD"; `virginia-page` — "Person @id is
stable and referenced" (generator half; the cross-page half lands with 8.2's `BlogPosting` in Slice 8b).

### 6.2 `src/app/salon/virginia/*` — DONE
H1 = "Virginia peluquera Ciudad Real"; **no** `[data-planta]` scope anywhere in the subtree; real
experience/credentials content (not a photo + name); emits `Person` JSON-LD (6.1) + `BreadcrumbList`.
Registry flip `virginia: 'planned' → 'live'`; routes wiring, `RenderMode.Prerender`.
Spec: `virginia-page` — "Neutral, no accent scope", "Person @id is stable and referenced", "Live status".

### 6.3 `src/app/salon/el-salon/*` [P — independent of 6.2] — DONE
No `primaryKeyword` (registry entry already has `null` — confirm, do not add one; keyword-uniqueness
validator already exempts null-keyword rows, no script change needed). Uses only `atmosfera-*` botanical
imagery for non-interior visuals + exactly one `pz-photo-pending` (2.2) slot for the pending interior
photo — **no** AI-generated interior/people imagery, no stock. Registry flip; routes wiring.
Spec: `salon-page` — "Exempt from uniqueness check", "One honest placeholder, no fabricated interior",
"Live status".

**Slice 6a estimate: ~460 changed lines.**

---

## Slice 6b — `/precios` + `/reservar`

Branch: `content/06b-precios-reservar`. Base: Slice 6a.

### 6.4 `src/app/salon/precios/*`
`@for` over `SERVICE_INDEX` (1.1) × `pricing` (1.2): one row per service, each its own **sibling**
`[data-planta]` scope (never nested, never wrapped in a sixth scope) — reuse `pz-specimen` (2.1) for the
row glyph. All five rows render "Consultar" (no numeric price/duration — every pricing entry is still
`pending`). Each row links to its matching live service route. Registry flip `precios: 'planned' →
'live'`; routes wiring.
Spec: `precios-page` — "Five sibling scopes present", "No numeric price at launch", "Metadata matches
registry", "Row links resolve".

### 6.5 `src/app/booking/reservar/*` [P — independent of 6.4]
Content: how booking works + what to send Virginia (service wanted, preferred dates, hair
length/history). **Must not** duplicate `/contacto`'s address/hours/map/NAP, and its H1 must share no
common keyword phrase with `/contacto`'s H1 — write both H1s side by side before committing either.
WhatsApp + `tel:` CTAs only, no calendar widget/iframe. `RenderMode.Prerender` (see the corrected app-shell
requirement at the top of this file — **not** `RenderMode.Server`). Registry flip; routes wiring.
Spec: `reservar-page` — "H1s do not overlap", "No NAP/map duplication", "No calendar widget", "Prerender
render mode", "Static output exists", "Live status".

**Slice 6b estimate: ~380 changed lines.**

---

## Slice 7 — Home page Stitch alignment

Branch: `content/07-home-stitch-alignment`. Base: Slice 6b.

Scheduled here, **after** all five service routes exist and are live (Slices 4–5), so the home page's
bespoke frieze/carta markup can link unconditionally — no per-plate live-status gating needed, and the
`service-pages` spec's "each of the five live service routes MUST be linked" scenario is true the moment
this slice merges, not eventually-true across a half-built chain.

### 7.1 `src/app/shared/ui/pz-plate/*` (Modify, + spec update)
Add optional `price` (pre-formatted string from `formatFrom()`, 1.2) and `href` inputs. `href` makes the
plate a link via one `<a>` + stretched `::after` — **both optional**, so no existing usage (the home carta
today) breaks by default. `pz-plate` stays presentational; it learns nothing about the pricing domain
(gets a pre-formatted string, not a `ServicePricing` object).
Design: "Closing the four Stitch gaps" table, row "Carta price column".

### 7.2 `src/app/salon/home/home-page.{ts,html,scss}` (Modify) — depends on 7.1, 2.1
- Hero frieze: `<nav class="home-frieze">` under the hero CTA row, `@for` over `SERVICE_INDEX`, each
  `<a data-planta="…">` holding a `pz-specimen` glyph (2.1) + `.pz-eyebrow` uppercase label
  (ROMERO/ESPLIEGO/ESPARTO/VID/OLIVO). Five **sibling** scopes — bare glyphs, deliberately **no**
  `border-radius: 50%` icon-well chrome (would contradict the one-radius rule for decoration only).
- Carta: each of the five existing `<pz-plate>` blocks gains `[price]="formatFrom(pricingFor(planta))"`
  and `[href]="'/' + path"`, sourced from the same `pricing`/`service-index` modules `/precios` (6.4)
  reads — never a hardcoded literal, so the two can never drift.
- Value-prop band + section intros: apply `.pz-section-head` (2.5) and centred layout per the Stitch
  reading's "editorial centring" gap.
- Update the doc comment at the top of `home-page.ts` (currently describes the carta as "non-interactive
  by design... intentionally carry no routerLink" — that sentence is now false and must be replaced, not
  left stale).
Spec: `home-page` — "Five frieze links resolve", "Carta price matches /precios", "Value-prop band
centred", "Carta and frieze link to all five service routes".

### 7.3 `src/app/salon/home/home-page.spec.ts` (Modify) — depends on 7.2
**Replace**, do not delete or relax, the test at line 65 (`'has no <a href> targeting any of the five
future service routes...'`, driven by `FUTURE_ROUTE_PREFIXES` at line 14) with its inverse: assert each of
the five service routes IS linked from the frieze or the carta, plus `/virginia`, `/el-salon`, `/precios`,
`/reservar`, `/diario` are reachable via standard nav/footer (they are, transitively, via Slice 3's
already-live-status-filtered footer — this test only needs to confirm the assertion, not add new nav
wiring). Every other existing test in this file (layout shell, SEO registry application, JSON-LD, no eager
map iframe) stays unmodified.
Spec: `home-page` — "Carta and frieze link to all five service routes" (this IS the binding spec scenario
for the replaced test — cite it in the new test's `it()` description like the existing tests do).

**Slice 7 estimate: ~240 changed lines.**

---

## Slice 8a — `/diario` infrastructure

Branch: `content/08a-diario-infra`. Base: Slice 7.

### 8.1 `src/app/diario/posts.manifest.json` + `src/app/diario/domain/post-manifest.ts` (+ `.spec.ts`)
Three entries (slug, title, description, publish intent — one per contested niche per proposal decision
4). `post-manifest.ts` imports the JSON, joins each entry to its body component by slug (D6). Bijection
spec: every manifest slug has a matching component reference and vice versa (same drift-proof pattern as
the SEO registry / pricing bijections).
Spec: `diario` — "Three prerendered posts" (manifest half).

### 8.2 `src/app/diario/domain/post-seo.resolver.ts` (+ `.spec.ts`)
Route `resolve` (D5 — not a container `ngOnInit` call) merging matched-slug metadata into
`route.snapshot.data['seo']` so `SeoService.applyFromActivatedRoute` picks it up with zero `SeoService`
changes. Unknown slug → `RedirectCommand('/diario')` (verified present in the installed `@angular/ssr`
22.1.3 per Engram #2311 — no fallback branch needed).
Spec: `seo-infrastructure` — "Title and canonical set on navigation" (registry-less-route case).

### 8.3 `src/app/diario/diario-page/*` (index) [P — independent of 8.4]
Lists all three articles with links to `/diario/:slug`. H1/`<title>` do not contain "Ciudad Real" (title/
H1 only — the registry `description` for `diario` deliberately does and stays exempt, do not "fix" it).
Registry flip `diario: 'planned' → 'live'`.
Spec: `diario` — "Title/H1 clean", "Description exempt", "Index lists three articles", "Live status".

### 8.4 `src/app/diario/post-page/*` (shell, `NgComponentOutlet`) [P — independent of 8.3]
Resolves the post component by slug (8.1) and renders it via `NgComponentOutlet` — content present in
prerendered HTML, never `innerHTML`/an unsanitized string. Component spec can use a minimal stub body
component (the three real ones land in Slice 8b) to prove the shell mechanism in isolation.
Spec: `diario` — "Content present without JS".

### 8.5 `scripts/validate-keyword-uniqueness.mjs` (Modify, + spec update)
Add the blog rule: no post **title** may contain "ciudad real" (accent/case-insensitive, reuse the
existing `normalizeKeyword`-style normalization). Title only — descriptions exempt (the shipped `/diario`
registry description contains it deliberately; do not write a rule that would flag it).
Spec: `seo-infrastructure` — "Title/H1 violation fails build", "Description exempt, build passes".

### 8.6 `scripts/generate-sitemap.mjs` (Modify, + spec update)
Write-time `status === 'live'` filter (a `'planned'` entry's files must not appear in `sitemap.xml` even
if they exist on disk from a prior partial build — `console.warn` per exclusion, not throw, so a
half-flipped intermediate build still succeeds). Allow `diario/{slug}` paths that have no matching
registry entry, with a documented default `changefreq`/`priority`.
Spec: `seo-infrastructure` — "Planned routes excluded", "Blog posts get a default priority", "Sitemap
regenerates without manual editing".

### 8.7 `app.routes.ts` / `app.routes.server.ts` (Modify) — depends on 8.1–8.4
`/diario` (index) + `/diario/:slug` with `getPrerenderParams` returning the three manifest slugs, both
`RenderMode.Prerender`.
Spec: `diario` — "Three prerendered posts" (build-output half); `app-shell` — "Diario slugs prerendered
via getPrerenderParams".

**Slice 8a estimate: ~730 changed lines** — tight against the 800 budget on its own; if apply-time count
runs over, pull 8.5+8.6 (the two script changes, ~160 lines together) into their own trailing micro-slice
before 8b.

---

## Slice 8b — `/diario` three launch articles

Branch: `content/08b-diario-articles`. Base: Slice 8a.

### 8.8 `src/app/seo/generators/blog-posting.schema.ts` (+ `.spec.ts`)
Deferred from Slice 1. `buildBlogPostingSchema`, `author` referencing `Person.@id` (6.1's stable `@id` —
assert equality against `/virginia`'s emitted value, not a re-typed literal).
Spec: `seo-infrastructure` — "All four generators produce valid JSON-LD"; `virginia-page` — "Person @id is
stable and referenced" (the cross-page half, completing 6.1's deferred assertion); `diario` — "Three
prerendered posts" (schema half).

### 8.9 `src/app/services/ui/pz-service-anchor/*` (+ `.spec.ts`)
Renders a service link whose text **is** `seoData(path).primaryKeyword` verbatim — exact-match anchor
text cannot drift because it is derived, never typed twice. First and only consumer in this change: each
article's single outbound link to its paired service page.
Spec: `diario` — "Anchor text matches target keyword".

### 8.10–8.12 Three post body components, one per contested niche [P — independent file trees]
Each: standalone component (not markdown, not an HTML string — D6), substantive answer-a-question body
copy, prerendered, exactly one `pz-service-anchor` (8.9) link to its paired service route, `BlogPosting`
JSON-LD (8.8) via the same route-`resolve` wiring (8.2). H1/`<title>` never contain "Ciudad Real" (build-
enforced by 8.5 — treat a red build here as the spec working correctly, not a bug to route around).
Spec: `diario` — "Title/H1 clean", "Anchor text matches target keyword", "Prerendered content, no
client-only render".

**Slice 8b estimate: ~520 changed lines.**

---

## Slice 9 — Final: Playwright coverage, OG/Twitter, sitemap audit, full-suite verification

Branch: `content/09-e2e-final-verification`. Base: Slice 8b. This is the only slice where the
end-state-only assertions deferred from earlier slices (Slice 3's "exactly five in the dropdown", Slice
7's frieze-links scenario at full registry state) get their real Playwright coverage — everything below
them is already true by construction; this slice proves it against the actual built site.

### 9.1 `e2e/*` — extend `ROUTES` arrays + new route-specific specs [P]
Per new route: axe-core AA (reuse `accessibility.spec.ts`'s pattern), zero external requests
(fonts/Maps — same `FORBIDDEN_HOST_SUBSTRINGS`), canonical↔sitemap parity (reuse
`canonical-sitemap.spec.ts`'s pattern, extend `ROUTES`). Service-page-specific: exactly one
`[data-planta]` per page. Header-specific: dropdown reachable and operable keyboard-only (`Tab` to
trigger, `Enter` opens, `ArrowDown`/`Tab` moves through links, `Escape` closes and returns focus).
Spec: every capability's respective "Live status"/accessibility-adjacent scenarios; `design-system` —
"`/precios` sibling exception holds" (E2E DOM-nesting check).

### 9.2 `src/app/seo/application/seo.service.spec.ts` (Modify)
Add the no-accumulation assertions foundation follow-up 2 was missing: navigate route A → route B, assert
exactly one set of OG (`og:title`/`og:description`/`og:url`/`og:type`) and Twitter
(`twitter:card`/`twitter:title`/`twitter:description`) tags exists, matching only route B. **This is a
coverage addition, not a bug fix** — `AngularMetadataAdapter.setOpenGraph`/`setTwitterCard` already upsert
correctly via `Meta.updateTag` (verified in design phase, Engram #2311) — do not "fix" working code while
adding the test.
Spec: `seo-infrastructure` — "No OG/Twitter accumulation across navigation".

### 9.3 `src/app/seo/generate-sitemap.spec.ts` (Modify)
Final-state assertion: sitemap contains all 12 registry routes (all now `'live'`) + 3 blog-post paths = 15
`<url>` entries, zero `'planned'` leakage.
Spec: `seo-infrastructure` — "Sitemap reflects prerendered output" (full 12+3 count, superseding the
earlier 2-route version of this assertion).

### 9.4 Registry status audit (no new code — verification task)
Confirm all twelve `route-seo.registry.json` entries read `status: 'live'` (each flip already landed in
its own slice above — this task is a grep-and-confirm, not a new flip). `npm run build` green
(prebuild validator + image pipeline + postbuild sitemap all pass). Full `npm test -- --watch=false` and
Playwright suite green.
Spec: `seo-infrastructure` — "All twelve routes present and live"; proposal.md Success Criteria (all
bullets).

**Slice 9 estimate: ~320 changed lines.**

---

## Environment notes for every slice (BRIEF §5 — do not rediscover this)

- Global Node v22.19.0 hard-exits on any `@angular/cli@22.x` command. Use portable Node v22.23.2 win-x64
  (own scratchpad extraction, prepended to `PATH`), never touch the global install.
- `npx ng test -- --watch=false` fails schema validation — use `npm test -- --watch=false` (full suite) or
  `npx ng test --watch=false --include='<glob>'` (focused).
- Always `npm run build`, never bare `ng build` — the prebuild validator and postbuild sitemap are gates,
  not optional steps.
- `scripts/serve-dist.mjs` serves `dist/pureza/browser` on port 4310 for Playwright, works under the
  global Node.

## Open items carried from `design.md`, resolution status

- D8 (accent CTA narrows decision #2289 for service routes) — **accepted**, Engram #2311. Slice 2a task
  2.4 implements it as specified, no further confirmation needed.
- `tokens.contrast.spec.ts` requirement — **scheduled**, Slice 2a task 2.6.
- Word floor vs. review budget — **resolved**: service pages split 2+3 (Slices 4/5) as design.md required,
  *and* the shared infra those pages depend on (pz-service-page, pz-specimen, pz-photo-pending, pz-cta
  accent, tokens) was further pulled into its own dedicated Slices 2a/2b specifically so the 2+3 content
  slices stay well under budget rather than merely "not five at once." See Review Workload Forecast below.
