# Delta for Design System

## MODIFIED Requirements

### Requirement: One accent per live service route, `/precios` sibling exception

Each of the five plant accents MUST be reserved for exactly one of the
five live service routes. A single service page MUST NOT combine more than
one plant accent as its primary decorative color. The sole exception is
`/precios`, where all five accents coexist as **sibling** `[data-planta]`
scopes, one per tariff row, never nested inside one another or inside a
sixth wrapping scope.
(Previously: routes described as "future"/unbuilt, with no stated
exception for any page.)

#### Scenario: Accent-to-route ownership documented

- GIVEN the token contract documentation
- WHEN reviewed
- THEN each accent name MUST map to exactly one reserved service route,
  with no route sharing an accent

#### Scenario: `/precios` sibling exception holds

- GIVEN `/precios`'s rendered `[data-planta]` scopes
- WHEN their DOM nesting is inspected
- THEN all five MUST be siblings, and none MUST be nested inside another
  `[data-planta]` scope
