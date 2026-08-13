# Service Pages Specification

## Purpose

Define the shared nine-part anatomy that all five plant-owned service routes
(`/coloracion-vegetal-aveda`, `/mechas-babylights-balayage`, `/rastas`,
`/extensiones-cabello-natural`, `/tratamientos-capilares`) satisfy identically,
so the anatomy's order cannot drift page to page. Feeds from `pricing` and
`seo-infrastructure`; consumed by `home-page`'s cross-links and `app-shell`'s
header dropdown.

## Requirements

### Requirement: Nine-part anatomy in fixed order

Each service route MUST render, top to bottom: (1) H1 carrying its registry
`primaryKeyword` plus a value-proposition line, (2) a real-photo-of-result
slot, (3) "qué es y para quién" in client language, (4) "cómo lo hace
Virginia" process narrative, (5) orientative price + duration, (6) a
before/after slot (minimum three cases), (7) a 4-6 question FAQ, (8) a double
CTA (reserve + WhatsApp), (9) exactly two internal cross-links.

#### Scenario: Anatomy parts present and ordered

- GIVEN any of the five live service routes
- WHEN its DOM sections are enumerated top to bottom
- THEN all nine parts MUST be present in the order listed above

#### Scenario: Missing part fails

- GIVEN a service route missing any one of the nine parts
- WHEN the page is inspected
- THEN it MUST NOT be considered launch-ready per this spec

### Requirement: Client-language "qué es y para quién" section

Item 3 of the anatomy MUST be 150-200 words written in client language, not
stylist jargon.

#### Scenario: Word count within range

- GIVEN a service route's "qué es y para quién" section
- WHEN its word count is measured
- THEN it MUST fall between 150 and 200 words

### Requirement: 700-900 useful words per page

Each service page's total body copy (excluding nav/footer/CTAs) MUST fall
between 700 and 900 words, and MUST be useful (anatomy-derived), not padding.

#### Scenario: Word count within range

- GIVEN any live service route's rendered body copy
- WHEN word count is measured
- THEN it MUST be >= 700 and <= 900

### Requirement: One plant accent, scoped

Each service page MUST bind exactly one `[data-planta]` accent scope on an
ancestor element, per its registry `planta`, and MUST NOT reference an accent
custom property directly (e.g. `--pz-romero-text`) outside that scope.

#### Scenario: Single accent scope per page

- GIVEN a live service route
- WHEN `[data-planta]` attributes are enumerated in its DOM
- THEN exactly one distinct planta value MUST be present, matching the
  registry entry's `planta`

### Requirement: Honest placeholder for result and before/after imagery

Items 2 and 6 MUST NOT contain AI-generated hairdressing results, client
portraits, or stock photography. Absent real photography, each slot MUST
render a styled, clearly-labelled placeholder ("foto pendiente de la
sesión") at final dimensions/aspect-ratio, using the same `base`-filename
contract as `pz-picture` so a future real-photo drop requires zero template
change.

#### Scenario: No fabricated hair photography

- GIVEN any service route's result or before/after slot
- WHEN its image source is inspected
- THEN it MUST NOT be an AI-generated hair-result image or a stock photo

#### Scenario: Placeholder reads as pending, not broken

- GIVEN the result slot has no real photo yet
- WHEN rendered
- THEN it MUST display an explicit "pending" label, not a broken-image state
  or a fabricated result

### Requirement: Orientative price + duration with pending state

Item 5 MUST source its price and duration from `pricing` (keyed by the
page's registry path). While a `pricing` entry is `pending`, the page MUST
render "Consultar" plus a note that the final price depends on
length/density, and MUST NOT render a specific duration figure.

#### Scenario: Pending entry renders Consultar

- GIVEN a service route whose `pricing` entry is `pending`
- WHEN the price/duration section renders
- THEN it MUST show "Consultar" and MUST NOT show a numeric price or
  duration

### Requirement: FAQ with FAQPage JSON-LD

Item 7 MUST contain 4-6 real questions and answers, and the page MUST emit a
parseable `FAQPage` JSON-LD block whose `mainEntity` entries match the
rendered questions 1:1.

#### Scenario: FAQ count and schema match

- GIVEN a service route's FAQ section
- WHEN its questions are counted and its `FAQPage` JSON-LD is parsed
- THEN 4-6 questions MUST be present and `mainEntity.length` MUST equal that
  count

### Requirement: Double CTA

Item 8 MUST present both a "reserve" CTA (linking to `/reservar`) and a
direct WhatsApp CTA, both visible without scrolling past the page's primary
content.

#### Scenario: Both CTAs present

- GIVEN a live service route
- WHEN its CTAs are enumerated
- THEN a `/reservar` link and a `wa.me`/`api.whatsapp.com` link MUST both be
  present

### Requirement: Two cross-links per the study's pairing map

Item 9 MUST link to exactly the two paired routes below, using each target's
`breadcrumb` label or primary keyword as anchor text — never more, never
fewer, never a substitute pairing:

| Route | Cross-links to |
|---|---|
| `/coloracion-vegetal-aveda` | `/tratamientos-capilares`, `/mechas-babylights-balayage` |
| `/mechas-babylights-balayage` | `/coloracion-vegetal-aveda`, `/tratamientos-capilares` |
| `/rastas` | `/tratamientos-capilares`, `/extensiones-cabello-natural` |
| `/extensiones-cabello-natural` | `/mechas-babylights-balayage`, `/tratamientos-capilares` |
| `/tratamientos-capilares` | `/coloracion-vegetal-aveda`, `/rastas` |

#### Scenario: Cross-links match the pairing map

- GIVEN any of the five service routes
- WHEN its outbound cross-links are enumerated
- THEN they MUST equal exactly the two routes in the table above for that
  route

### Requirement: Unique primary keyword, registry-driven, live status

Each service route's `primaryKeyword`, `title`, and H1 MUST come from its
`route-seo.registry.json` entry unedited, MUST be unique site-wide, and the
entry's `status` MUST be `'live'`.

#### Scenario: Registry status is live

- GIVEN the SEO route registry
- WHEN any of the five service route entries is inspected
- THEN `status` MUST equal `'live'`
