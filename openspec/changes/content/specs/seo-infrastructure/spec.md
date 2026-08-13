# Delta for SEO Infrastructure

## ADDED Requirements

### Requirement: `FAQPage`, `Service`, `Person`, `BlogPosting` generators

`seo-infrastructure` MUST provide four additional JSON-LD generators:
`FAQPage` (consumed by each service page's FAQ), `Service` (consumed by
each service page, `provider` referencing `HairSalon` `@id`), `Person`
(consumed by `/virginia`, `worksFor` referencing `HairSalon` `@id`), and
`BlogPosting` (consumed by each `/diario/:slug` article, `author`
referencing `Person` `@id`). Each MUST produce parseable JSON-LD with a
valid `@context`.

#### Scenario: All four generators produce valid JSON-LD

- GIVEN a page using each of the four generators
- WHEN its JSON-LD blocks are parsed
- THEN each MUST be valid JSON with `@context: "https://schema.org"` and the
  correct `@type`

### Requirement: `Service` ships without `offers` while price is pending

A `Service` JSON-LD block MUST NOT include an `offers` node while its
matching `pricing` entry's `status` is `pending`. Emitting a fabricated
`Offer.price` beside a visible "Consultar" would violate structured-data-
matches-visible-content policy. The `offers` node MUST appear automatically
once the entry flips to `confirmed`.

#### Scenario: No offers node at launch

- GIVEN any of the five service pages at launch (`pricing` entries all
  `pending`)
- WHEN its `Service` JSON-LD is parsed
- THEN it MUST NOT contain an `offers` key

### Requirement: Blog locality-term validator — title and H1 only

A build-breaking validator MUST fail `npm run build` if any `/diario` or
`/diario/:slug` page's `<title>` or H1 contains "Ciudad Real". This check
MUST apply to title and H1 ONLY; the registry meta `description` field MUST
be exempt.

#### Scenario: Title/H1 violation fails build

- GIVEN a `/diario` article whose H1 contains "Ciudad Real"
- WHEN `npm run build` runs
- THEN the validator step MUST exit non-zero

#### Scenario: Description exempt, build passes

- GIVEN the `/diario` registry entry's description contains "Ciudad Real"
  (as shipped)
- WHEN `npm run build` runs
- THEN the validator MUST NOT flag it and the build MUST proceed

## MODIFIED Requirements

### Requirement: Route SEO registry as single source of truth

One SEO route registry MUST enumerate every route in scope across
`foundation` and `content` (all twelve registry paths), each entry
declaring at minimum: path, primary keyword (nullable for navigational
routes), title, meta description, canonical path, `planta` (nullable), and
`status` (`'planned'` | `'live'`). This registry MUST be the sole input
consumed by `SeoService`, the keyword-uniqueness validator, the blog
locality validator, and the sitemap generator.
(Previously: scoped to `/` and `/contacto` only, two entries, no `status`
field named in the requirement text.)

#### Scenario: Registry entries for both proof routes

- GIVEN the SEO route registry
- WHEN its entries are listed
- THEN entries for `/` and `/contacto` MUST both exist

#### Scenario: All twelve routes present and live

- GIVEN the SEO route registry after `content` ships
- WHEN its entries are listed
- THEN all twelve routes MUST be present and each `status` MUST equal
  `'live'`

#### Scenario: `/` declares its target keyword

- GIVEN the registry entry for `/`
- WHEN inspected
- THEN its primary keyword MUST equal "peluquería sin químicos Ciudad Real"

#### Scenario: `/contacto` is navigational, no target keyword

- GIVEN the registry entry for `/contacto`
- WHEN inspected
- THEN its primary keyword field MUST be empty/null, per the 12-route
  keyword map's navigational class

### Requirement: JSON-LD contract — HairSalon stable `@id` + BreadcrumbList

`/` MUST emit a `HairSalon` (LocalBusiness subtype) JSON-LD block with
name, address, telephone, URL, and a stable `@id` (a fixed, deterministic
IRI that MUST NOT change between builds). Both `/` and `/contacto` MUST
emit a `BreadcrumbList` JSON-LD block reflecting their position in the site
hierarchy. All JSON-LD MUST be parseable with a valid schema.org
`@context`. The `HairSalon` `@id` MUST be the value referenced by
`Service.provider`, `Person.worksFor`, and any other node that ties back to
the business, forming one entity graph instead of orphan nodes.
(Previously: no `@id` requirement; `HairSalon` was a standalone node with
no cross-references from other schema types.)

#### Scenario: HairSalon schema on home

- GIVEN the prerendered `/` HTML
- WHEN its `<script type="application/ld+json">` blocks are parsed
- THEN one block MUST have `@type: HairSalon` (or `LocalBusiness`) with
  name/address/telephone populated and a non-empty `@id`

#### Scenario: BreadcrumbList on both routes

- GIVEN the prerendered `/` and `/contacto` HTML
- WHEN JSON-LD blocks are parsed
- THEN each page MUST include one `@type: BreadcrumbList` block

#### Scenario: @id stable and referenced by other nodes

- GIVEN `/`'s `HairSalon` `@id` and any service page's `Service.provider`
  or `/virginia`'s `Person.worksFor`
- WHEN compared
- THEN they MUST reference the identical `@id` value

### Requirement: SeoService applies registry data at runtime, no tag accumulation

For every route, `SeoService` MUST set `document.title`, the meta
description, the canonical `<link>`, and Open Graph/Twitter meta tags from
the matching registry entry, and MUST inject the route's JSON-LD script(s)
into the head. On client-side navigation between routes, `SeoService` MUST
remove or replace the previous route's OG/Twitter tags and JSON-LD rather
than appending new ones, so the head never accumulates duplicate or stale
tags.
(Previously: title/description/canonical/JSON-LD only; no OG/Twitter
coverage or no-accumulation guarantee stated or tested.)

#### Scenario: Title and canonical set on navigation

- GIVEN a route resolves (any of the twelve)
- WHEN the page renders
- THEN `document.title` MUST equal the registry entry's title, and
  `<link rel="canonical">` MUST equal its canonical path

#### Scenario: No OG/Twitter accumulation across navigation

- GIVEN client-side navigation from one route to another
- WHEN the document head is inspected after the second navigation
- THEN exactly one set of OG and Twitter meta tags MUST be present,
  matching the second route only

### Requirement: Postbuild sitemap generation — live routes only

`scripts/generate-sitemap.mjs` MUST run as a `postbuild` step, walk
`dist/<project>/browser` to discover every prerendered path, and emit
`sitemap.xml` into that same output directory, filtered at write time to
registry entries whose `status === 'live'` — a `'planned'` entry MUST NOT
appear in the sitemap even if its files exist on disk. Sitemap content MUST
NOT be hand-maintained; entries MAY be enriched with `changefreq`/
`priority` sourced from the SEO route registry. Prerendered paths with no
matching registry entry (blog post slugs) MUST receive a documented
default `changefreq`/`priority`.
(Previously: no live-status filter and no registry-less-path default,
because only `/` and `/contacto` existed and both were live.)

#### Scenario: Sitemap reflects prerendered output

- GIVEN a completed `npm run build` with `/` and `/contacto` prerendered
- WHEN `postbuild` runs
- THEN `dist/<project>/browser/sitemap.xml` MUST contain `<url>` entries
  for both `/` and `/contacto`

#### Scenario: Sitemap regenerates without manual editing

- GIVEN a route is added to or removed from the prerendered output
- WHEN the build runs again
- THEN the sitemap MUST reflect the new set with no manual edits required

#### Scenario: Planned routes excluded

- GIVEN a registry entry with `status: 'planned'` whose files still exist
  in `dist/`
- WHEN the sitemap generates
- THEN that route MUST NOT appear in `sitemap.xml`

#### Scenario: Blog posts get a default priority

- GIVEN a prerendered `/diario/:slug` path with no matching registry entry
- WHEN the sitemap generates
- THEN it MUST include that path with the documented default
  `changefreq`/`priority`
