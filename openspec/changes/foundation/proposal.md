# Proposal — `foundation`

**Change:** Angular 22 scaffold + rendering, design tokens + typography, shared layout, SEO infrastructure, and `/` + `/contacto` as end-to-end proof.
**Date:** 2026-08-12 · **Engram mirror:** `sdd/foundation/proposal` (project `virginia`)

---

## Intent

Pureza is invisible in local search despite a 5.0 rating (research #2257). Phase 1 was deliberately cut
into two SDD changes (#2267): content pages cannot be written well before tokens and layout exist.
`foundation` builds the runnable skeleton and proves it on two real routes; `content` then adds the
remaining ten pages against a settled system instead of inventing one per page.

Done means: a deployable site where `/` and `/contacto` ship prerendered HTML with correct
title/meta/canonical/JSON-LD, render from committed design tokens and self-hosted fonts, and where
`npm run build` **fails** if two routes declare the same primary keyword.

## Scope

### In scope

- Scaffold via `npx @angular/cli@22 new` (global CLI is 21.0.3 — pinning is mandatory), TS strict, SCSS.
- Rendering: `app.routes.server.ts` with `RenderMode.Prerender`; both proof routes prerendered.
- Design tokens + typography: SCSS custom properties, light/dark, self-hosted latin-subset `woff2`
  (EB Garamond display / Alegreya Sans body), `@font-face` + preload + `font-display: swap`.
  `optimization.fonts` stays **off** with an inline comment saying why.
- Shared layout: header, footer with NAP, root shell.
- SEO infrastructure: route SEO registry, `SeoService`, JSON-LD generators (HairSalon, BreadcrumbList),
  `scripts/validate-keyword-uniqueness.mjs` chained into `npm run build`, `scripts/generate-sitemap.mjs`
  walking prerender output.
- `/` and `/contacto` end-to-end, including click-to-load static map.
- Vitest carve-outs (validator, JSON-LD, tel/WhatsApp link building) + a Playwright a11y/visual gate.

### Out of scope

- The 5 service pages, `/virginia`, `/el-salon`, `/precios`, `/reservar`, `/diario` — all belong to `content`.
- `/reservar` render mode and any Vercel serverless wrapper (see Risk 1).
- Umami analytics — decided (#2267) but not needed to prove the foundation; deferred pending confirmation.
- Real photography and the final hero (see Dependencies).

## Capabilities

### New

- `app-shell`: scaffold, rendering config, routing skeleton, header/footer/shell.
- `design-system`: tokens, theming, self-hosted typography, botanical accent-ownership rule.
- `seo-infrastructure`: SEO registry, `SeoService`, JSON-LD, sitemap generation, keyword-uniqueness gate.
- `home-page`: `/` end to end.
- `contact-page`: `/contacto` end to end.

### Modified

None — `openspec/specs/` is empty (greenfield).

## Approach

Domain-first structure (`seo/`, `salon/`, `contact/`, `shared/`), never layered-by-technical-type. The
full hexagonal split is applied **only** to `seo/`, the one area with genuinely swappable adapters;
route folders stay flat (container + `ui/`), and atomic design is confined to `shared/ui/`. A twelve-page
marketing site does not earn more abstraction than that.

SEO data lives in one route registry that feeds three consumers — `SeoService` at runtime, the keyword
validator at build, the sitemap generator at postbuild — so drift is structurally impossible rather than
policed by review.

Colour discipline carries over from the design system: one accent owns exactly one plant/service and
never decorates loose. `foundation` ships the tokens and the rule; `content` consumes them.

## Affected areas

| Area | Impact | Description |
| --- | --- | --- |
| repo root | New | `git init`, `package.json`, `angular.json`, `tsconfig*` |
| `src/app/{app.config,app.routes,app.routes.server}.ts` | New | Bootstrap + prerender config |
| `src/app/seo/` | New | Registry, `SeoService`, JSON-LD generators, DOM adapters |
| `src/app/shared/{layout,ui}/` | New | Header, footer (NAP), shell, primitives |
| `src/app/{salon,contact}/` | New | The two proof routes |
| `src/styles/{tokens,typography,base}.scss` | New | Design system |
| `public/fonts/` | New | Self-hosted woff2 |
| `scripts/` | New | Keyword validator, sitemap generator |
| `openspec/specs/` | New | Five capability specs |

## Risks

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| **1.** #2267 records Vercel as having an "official Angular SSR adapter"; the later exploration (#2272 §2.1, Vercel docs 2026-06-16) found **no Angular row** in Vercel's framework matrix, and the community wrapper routes prerendered routes through the function too — defeating "static from CDN" | High | Both proof routes are Prerender, so this change needs no server route. Keep hosting = Vercel; defer the `/reservar` render-mode call to design/`content`. Do not build a serverless wrapper here. |
| **2.** Token drift: `info/direccion-diseno.build.html` encodes `--ground:#FCFBF7` with four accents and **no** `--olivo`; the agreed v5 system is pure `#FFFFFF` with five plant-owned accents (#2283 confirms five colours and "Angular usará #FFFFFF exacto") | High | Design phase must pin one authoritative token file before any component is styled. Treat the Stitch system as source of truth, the on-disk mockup as superseded. |
| **3.** Scaffolding on CLI 21 by accident | Med | Pin `npx @angular/cli@22 new`; assert version in CI |
| **4.** `optimization.fonts` re-enabled later, believing it self-hosts (it does not — the inlined CSS still points at `fonts.gstatic.com`) | Med | Comment in `angular.json` + README note |
| **5.** Angular's Vitest builder is experimental, no SemVer guarantee | Low | `strict_tdd: false`; carve-outs only; revisit in phase 2 |
| **6.** Both proof routes exceed the 800-line review budget in one slice | Med | `sdd-tasks` forecasts chaining: scaffold → tokens → layout → SEO infra → routes |

## Rollback

No git history exists yet, so the first commit is the rollback boundary: `git reset --hard` to it, or
delete the scaffold and restore `info/` + `openspec/`. Nothing is deployed and no data migrates —
rollback is unusually cheap and stays that way until the first Vercel deploy.

## Dependencies

- **Blocking for launch, not for this change:** the only photo (`info/virginia.jpeg`) is a phone
  snapshot and is also the LCP element. The professional photoshoot still blocks launch.
- **AI images are placeholders only** (`info/fotos-ia-brief.md`): atmosphere and still life with stable
  filenames for a code-free swap. Never salon results, clients, portraits of Virginia, or the interior.
  Per `config.yaml`, image work is placeheld and must not block unrelated tasks.
- Non-code, outside this repo, but gating the SEO payoff: the GBP listing-name policy violation and the
  13 → 60-80 review campaign (#2259).

## Success criteria

- [ ] `npm run build` succeeds on Angular 22 and emits prerendered `/` and `/contacto`.
- [ ] Build **fails** when a duplicate primary keyword is introduced (proven by a deliberate failure).
- [ ] `sitemap.xml` is generated from build output, never hand-written.
- [ ] Zero external font/CDN requests at runtime; fonts served from our origin.
- [ ] `/` and `/contacto` pass WCAG 2.2 AA and carry valid HairSalon + BreadcrumbList JSON-LD.
- [ ] Map is click-to-load; no Maps iframe on first paint.
- [ ] No stock photography and no AI image outside the permitted categories.
