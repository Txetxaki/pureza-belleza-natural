# Proposal: `content` — the ten remaining routes

## Intent

`foundation` shipped the machine (scaffold, tokens, shell, SEO registry → SeoService → JSON-LD →
build-breaking validator → sitemap) and two proof routes. The site currently has **nothing to rank**:
ten of twelve registry routes are `status: 'planned'`, the home's five `carta` plates are deliberately
non-interactive dead ends, and the five near-empty niches the "Raíz Botánica" study identified
(`rastas`, `sin amoniaco`, `babylights`, `extensiones naturales`, `tratamiento capilar` + Ciudad Real)
are unattacked. `content` ships those ten routes to the study's contract and closes the four visual
gaps against the Stitch mockups. No new infrastructure beyond what the service-page anatomy demands.

## Scope

### In Scope

- Five service routes with the mandatory 9-part anatomy, 700–900 useful words, one plant accent each,
  and the study's cross-linking pairs.
- `/virginia`, `/el-salon`, `/precios`, `/reservar`; `/diario` + 3 launch articles at `/diario/:slug`.
- Four new JSON-LD generators (`FAQPage`, `Service`, `Person`, `BlogPosting`) + stable `@id` on the
  existing `HairSalon` node so all five schema types form one entity graph.
- One tariff source of truth feeding `/precios`, the home `carta`, and each service page.
- Stitch alignment: hero five-plant frieze, carta price column, editorial centring, section rhythm.
- Header services dropdown (anti-cannibalization rule 1 — **no `/servicios` index page**).
- Flip all ten registry entries `planned → live`; absorb 2 of 3 open `foundation` follow-ups.

### Out of Scope

- Real booking calendar (`/reservar` is WhatsApp/tel — decision #2267). Analytics/Umami.
- A `/servicios` index page — forbidden by rule 1.
- Any AI-generated or stock hair/client/salon-interior photography (decision #2259).
- Foundation follow-up 3 (static-map PNG, task 4.8) — still blocked on `GOOGLE_MAPS_API_KEY`.
- Token/typography rework; CMS or markdown authoring pipeline.

## Capabilities

### New Capabilities

- `service-pages`: the five plant-owned service routes — shared 9-part anatomy, accent scoping,
  cross-links, honest photo placeholder slots.
- `pricing`: single tariff source of truth, `pending | confirmed` status, display and JSON-LD rules,
  registry-drift guard.
- `precios-page`: `/precios` — the sole five-sibling-accent page (never nested).
- `diario`: `/diario` index + `/diario/:slug` — content source, prerendering, "never Ciudad Real in
  title or H1" rule, exact-match anchor links to service pages.
- `virginia-page`: `/virginia` — E-E-A-T, `Person` schema, author anchor for the blog.
- `salon-page`: `/el-salon` — navigational trust page, no primary keyword.
- `reservar-page`: `/reservar` — conversion page, WhatsApp/tel only, no calendar.

### Modified Capabilities

- `seo-infrastructure`: four new generators; `HairSalon` gains `@id`; sitemap gains a write-time
  `status === 'live'` filter **and** default `changefreq`/`priority` for registry-less prerendered
  paths (blog posts); keyword validator extended with the blog title/H1 rule.
- `home-page`: the "MUST NOT link to service routes" requirement is **inverted** — the home now MUST
  link to all five via the frieze and the carta, and the carta MUST show prices from `pricing`.
- `app-shell`: header services dropdown; ten routes prerendered; `getPrerenderParams` for `/diario/:slug`.
- `design-system`: narrow delta stating the `/precios` five-sibling-scope exception explicitly.

## Approach

Compose from existing primitives (`pz-plate`, `pz-picture`, `pz-cta`, `pz-static-map`) — the five
service pages share one presentational anatomy component so the 9-part order cannot drift page to page.
Screaming/hexagonal: `src/app/services/<route>/` for the five, `src/app/services/domain/pricing.ts` for
the tariff, `src/app/diario/` for the blog, `src/app/salon/` for `/virginia` + `/el-salon`. Routes stay
data-driven via `seoRouteData(path)`; the header and sitemap need zero edits per route because both
already derive from `filterNavEntries`/the registry.

### Key decisions

| # | Decision | Rationale |
|---|---|---|
| 1 | Add `FAQPage`, `Service`, `Person`, `BlogPosting` generators; give `HairSalon` a stable `@id` | Anatomy item 7 mandates `FAQPage`. `Service.provider` → `HairSalon@id`, `Person.worksFor` → `HairSalon@id`, `BlogPosting.author` → `Person@id` builds **one** entity graph instead of five orphan nodes. Honest note: Google restricted FAQ rich results to gov/health in Aug 2023 — value here is entity/passage parsing and AI answer surfaces, not stars. |
| 2 | `Service` ships **without** an `offers` node until real prices exist | Emitting a fabricated `Offer.price` while the page shows "consultar" violates Google's structured-data-matches-visible-content policy. The `offers` node turns on automatically when a pricing entry flips to `confirmed`. |
| 3 | Blog content = **one standalone component per post + a typed manifest** (not markdown, not HTML strings) | Zero new deps, zero build step, zero `innerHTML`/sanitizer bypass; posts get real `routerLink`s for the exact-match anchor text the study requires (a markdown pipeline would need custom renderers for precisely that). Everything is prerendered either way, so the "runtime loading" argument is moot. Revisit if the blog passes ~15 posts. |
| 4 | **3 launch articles**, one per contested niche | Enough that `/diario` isn't an empty state, small enough to stay inside the review budget. Each links to exactly one service page with that page's exact primary keyword as anchor. |
| 5 | Blog rule enforced in the build validator as **title + H1 only**, description exempt | The shipped `/diario` registry description already contains "Ciudad Real" deliberately; a naive "no Ciudad Real anywhere in `/diario*`" rule would break `npm run build` on day one. |
| 6 | One tariff module `src/app/services/domain/pricing.ts`, keyed by registry `path` | `/precios`, home carta and service pages read the same array; a unit test asserts every `planta`-owning registry route has exactly one pricing entry and vice versa — same drift-is-structurally-impossible philosophy as the keyword validator. |
| 7 | **All five prices ship as `pending`, never invented** | We do not have Virginia's tariff; `info/direccion-diseno.html` itself says so ("los importes son marcadores de maqueta"). A `pending` entry renders "Consultar" + an honest line, suppresses `Offer`, and keeps the study's don't-hide-price intent via the "depende de largo y densidad" note. Duration carries the same flag and flips with it. Same shape as the photo placeholder: swapping in reality is a data edit, zero template change. |
| 8 | Stitch visual alignment is **in scope** for `content` | The frieze links to routes that only exist now; the carta price column depends on decision 6. Splitting it means two changes editing `home-page.*` and the shell — guaranteed conflict, two review cycles, one visual outcome. Bounded: no retokenising, all `foundation` invariants hold (`#FFFFFF`, hairlines, 2px radius, no shadows, `pz-plate` needs both inputs, `optimization.fonts: false`). |
| 9 | Absorb foundation follow-ups **1 and 2**, not 3 | (1) The sitemap live-filter gap becomes genuinely reachable the moment routes flip incrementally across chained PRs, and we are editing that script anyway. (2) The `SeoService` OG/Twitter coverage hole is in the exact file we extend. (3) Task 4.8 is blocked on a credential nobody has and is unrelated to content. |

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `src/app/services/**` | New | Five route containers + shared anatomy component + `domain/pricing.ts` |
| `src/app/diario/**` | New | Index, post shell, post manifest, 3 post components |
| `src/app/salon/virginia/`, `src/app/salon/el-salon/`, `src/app/salon/precios/`, `src/app/booking/reservar/` | New | Four remaining routes |
| `src/app/seo/generators/{faq-page,service,person,blog-posting}.schema.ts` | New | + specs |
| `src/app/seo/generators/hair-salon.schema.ts` | Modified | Stable `@id` |
| `src/app/seo/route-seo.registry.json` | Modified | Ten `status` flips only — never a keyword edit |
| `src/app/app.routes.ts`, `app.routes.server.ts` | Modified | Ten routes + `getPrerenderParams` |
| `src/app/salon/home/home-page.{ts,html,scss}` | Modified | Frieze, carta prices/links, rhythm |
| `src/app/shared/layout/site-header/**` | Modified | Services dropdown |
| `scripts/generate-sitemap.mjs`, `scripts/validate-keyword-uniqueness.mjs` | Modified | Live filter, registry-less defaults, blog rule |
| `public/images/` | New | Placeholder slot assets with final dimensions/stable filenames |
| `e2e/**` | New | axe AA, zero-external-request, canonical↔sitemap parity per new route |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| `/reservar` and `/contacto` converge → rule 3 violation (partial H1/title overlap) | High | Split by job: `/contacto` = where/when/how to find us (NAP, hours, map); `/reservar` = how booking works, what to tell Virginia, what happens next. Distinct H1s asserted in spec. Question round item 3. |
| Inverting `home-page`'s "no dead links to future routes" breaks the existing test that enforces it | High | The delta spec must **replace** that scenario, not relax it; the tasks agent must update the corresponding unit/E2E assertion in the same slice. |
| `/el-salon` is a trust page with no real interior photography | Med | Ships with atmospheric imagery + one honest placeholder slot; question round item 4 offers keeping it `planned` instead. |
| Prices/durations never arrive → the page reads unfinished indefinitely | Med | `pending` state is honest and functional (WhatsApp CTA carries the conversion); flagged as a launch dependency beside the photoshoot. |
| Ten routes + 3 posts + shell/home edits far exceeds the 400-line review budget | High | Explicitly hand chaining to `sdd-tasks`: suggested slices = (a) pricing + SEO generators, (b) five service pages, (c) `/virginia` `/el-salon` `/precios` `/reservar`, (d) `/diario` + posts, (e) Stitch alignment + nav + E2E. |
| Thin service pages (< 700 useful words) padded to hit the count | Med | Word floor is a spec assertion, but the anatomy's client-language sections are what fill it; reviewers check usefulness, not length. |
| `getPrerenderParams` API shape differs in the installed `@angular/ssr` 22.x | Low | Design phase verifies against installed types before tasks; fallback is enumerating three literal slug routes. |

## Rollback Plan

Every route is additive and gated by its registry `status`. Per-slice rollback = revert that slice's
commits; flipping `status` back to `'planned'` simultaneously removes the route from the header nav
(`filterNavEntries`), the sitemap (new live filter) and the route table, leaving a coherent site.
The only non-additive edits are `home-page.{ts,html,scss}`, `site-header/**` and the two build scripts —
revert those files to their `foundation` state at `b8f778e`. No data migration, no persisted state.

## Dependencies

- **Blocking for real content, not for shipping**: Virginia's actual tariff (prices + durations) —
  until then every pricing entry stays `pending`.
- **Blocking for launch, already recorded**: the professional photoshoot. Service-page "result" and
  "before/after" blocks ship as styled, clearly-labelled placeholder slots with final dimensions and
  stable `pz-picture` `base` names, so swapping in real photos is a file drop with zero code change.
- Article copy approved in Virginia's voice before publish (`BlogPosting.author` = `Person` Virginia).
- Portable Node v22.23.2 for any CLI/test command (global v22.19.0 hard-exits) — see BRIEF §5.

## Success Criteria

- [ ] All 12 registry routes `status: 'live'`; `npm run build` green; sitemap lists 12 routes + 3 posts.
- [ ] Each of the five service pages has all 9 anatomy parts, ≥700 useful words, a unique site-wide H1,
      parseable `FAQPage` + `Service` + `BreadcrumbList` JSON-LD, and its two study-mandated cross-links.
- [ ] No `/servicios` route exists; no blog title or H1 contains "Ciudad Real" (build-enforced).
- [ ] Zero fabricated prices and zero AI/stock hair, client, portrait or salon-interior imagery.
- [ ] Home renders the five-plant frieze linking to five live routes and a carta price column sourced
      from `pricing` — home and `/precios` cannot show different figures.
- [ ] Playwright: axe-core AA, zero external requests, canonical↔sitemap parity on every new route.
- [ ] Foundation follow-ups 1 and 2 closed; follow-up 3 remains explicitly open.

## Proposal question round

Interactive mode, but this executor cannot prompt directly. Five product questions; the stated default
is what spec/design will assume if unanswered.

1. **Can `/precios` launch with all five entries showing "Consultar"?** *Default: yes — ships live with
   `pending` prices.* Alternative: hold `/precios` at `planned` until the tariff arrives (11 live routes).
2. **Can Virginia give approximate durations even without prices?** *Default: no — duration carries the
   same `pending` flag.* Durations alone would materially reduce the pending surface on five pages.
3. **What is the intended content difference between `/reservar` and `/contacto`?** *Default: `/contacto`
   = location, hours, map, NAP; `/reservar` = how booking works and what to send.* This directly governs
   anti-cannibalization rule 3.
4. **Is a photo-less `/el-salon` acceptable at launch?** *Default: yes — atmospheric imagery plus one
   honest placeholder slot.* Alternative: hold it `planned` until the photoshoot.
5. **Who authors the three launch articles?** *Default: drafted here, approved by Virginia before
   publish, attributed to her via `Person` schema.*

Also worth confirming: 3 launch articles is the proposed count — say so if you want 5.
