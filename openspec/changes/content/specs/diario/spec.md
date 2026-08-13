# Diario Specification

## Purpose

`/diario` index and its three launch articles (`/diario/:slug`):
cold-traffic, informational content that funnels into the five service
pages without ever competing with them on the local term.

## Requirements

### Requirement: "Ciudad Real" excluded from title and H1 only

No `/diario` or `/diario/:slug` page's `<title>` or H1 MUST contain "Ciudad
Real". This restriction applies to title and H1 ONLY — meta description and
body copy are exempt and MAY contain it (the shipped `/diario` registry
description already does, deliberately).

#### Scenario: Title/H1 clean

- GIVEN `/diario` and each of its three article pages
- WHEN `<title>` and the H1 text are inspected
- THEN neither MUST contain the substring "Ciudad Real"

#### Scenario: Description exempt

- GIVEN the `/diario` registry entry's meta description
- WHEN the build-breaking blog locality validator runs
- THEN the description MUST NOT be flagged even though it contains "Ciudad
  Real"

### Requirement: Three launch articles, one per contested niche

Exactly three articles MUST exist at launch, prerendered via
`getPrerenderParams`, each attributed to Virginia through a `Person`
JSON-LD reference and each emitting `BlogPosting` JSON-LD.

#### Scenario: Three prerendered posts

- GIVEN `npm run build` completes
- WHEN `dist/<project>/browser/diario/` is inspected
- THEN exactly three post directories/files MUST exist, each with a
  `BlogPosting` JSON-LD block whose `author` references the `Person` `@id`

### Requirement: Exact-match anchor link to one service page

Each article MUST link to exactly one service route, using that route's
exact `primaryKeyword` as the anchor text.

#### Scenario: Anchor text matches target keyword

- GIVEN any of the three launch articles
- WHEN its outbound link to a service route is inspected
- THEN the anchor text MUST equal that route's registry `primaryKeyword`
  verbatim

### Requirement: `/diario` index lists all live articles

`/diario` MUST list all three launch articles with links to
`/diario/:slug`, and its registry `status` MUST be `'live'`.

#### Scenario: Index lists three articles

- GIVEN the prerendered `/diario` HTML
- WHEN article links are enumerated
- THEN exactly three `/diario/:slug` links MUST be present

### Requirement: Prerendered content, no client-only render

Article body content MUST be present in the initial prerendered HTML.
Content MUST NOT be injected via `innerHTML` or an unsanitized HTML string.

#### Scenario: Content present without JS

- GIVEN an article page's prerendered HTML with JavaScript disabled
- WHEN the body is inspected
- THEN the full article text MUST already be present
