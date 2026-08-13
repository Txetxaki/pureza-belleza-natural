# Precios Page Specification

## Purpose

`/precios`: the sole page where all five plant accents coexist as sibling
scopes, one per row, presenting the `pricing` source for every service in
one place.

## Requirements

### Requirement: Five sibling accent scopes, never nested

`/precios` MUST render one row per service route, each row scoped with its
own `[data-planta]` attribute. All five scopes MUST be siblings; none MUST
be nested inside another `[data-planta]` scope.

#### Scenario: Five sibling scopes present

- GIVEN the prerendered `/precios` HTML
- WHEN `[data-planta]` elements are enumerated
- THEN exactly five distinct values MUST exist (romero, espliego, esparto,
  vid, olivo), none nested inside another

### Requirement: All five entries render pending state at launch

Per the confirmed launch decision, every row MUST show "Consultar" (no
numeric price, no duration), sourced from `pricing`.

#### Scenario: No numeric price at launch

- GIVEN the prerendered `/precios` HTML
- WHEN price values are inspected
- THEN every row MUST show "Consultar" and none MUST show a numeric price or
  duration

### Requirement: Registry-driven metadata, live status

`/precios`'s SEO entry (`primaryKeyword: "precios peluquería Ciudad Real"`)
MUST be consumed unedited, and its registry `status` MUST be `'live'`.

#### Scenario: Metadata matches registry

- GIVEN the prerendered `/precios` page
- WHEN `<title>` and primary keyword usage are inspected
- THEN both MUST match the registry entry for `precios`

### Requirement: Each row links to its service page

Every pricing row MUST link to the matching service route so a visitor can
move from price-checking to the page that satisfies the keyword.

#### Scenario: Row links resolve

- GIVEN any `/precios` row
- WHEN its link target is followed
- THEN it MUST resolve to the matching live service route
