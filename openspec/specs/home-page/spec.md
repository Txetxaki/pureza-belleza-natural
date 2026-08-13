# Home Page Specification

## Purpose

`/` (home) end to end: composes the shared layout, satisfies the SEO contract, and stays scoped to
routes that actually exist in this change — no deep links into the deferred `content` change's routes.

## Requirements

### Requirement: Home route composition

`/` MUST render through the shared layout shell and MUST NOT link to any of the five service routes,
`/virginia`, `/el-salon`, `/precios`, `/reservar`, or `/diario` — those ship in the `content` change and
do not exist yet.

#### Scenario: No dead links to future routes

- GIVEN the prerendered `/` HTML
- WHEN all `<a href>` targets are enumerated
- THEN none MUST point to a service route, `/virginia`, `/el-salon`, `/precios`, `/reservar`, or
  `/diario`

#### Scenario: Layout shell present

- GIVEN `/` renders
- WHEN inspected
- THEN the shared header and footer MUST be present

### Requirement: SEO contract satisfied on `/`

`/` MUST consume its SEO registry entry (title, meta description, canonical, primary keyword
"peluquería sin químicos Ciudad Real") via `SeoService`, and MUST emit `HairSalon` + `BreadcrumbList`
JSON-LD per the `seo-infrastructure` spec.

#### Scenario: Home carries correct metadata

- GIVEN the prerendered `/` page
- WHEN `<title>`, meta description, and canonical are inspected
- THEN each MUST match the SEO registry entry for `/`

### Requirement: Prerendered, click-to-load map, no eager external calls

`/` MUST be served as static prerendered HTML (`RenderMode.Prerender`). If a map is present, it MUST
default to a static image with the interactive embed loading only on user click, never an eager Maps
iframe.

#### Scenario: No eager map iframe

- GIVEN the prerendered `/` HTML, before any interaction
- WHEN inspected
- THEN no `<iframe>` pointing at a Maps embed URL MUST be present in the initial HTML
