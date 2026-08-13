# Design: `content` — the ten remaining routes

## Technical Approach

Compose, never re-invent. Three pure domain modules become the only sources of truth —
`services/domain/service-index.ts` (the five plant-owned routes, derived from the registry),
`services/domain/pricing.ts` (tariffs), `diario/domain/post-manifest.ts` (+ its JSON sibling).
Every consumer reads them: the hero frieze, the header dropdown, the home carta, `/precios`, the five
service pages, the four JSON-LD generators and the sitemap script. Drift therefore fails a unit test
instead of surviving review. The five service routes are thin containers over **one** presentational
layout that owns the 9-part anatomy *and* the `[data-planta]` scope, so neither order nor accent is a
convention anyone has to remember.

## Architecture Decisions

| # | Choice | Rejected alternative | Rationale |
|---|---|---|---|
| D1 | `pz-service-page` = one presentational layout renders parts 1–9 in fixed order; five thin route containers pass a typed `ServiceContent` and project the two prose sections via named `<ng-content>` slots | (a) five independent pages using shared section atoms; (b) one fully data-driven page with copy in a data file | (a) lets the 9-part order drift page to page — the exact failure §2 forbids. (b) can't hold the inline `routerLink` cross-links the study mandates without `innerHTML`. Hybrid keeps order structural and copy authorable. |
| D2 | The layout binds `host: { '[attr.data-planta]': planta() }` where `planta` is **derived** from `seoData(content.path).planta`, not passed in | a free `planta` input on each page | The accent cannot disagree with the registry, and the layout is the only node in the subtree that sets the attribute — so "one accent per service page, never nested" is enforced by construction. Guarded by a spec asserting `querySelectorAll('[data-planta]').length === 1` on each of the five. |
| D3 | Specimen SVGs extracted from `home-page.html` into `pz-specimen` (`planta` input, `@switch`) | keep 5 inline `<ng-template>`s and copy them to the frieze, `/precios` and the service pages | They are now needed in four places. `pz-plate`'s `input.required` TemplateRef contract is untouched — callers pass `<ng-template #s><pz-specimen planta="romero"/></ng-template>`. |
| D4 | `pricing.ts` is a **discriminated union** on `status`; the `pending` branch types `fromEur`/`durationMinutes` as `null` | one interface with optional numbers + a runtime `if` | `buildServiceSchema` literally cannot construct an `Offer` while pending — there is no `number` in scope to fabricate. Decision-2 becomes a compile error, not a comment. |
| D5 | Blog SEO arrives through a **route `resolve`**, not a container call | page container calling `seo.apply()` in `ngOnInit` | Resolved data merges into `route.snapshot.data`, so `SeoService.applyFromActivatedRoute` picks up `data['seo']` with **zero SeoService changes** and the "containers never set metadata" invariant survives for registry-less routes. |
| D6 | Post metadata lives in `diario/posts.manifest.json`; `post-manifest.ts` imports it and joins each entry to its body component by slug | metadata inline in the `.ts` manifest | Same proven pattern as `route-seo.registry.json`: `generate-sitemap.mjs` / `validate-keyword-uniqueness.mjs` are plain `.mjs` and cannot import TypeScript. A bijection spec asserts every JSON slug has a component and vice versa. |
| D7 | Header becomes a curated **three-zone** projection (`buildHeaderNav()` pure fn) instead of `@for` over `filterNavEntries` | keep the flat `@for` | With 12 live routes the flat loop renders 11 links. The registry stays the source; the projection is a pure, unit-tested function, so flipping a `status` back still removes the link everywhere (rollback property intact). |
| D8 | Accent CTA via a boolean `accent` input that rebinds one internal custom property (`--pz-cta-ink`), background = `--pz-accent-**text**` | new `variant: 'accent'`; or keep CTAs ink-neutral | Stitch's most visible accent moment is that filled green button. `--pz-accent-live` (#3D8B6B) under white text is ~3.4:1 — **fails AA**; `--pz-accent-text` (#2C6A4F) is ~6:1 and passes. One flag covers both filled and outlined variants. Narrowly supersedes decision #2289 for service routes only. |
| D9 | `pz-photo-pending` decides placeholder-vs-photo from `available-photos.generated.ts`, **emitted by the existing `generate-image-variants.mjs` prebuild** | hand-maintained availability array; or swapping the tag in the template | Makes the swap a genuine file drop: copy `resultado-romero.jpg` into `public/images/`, run `npm run build`, the component flips itself. The script already enumerates sources. A spec asserts the generated file matches the directory. |

## Data Flow

    route-seo.registry.json ──┬──→ service-index.ts ──┬──→ home frieze (5 sibling scopes)
                              │                       ├──→ header "Carta" dropdown
                              │                       ├──→ /precios rows
                              │                       └──→ pz-service-anchor (exact-match anchor text)
                              ├──→ pricing.ts ────────┬──→ home carta price column
                              │      (path-keyed)     ├──→ service tariff table
                              │                       ├──→ /precios
                              │                       └──→ Service.offers  (ONLY when confirmed)
                              ├──→ seoData(path) ─────→ pz-service-page → [data-planta] host attr
                              └──→ generate-sitemap.mjs (NEW: status==='live' write-time filter)

    posts.manifest.json ──→ post-manifest.ts ──┬──→ getPrerenderParams()  [verified present in @angular/ssr 22.1.3]
                                               ├──→ postSeoResolver → route.data.seo → SeoService
                                               ├──→ NgComponentOutlet (post body)
                                               └──→ generate-sitemap.mjs (registry-less path allowance)

    JSON-LD entity graph (per page, nodes carry inline @type+@id+name+url refs):
      HairSalon@{url}/#salon ←── Service.provider ←── /coloracion-... etc.
                             ←── Person.worksFor  ←── /virginia
      Person@{url}/virginia#person ←── BlogPosting.author ←── /diario/:slug

## Closing the four Stitch gaps

| Gap | Concrete approach | Invariant safety |
|---|---|---|
| Five-plant frieze | `<nav class="home-frieze">` under the hero CTA; `@for` over `SERVICE_INDEX`; each `<a data-planta="…">` holds a `pz-specimen` glyph + `.pz-eyebrow` label. Five **sibling** scopes. | No new colour. **Deliberately not copied**: Stitch's circular icon wells — a `border-radius: 50%` chrome would contradict the "~2px radius, one radius" rule for decoration only. Bare glyphs read closer to the service-page mockup anyway. |
| Carta price column | `pz-plate` gains two optional inputs: `price` (a **pre-formatted string** from `formatFrom()`) and `href` (makes the plate a link via one `<a>` + stretched `::after`). | `pz-plate` stays presentational and learns nothing about the pricing domain. Existing required `specimen`/`photo` contract unchanged. Both inputs optional ⇒ no existing usage breaks. |
| Editorial centring | Header: `grid-template-columns: 1fr auto 1fr` — nav left, wordmark centre, `Reservar` right. Footer: column-centred, wordmark + small-caps link row (incl. the five service links) + copyright; **NAP is kept**, only re-laid-out. Section intros: new `.pz-section-head` utility in `src/styles/_sections.scss`. | Utility is tokens-only. Dropping NAP would regress app-shell spec's "NAP consistency" — explicitly retained. |
| Section rhythm | One additive token `--pz-space-2xl: 144px`; `.pz-section-head` = centred `.pz-eyebrow` over a 1px `--pz-hairline` rule over an italic `--pz-display` title. New modifier `.pz-eyebrow--accent { color: var(--pz-accent-text) }`. | Purely additive to `_tokens.scss` — palette, `#FFFFFF` ground, hairlines, radius and no-shadow rules all untouched. `--pz-accent-text` degrades to `--pz-ink-soft` outside a `[data-planta]` scope, so no component ever names a plant token. |

**Correction to carry into the specs**: the brief calls `/precios` "the sole exception" to one-accent-per-page, but the shipped home carta already renders five sibling `[data-planta]` plates. The real invariant is **never nested; one accent per *service route***. Home and `/precios` are both legitimate five-sibling pages. The design-system delta must say this, not relax it.

## Header dropdown (accessible, degrades without JS)

Disclosure pattern, not `role="menu"` — the APG menu keyboard contract buys nothing for five links.

- `<button type="button" aria-expanded="…" aria-controls="header-carta">Carta</button>` + `<ul id="header-carta">` of the live `SERVICE_INDEX` entries.
- Keyboard: `Enter`/`Space` toggle; `Escape` closes and returns focus to the trigger; `ArrowDown` opens and focuses the first item; blur outside closes. Focus is never trapped.
- **No-JS path**: the panel is always in the prerendered DOM and hidden with `visibility: hidden; opacity: 0` — never `display: none` — so its links stay tabbable and `.header-carta:focus-within .header-carta__panel { visibility: visible }` reveals it with zero script. `prefers-reduced-motion` removes the transition.
- **Belt and braces**: the same five links also live in the centred footer, so the dropdown is an enhancement and never the only path to a service page (also better internal-link equity).
- Below 720px the panel renders as a static expanded list (no hamburger in scope).

## File Changes

| File | Action | Description |
|---|---|---|
| `src/app/services/domain/service-index.ts` | Create | `SERVICE_INDEX` derived from registry entries where `planta !== null`; `ServicePath` union type. |
| `src/app/services/domain/pricing.ts` (+`.spec.ts`) | Create | Discriminated union, `formatFrom`/`formatDuration`, path↔registry bijection spec. |
| `src/app/services/ui/pz-service-page/*` | Create | The 9-part layout; host `[attr.data-planta]`; named slots for the two prose sections. |
| `src/app/services/{coloracion-vegetal-aveda,mechas-babylights-balayage,rastas,extensiones-cabello-natural,tratamientos-capilares}/*` | Create | Five containers: `ServiceContent` + prose + FAQ array + two cross-links. |
| `src/app/shared/ui/pz-specimen/*` | Create | Five botanical SVGs, `planta` input, `aria-hidden`, `stroke="currentColor"`. |
| `src/app/shared/ui/pz-photo-pending/*` | Create | Honest placeholder; `base`/`alt`/`width`/`height`; renders `pz-picture` once the asset is generated. |
| `src/app/shared/ui/pz-photo-pending/available-photos.generated.ts` | Create | Emitted by `generate-image-variants.mjs`; committed; sync-guarded by a spec. |
| `src/app/shared/ui/pz-service-anchor/*` | Create | Renders a service link whose text **is** `seoData(path).primaryKeyword` — exact-match anchor text cannot drift. |
| `src/app/diario/{posts.manifest.json,domain/post-manifest.ts,domain/post-seo.resolver.ts,diario-page/*,post-page/*,posts/*}` | Create | Index, `NgComponentOutlet` post shell, 3 post components. |
| `src/app/salon/{virginia,el-salon,precios}/*`, `src/app/booking/reservar/*` | Create | Four remaining routes. |
| `src/app/seo/domain/schema-ids.ts` | Create | `SCHEMA_ID` + `salonRef()`/`personRef()` inline reference helpers. |
| `src/app/seo/generators/{faq-page,service,person,blog-posting}.schema.ts` (+specs) | Create | Four generators. `FAQPage` consumes the **same** array the template renders. |
| `src/app/seo/generators/hair-salon.schema.ts` (+spec) | Modify | Add `'@id': SCHEMA_ID.salon`; update the existing assertion. |
| `src/app/seo/route-seo.registry.json` | Modify | Ten `status` flips only. Never a keyword edit. |
| `src/app/app.routes.ts`, `app.routes.server.ts` | Modify | Ten routes + `diario/:slug` with `getPrerenderParams`. |
| `src/app/shared/layout/route-registry.ts` (+spec) | Modify | Add pure `buildHeaderNav()`. |
| `src/app/shared/layout/site-header/*`, `site-footer/*` | Modify | Three-zone centred header + disclosure dropdown; centred footer with service links (NAP kept). |
| `src/app/shared/ui/pz-plate/*` | Modify | Optional `price`, optional `href` (+ `RouterLink` import). |
| `src/app/shared/ui/pz-cta/*` | Modify | `accent` boolean → `--pz-cta-ink: var(--pz-accent-text)`. |
| `src/app/salon/home/home-page.{ts,html,scss,spec.ts}` | Modify | Frieze, carta prices + links, rhythm. **`home-page.spec.ts:65` "no dead links to future routes" must be replaced** by its inverse in the same slice. |
| `src/styles/{_tokens.scss,_sections.scss,_typography.scss}` | Modify/Create | `--pz-space-2xl`; `.pz-section-head`; `.pz-eyebrow--accent`. |
| `scripts/generate-sitemap.mjs` (+spec) | Modify | Write-time `status === 'live'` filter (+`console.warn` per exclusion, not throw — preserves revertibility); allow `diario/{slug}` paths from the post manifest with its `changefreq`/`priority`. |
| `scripts/validate-keyword-uniqueness.mjs` (+spec) | Modify | Blog rule: no post **title** may contain "ciudad real" (accent/case-insensitive). Descriptions exempt — the shipped `/diario` description contains it deliberately. |
| `scripts/generate-image-variants.mjs` | Modify | Emit `available-photos.generated.ts`. |
| `src/app/seo/application/seo.service.spec.ts` | Modify | Foundation follow-up 2: no-accumulation assertions for `og:title/description/url/type` + `twitter:card/title/description`. **Verified: the adapter already upserts via `Meta.updateTag` — this is a coverage gap, not a bug.** |
| `e2e/**` | Create | Per new route: axe-core AA, zero external requests, canonical↔sitemap parity, single `[data-planta]` on service pages. |

## Interfaces / Contracts

```ts
// services/domain/pricing.ts — the pending branch has no number to fabricate.
export type ServicePricing =
  | { readonly status: 'pending';   readonly path: ServicePath; readonly fromEur: null;
      readonly durationMinutes: null; readonly rows: readonly TariffRow[]; readonly note: string }
  | { readonly status: 'confirmed'; readonly path: ServicePath; readonly fromEur: number;
      readonly durationMinutes: number; readonly rows: readonly TariffRow[]; readonly note: string };

export const formatFrom = (p: ServicePricing): string =>
  p.status === 'pending' ? 'Consultar' : `Desde ${p.fromEur} €`;

// seo/generators/service.schema.ts — offers exists only inside the narrowed branch.
export function buildServiceSchema(c: ServiceSchemaInput): Record<string, unknown> {
  const base = { '@context': 'https://schema.org', '@type': 'Service',
                 '@id': SCHEMA_ID.service(c.path), name: c.name, description: c.description,
                 areaServed: { '@type': 'City', name: 'Ciudad Real' }, provider: salonRef() };
  return c.pricing.status === 'confirmed'
    ? { ...base, offers: { '@type': 'Offer', price: c.pricing.fromEur, priceCurrency: 'EUR' } }
    : base;
}
```

Stable placeholder filenames (decided now, so the photoshoot is a pure drop):
`resultado-{planta}` 1200×800 · `antes-despues-{planta}-{1|2|3}` 800×800 · `salon-interior-{1|2|3}` 1200×800.

## Testing Strategy

| Layer | What to test | Approach |
|---|---|---|
| Unit | pricing↔registry bijection; `formatFrom`/`formatDuration`; pending ⇒ **no** `offers` key; `buildHeaderNav`; post-manifest↔JSON bijection; `postSeoResolver` (incl. unknown slug → `RedirectCommand('/diario')`); the four generators; `available-photos.generated.ts` sync | vitest, pure functions, no TestBed where avoidable |
| Component | Exactly one `[data-planta]` per service page; all 9 anatomy parts present in order; FAQ JSON-LD answers === visible answers; dropdown `aria-expanded` + `Escape` returns focus; **inverted** home "links to all five service routes" | `RouterTestingHarness` over the real `app.routes` (existing pattern) |
| Build | Sitemap excludes `planned`, includes 12 live + 3 posts; validator rejects a post title containing "Ciudad Real" | existing `generate-sitemap.spec.ts` / `validate-keyword-uniqueness.spec.ts` fixtures |
| E2E | axe-core AA, zero external requests, canonical↔sitemap parity on every new route; dropdown keyboard-only reachable | Playwright, matching `/` and `/contacto` coverage |

## Threat Matrix

| Boundary | Applicability | Design response | Planned RED tests |
|---|---|---|---|
| Documentation-like paths | **N/A** — no file-type classification or execution of repo content; blog bodies are compiled Angular components, never interpreted text | — | — |
| Git repository selection | **N/A** — no `git` invocation in any changed code or script | — | — |
| Commit state | **N/A** — no index/worktree interaction | — | — |
| Push state | **N/A** — no ref resolution or push | — | — |
| PR commands | **N/A** — no PR automation | — | — |

Routing here is Angular client/prerender routing with no shell, subprocess or VCS boundary. The two
build scripts (`prebuild`/`postbuild`) read repo JSON and write into `dist/` only — no user input, no
argument composition; their existing `.spec.ts` fixtures remain the boundary. Recorded as not
applicable rather than expanded.

## Migration / Rollout

No data migration. Every route is additive and gated by its registry `status`; flipping one back to
`'planned'` removes it from the header projection, the sitemap and the route table together. Sitemap
filtering warns rather than throws precisely so a half-flipped intermediate state still builds. The
five non-additive files (`home-page.*`, `site-header/**`, `site-footer/**`, the two scripts) revert to
their `foundation` state at `b8f778e`.

## Open Questions

- [ ] D8 narrows decision #2289 (brand-neutral CTAs) to non-service routes. Confirm, or keep every CTA ink and accept a visibly flatter service page than the mockup.
- [ ] `.pz-eyebrow--accent` needs `tokens.contrast.spec.ts` to assert ≥4.5:1 for all five `--pz-*-text` values at 11px/700. If any fails, that plant's eyebrow falls back to `--pz-ink-soft`.
- [ ] Word floor (700–900) versus the review budget: the five service pages are copy-heavy. `sdd-tasks` should slice them 2+3, not 5-at-once.
