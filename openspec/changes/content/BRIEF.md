# `content` — orchestrator brief (read this first)

This file is the shared context for every agent working the `content` SDD change.
It is orchestrator scaffolding, not a deliverable spec — the real artifacts are
`proposal.md`, `specs/*/spec.md`, `design.md`, `tasks.md` in this same folder.

---

## 1. What `content` is

`foundation` (archived, merged to `main`) shipped: Angular 22 scaffold + prerender,
the pinned design-token system, the shared layout shell, SEO infrastructure
(registry → SeoService → JSON-LD → build-breaking keyword validator → sitemap),
and the `/` and `/contacto` routes as an end-to-end proof.

`content` ships **the ten remaining routes** and nothing structural:

| Route | Primary keyword | Planta / accent | Intent |
|---|---|---|---|
| `/coloracion-vegetal-aveda` | `coloración sin amoniaco Ciudad Real` | romero (green) | transactional |
| `/mechas-babylights-balayage` | `babylights Ciudad Real` | espliego (violet) | transactional |
| `/rastas` | `rastas Ciudad Real` | esparto (gold) | transactional |
| `/extensiones-cabello-natural` | `extensiones pelo natural Ciudad Real` | vid (garnet) | transactional |
| `/tratamientos-capilares` | `tratamiento capilar Ciudad Real` | olivo (olive) | transactional |
| `/virginia` | `Virginia peluquera Ciudad Real` | none (neutral) | brand · E-E-A-T |
| `/el-salon` | *(none — navigational)* | none | trust · photos |
| `/precios` | `precios peluquería Ciudad Real` | **all five, one per row** | commercial |
| `/reservar` | `pedir cita peluquería Ciudad Real` | none | conversion |
| `/diario` + `/diario/:slug` | informational, **never "Ciudad Real"** | none | cold traffic |

All ten already exist in `src/app/seo/route-seo.registry.json` with their exact
`title`/`description`/`primaryKeyword`/`planta`/`priority`. **Flip `status` from
`'planned'` to `'live'` as each ships** — do not invent new keywords, do not edit
an existing `primaryKeyword`. The build-breaking validator
(`scripts/validate-keyword-uniqueness.mjs`) enforces uniqueness; adding a
duplicate breaks `npm run build` by design.

Out of scope: a real booking calendar (`/reservar` is a WhatsApp/tel CTA page in
this phase — decision #2267), analytics/Umami, and any `/servicios` index page
(explicitly forbidden — see anti-cannibalization rule 1 below).

---

## 2. The SEO contract (from the "Raíz Botánica" study — non-negotiable)

### The strategic frame
Pureza cannot win `peluquería Ciudad Real` (Hécate has 477 reviews vs Pureza's
~13) and must not try. It wins five near-empty niches. Every service page attacks
**one specific long-tail keyword**, never the generic sector term.

Open ground (no local competition): `rastas Ciudad Real`, `peluquería sin químicos
Ciudad Real`, `coloración sin amoniaco Ciudad Real`, `peluquería Aveda Ciudad
Real`, `extensiones pelo natural Ciudad Real`, `peluquería vegana Ciudad Real`.

Contested — enter sideways, never head-on: `mechas Ciudad Real` (Viceversa has a
landing, Hécate has authority) → attack `babylights Ciudad Real` and `balayage sin
decolorar Ciudad Real` instead, which have no owner.

The competitor to beat is **Viceversa**, whose `/peluqueria-mechas-ciudad-real`
landing runs ~600–700 words with a local H1 and call CTAs. Target: beat that on
all five service pages without padding.

### The four anti-cannibalization rules
1. **No `/servicios` index page.** It would compete with the home for the generic
   term and dilute internal links. Instead: a header dropdown linking straight to
   the five service pages, plus the home's `carta` block.
2. **The blog never says "Ciudad Real"** — not in the H1, not in the title. It
   answers questions ("¿cuánto dura una coloración sin amoniaco?") and links to
   the service page using that page's exact primary keyword as anchor text.
3. **One H1 per page, unique site-wide.** No H1 or title may repeat or partially
   overlap another. If two pages start converging, merge and 301 one to the other.
4. **The map lives in the repo** — already implemented in `foundation` via
   `route-seo.registry.json` + the prebuild validator. Nothing to add.

### Anatomy of a service page (all five share it — this is what search intent wants)
1. **H1** carrying the primary keyword + a value-proposition line.
2. **Real photo of the result** — Virginia's own work. **Never stock. Never
   AI-generated hair results.** See §4: this is currently blocked; render a
   clearly-marked, styled placeholder slot, do not fabricate.
3. **"Qué es y para quién"** — 150–200 words in *client* language, not stylist jargon.
4. **"Cómo lo hace Virginia"** — the process, step by step. This is where E-E-A-T lives.
5. **Orientative price + duration.** Hiding price raises bounce; publish "desde X"
   with a note that the final figure depends on length/density (decision #2267).
6. **Before / after**, minimum three cases → same photo block as (2): blocked, placeholder.
7. **FAQ, 4–6 real questions** → marked up as `FAQPage` JSON-LD.
8. **Double CTA**: reserve + direct WhatsApp.
9. **Internal links** to the two services that best pair with this one.

Target **700–900 useful words** per service page. Useful, not filler.

### Cross-linking map (rule 9 — pick the two that genuinely pair)
- Coloración vegetal ↔ Tratamientos capilares, Mechas de autor
- Mechas de autor ↔ Coloración vegetal, Tratamientos capilares
- Rastas ↔ Tratamientos capilares, Extensiones naturales
- Extensiones naturales ↔ Mechas de autor, Tratamientos capilares
- Tratamientos capilares ↔ Coloración vegetal, Rastas

---

## 3. The visual contract — get much closer to the Stitch mockups

The user's explicit feedback: the built site must look **much more like the Stitch
designs**. Those mockups are the visual target and were validated screen by screen.

Concrete gaps to close (measured against the current built home page):

- **The five-plant frieze is missing from the hero.** Stitch's home has, under the
  CTA row, a horizontal row of five small circular botanical line-icons — each in
  its own plant colour — with a tiny uppercase label beneath (`ROMERO`, `ESPLIEGO`,
  `ESPARTO`, `VID`, `OLIVO`), acting as a mini service index. Each links to its
  service page. Add it. Now that the service routes exist, these become real links.
- **`carta` rows have no price.** Stitch's home carta shows `Desde 65€` / `Consultar`
  right-aligned on each row. Add the price column, sourced from the same place
  `/precios` reads so the two can never drift.
- **More editorial centring.** Stitch centres the wordmark in the header, centres
  the value-prop band's three items, and centres section intros. The current build
  is uniformly left-aligned and reads flatter than the mockup.
- **Section rhythm.** Stitch uses noticeably more vertical air between major
  sections and a hairline rule + small-caps eyebrow to open each one.

### The Stitch service-page layout, read off the actual mockup
A reference render of the `Coloración Vegetal (Romero)` Stitch screen is saved at
`C:\Users\sergi\.claude\projects\C--Users-sergi-Documents-Virginia-Pureza\3e4875c8-7ad3-4738-8270-3fd4db310a51\tool-results\webfetch-1786607283406-m4r1n4.png`
— open it with the Read tool and match it. Its structure, top to bottom:

1. **Header**: nav links left (`Carta`, `El salón`, active one underlined in the
   accent), **wordmark `Pureza` centred** in italic serif, `RESERVAR` far right in
   accent-coloured small caps. (The current build's header is left-aligned with no
   centred wordmark — this is the "editorial centring" gap.)
2. Accent-coloured uppercase eyebrow, wide-tracked: `COLORACIÓN VEGETAL · ROMERO`.
3. Very large serif H1, left-aligned, generous size: *Color que no quema*.
4. Italic accent-coloured Latin binomial directly beneath: *Rosmarinus officinalis*.
5. Lede paragraph, ~4 lines, muted grey, narrow measure.
6. Solid accent-filled CTA button, small-caps label: `RESERVAR ESTA CITA`.
7. **Full-bleed wide photograph** of that service's plant (we have these:
   `atmosfera-{planta}.jpg`).
8. **Two-column benefits block**: left is a large, sparse botanical line
   illustration in the accent colour (lots of white space around it); right is 4
   benefit rows, each opened by a short left hairline rule, with a serif title and
   one muted line of description.
9. **Centred italic serif section title** (e.g. *Tarifas de coloración*), followed by
   a bordered price table — hairline row dividers, label left, price right-aligned,
   tabular numerals.
10. **Centred closing CTA band**: a single line (`Inicia tu ritual de color — Desde 65€`)
    above an *outlined* (not filled) `RESERVAR` button.
11. **Centred footer**: italic `Pureza` wordmark, a row of small-caps links, then a
    small-caps copyright line.

Our page keeps this visual language but carries the study's fuller anatomy — the
Stitch mockup omits the "Qué es y para quién" narrative, the process section, the
before/after block and the FAQ, all of which §2 requires. Add them in the same
idiom: centred italic serif section titles, hairline rules, generous vertical air.

Non-negotiable design invariants inherited from `foundation` (do **not** regress):
- Background is literal `#FFFFFF`. Never cream, never tinted.
- Tokens come only from `src/styles/_tokens.scss`. No raw hex in a component.
- Components read `--pz-accent-live` / `--pz-accent-text`; a `[data-planta='…']`
  scope on an ancestor binds them. Never reference `--pz-romero-text` directly.
  **Corrected invariant** (an earlier draft of this brief said "one accent per
  page, sole exception `/precios`" — that was wrong and the design phase caught
  it): the real rule is **never nested, and one accent per *service route*.**
  Sibling scopes are legitimate wherever a page legitimately indexes all five —
  the *already-shipped* home carta renders five sibling `[data-planta]` plates,
  and `/precios` and the hero frieze will do the same. Writing the old wording
  into a spec would have made the existing home page non-compliant on day one.
- 1px hairlines, ~2px radius, no drop shadows, no dark theme.
- `pz-plate` requires both `specimen` and `photo` — illustration and photograph,
  never one alone.
- Self-hosted fonts only; `optimization.fonts` stays `false`.

---

## 4. The photography constraint (read carefully — do not work around it)

There is **no real photography of Virginia's work**. The only real photo in the
repo is `public/images/retrato-virginia.jpg` (from `info/virginia.jpeg`, a phone
snapshot) plus AI-generated *botanical still lifes* (`atmosfera-*`,
`manos-pigmento`, `textura-lino`).

Project policy (`info/fotos-ia-brief.md`, decision #2259, `openspec/config.yaml`'s
apply rule) — **AI may only generate atmosphere**: plants, still lifes, textures,
hands without faces. It may **never** generate hairdressing results, clients,
portraits of Virginia, or the salon interior. Stock photography is banned outright.

Therefore, for the service pages' "real photo of the result" and "before/after,
3 cases" blocks:
- **Do not fabricate.** Do not generate AI hair photos. Do not use stock.
- Render a **styled, clearly-labelled placeholder slot** with the correct final
  dimensions and `aspect-ratio` so layout is already correct and swapping in a
  real photo is a file drop with **zero code change** (stable filenames, same
  contract as `pz-picture`'s `base` input).
- The placeholder must be honest on screen — it should read as "foto pendiente
  de la sesión", not as a broken image and not as a fake result.
- Existing `atmosfera-{planta}.jpg` botanical images ARE available and appropriate
  for each service page's atmospheric/`pz-plate` imagery. Use them there.

The professional photoshoot remains the launch blocker. That is expected and
already recorded; it is not something to solve in code.

---

## 5. Environment gotchas (cost several agents real time already)

- **Global Node is v22.19.0 and every `@angular/cli@22.x` command hard-exits on it**
  (`process.exit(3)`, requires `^22.22.3 || ^24.15.0 || >=26.0.0`, no bypass flag).
  Download portable Node v22.23.2 win-x64 from
  `https://nodejs.org/dist/v22.23.2/node-v22.23.2-win-x64.zip`, extract to your own
  scratchpad, prepend to `PATH` for npm/npx/ng/vitest/playwright only. **Never
  modify the global install.** If `npm run <script>` exits 1 with no output, your
  portable extraction is incomplete — re-extract the zip fresh rather than reusing
  a possibly-corrupt cached copy.
- `npx ng test -- --watch=false` fails schema validation. Use
  `npm test -- --watch=false` for the full suite, or
  `npx ng test --watch=false --include='<glob>'` for a focused run.
- `npm run build` chains `prebuild` (keyword validator → image variants) and
  `postbuild` (sitemap). **Never call bare `ng build`** — it skips all the gates.
- `scripts/serve-dist.mjs` serves `dist/pureza/browser` on port 4310 with plain
  `node:http` (no Angular CLI needed, so the global Node runs it fine).

## 6. Testing expectations

`strict_tdd` is false, but the project's carve-out rule stands: **unit tests are
mandatory wherever there is real logic**, not for template markup. For `content`
that means: the FAQ/`FAQPage` JSON-LD generator, any price-formatting or
price-source helper, the blog post loader/slug logic, and any new pure utility.
Plus Playwright coverage for the new routes (axe-core AA, no external requests,
canonical↔sitemap parity) matching what `foundation` already does for `/` and
`/contacto`.
