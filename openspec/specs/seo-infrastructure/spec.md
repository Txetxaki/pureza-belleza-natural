# SEO Infrastructure Specification

## Purpose

Provide one SEO route registry feeding three consumers — the runtime `SeoService`, the build-breaking
keyword-uniqueness validator, and the postbuild sitemap generator — so drift between them is
structurally impossible rather than policed by review.

## Requirements

### Requirement: Route SEO registry as single source of truth

One SEO route registry MUST enumerate every route in scope for this change (`/`, `/contacto`), each
entry declaring at minimum: path, primary keyword (nullable for navigational routes), title, meta
description, and canonical path. This registry MUST be the sole input consumed by `SeoService`, the
keyword-uniqueness validator, and the sitemap generator.

#### Scenario: Registry entries for both proof routes

- GIVEN the SEO route registry
- WHEN its entries are listed
- THEN entries for `/` and `/contacto` MUST both exist

#### Scenario: `/` declares its target keyword

- GIVEN the registry entry for `/`
- WHEN inspected
- THEN its primary keyword MUST equal "peluquería sin químicos Ciudad Real"

#### Scenario: `/contacto` is navigational, no target keyword

- GIVEN the registry entry for `/contacto`
- WHEN inspected
- THEN its primary keyword field MUST be empty/null, per the 12-route keyword map's navigational class

### Requirement: SeoService applies registry data at runtime

For every route, `SeoService` MUST set `document.title`, the meta description, and the canonical
`<link>` from the matching registry entry, and MUST inject the route's JSON-LD script(s) into the head.

#### Scenario: Title and canonical set on navigation

- GIVEN a route resolves (`/` or `/contacto`)
- WHEN the page renders
- THEN `document.title` MUST equal the registry entry's title, and `<link rel="canonical">` MUST equal
  its canonical path

### Requirement: JSON-LD contract — HairSalon + BreadcrumbList

`/` MUST emit a `HairSalon` (LocalBusiness subtype) JSON-LD block with name, address, telephone, and
URL. Both `/` and `/contacto` MUST emit a `BreadcrumbList` JSON-LD block reflecting their position in
the site hierarchy. All JSON-LD MUST be parseable with a valid schema.org `@context`.

#### Scenario: HairSalon schema on home

- GIVEN the prerendered `/` HTML
- WHEN its `<script type="application/ld+json">` blocks are parsed
- THEN one block MUST have `@type: HairSalon` (or `LocalBusiness`) with name/address/telephone populated

#### Scenario: BreadcrumbList on both routes

- GIVEN the prerendered `/` and `/contacto` HTML
- WHEN JSON-LD blocks are parsed
- THEN each page MUST include one `@type: BreadcrumbList` block

### Requirement: Build-breaking keyword-uniqueness validator

`scripts/validate-keyword-uniqueness.mjs` MUST read the SEO route registry and exit non-zero — failing
`npm run build` — if any two routes declare the same non-empty primary keyword. Routes with an
empty/null keyword MUST be exempt from the uniqueness check. The script MUST run as a required step of
`npm run build`.

#### Scenario: Unique keywords pass

- GIVEN the registry with `/` = "peluquería sin químicos Ciudad Real" and `/contacto` = null
- WHEN `npm run build` runs
- THEN the validator step MUST exit 0 and the build MUST proceed

#### Scenario: Duplicate keyword fails the build

- GIVEN a deliberately duplicated primary keyword between two routes
- WHEN `npm run build` runs
- THEN the validator step MUST exit non-zero and the build MUST fail before producing output

#### Scenario: Navigational routes exempt

- GIVEN two routes both have an empty/null primary keyword
- WHEN the validator runs
- THEN it MUST NOT flag them as duplicates

### Requirement: Postbuild sitemap generation

`scripts/generate-sitemap.mjs` MUST run as a `postbuild` step, walk `dist/<project>/browser` to
discover every prerendered path, and emit `sitemap.xml` into that same output directory. Sitemap
content MUST NOT be hand-maintained; entries MAY be enriched with `changefreq`/`priority` sourced from
the SEO route registry.

#### Scenario: Sitemap reflects prerendered output

- GIVEN a completed `npm run build` with `/` and `/contacto` prerendered
- WHEN `postbuild` runs
- THEN `dist/<project>/browser/sitemap.xml` MUST contain `<url>` entries for both `/` and `/contacto`

#### Scenario: Sitemap regenerates without manual editing

- GIVEN a route is added to or removed from the prerendered output
- WHEN the build runs again
- THEN the sitemap MUST reflect the new set with no manual edits required
