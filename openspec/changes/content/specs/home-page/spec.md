# Delta for Home Page

## ADDED Requirements

### Requirement: Hero five-plant frieze links to live service routes

The hero section MUST render a horizontal row of five small circular
botanical line-icons, one per plant accent, each labelled with its
uppercase plant name (`ROMERO`, `ESPLIEGO`, `ESPARTO`, `VID`, `OLIVO`) and
linking to its matching live service route.

#### Scenario: Five frieze links resolve

- GIVEN the prerendered `/` HTML
- WHEN the hero frieze's five links are followed
- THEN each MUST resolve to its matching live service route, correctly
  paired by plant/accent

### Requirement: Carta rows show price from `pricing`

Each `carta` row MUST display a right-aligned price value sourced from the
same `pricing` entry used by `/precios` and the matching service page —
never a hardcoded literal.

#### Scenario: Carta price matches `/precios`

- GIVEN a `carta` row and its matching `/precios` row for the same service
- WHEN their displayed price text is compared
- THEN they MUST be identical (both "Consultar" at launch)

### Requirement: Value-prop band and section intros are centred

The home's value-proposition band (its three items) and section intro
eyebrows/titles MUST render horizontally centred, per the Stitch mockup's
editorial layout.

#### Scenario: Value-prop band centred

- GIVEN the prerendered `/` HTML
- WHEN the value-prop band's layout is inspected
- THEN its three items MUST be centred as a group, not left-aligned

## MODIFIED Requirements

### Requirement: Home route composition links to all five live service routes

`/` MUST render through the shared layout shell and MUST link to all five
live service routes (via the hero frieze and the `carta` block above),
plus `/virginia`, `/el-salon`, `/precios`, `/reservar`, and `/diario`
through standard nav/footer links — every registry route now exists and is
live.
(Previously: `/` MUST NOT link to any of the five service routes,
`/virginia`, `/el-salon`, `/precios`, `/reservar`, or `/diario`, because
they had not shipped yet.)

#### Scenario: Carta and frieze link to all five service routes

- GIVEN the prerendered `/` HTML
- WHEN all `<a href>` targets are enumerated
- THEN each of the five live service routes MUST be linked from at least
  one of the hero frieze or the `carta` block

#### Scenario: Layout shell present

- GIVEN `/` renders
- WHEN inspected
- THEN the shared header and footer MUST be present
