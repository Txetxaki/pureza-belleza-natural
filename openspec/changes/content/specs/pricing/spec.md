# Pricing Specification

## Purpose

One tariff source of truth, keyed by SEO registry `path`, consumed
identically by `/precios`, the home `carta`, and each service page's
price/duration section, so the same figure can never diverge across the
site.

## Requirements

### Requirement: Single pricing source keyed by registry path

Exactly one pricing data source MUST exist. Each entry MUST be keyed by a
`route-seo.registry.json` `path` value and MUST declare a `status` of either
`pending` or `confirmed`, plus `price` and `duration` fields (nullable when
`pending`).

#### Scenario: One source, three consumers

- GIVEN `/precios`, the home carta, and any service page render a price
- WHEN their rendered price/duration values are compared for the same route
- THEN all three MUST match exactly, sourced from the same pricing entry

### Requirement: Bijection with planta-owning registry routes

Every registry route that declares a non-null `planta` MUST have exactly one
pricing entry, and every pricing entry MUST correspond to exactly one
planta-owning registry route. Neither orphan pricing entries nor
missing-pricing service routes MUST exist.

#### Scenario: Bijection holds

- GIVEN the SEO registry and the pricing source
- WHEN routes with non-null `planta` are compared against pricing entries
- THEN the two sets MUST be in exact 1:1 correspondence

#### Scenario: Drift is caught

- GIVEN a planta-owning registry route added or removed without a matching
  pricing entry change
- WHEN the bijection check runs
- THEN it MUST fail (unit test, per the project's real-logic testing
  carve-out)

### Requirement: Pending state — no invented values

A `pending` entry MUST render as "Consultar" wherever displayed and MUST NOT
render a numeric price or duration. Duration MUST carry the same `pending`
flag as price — the two MUST NOT be independently pending/confirmed.

#### Scenario: Pending price implies pending duration

- GIVEN a pricing entry with `status: 'pending'`
- WHEN its `duration` field is inspected
- THEN it MUST also be null/absent, never an approximate figure

### Requirement: Confirmed state feeds structured data

When an entry's `status` is `confirmed`, its price/duration MUST become
eligible for the `Service` JSON-LD `offers` node on the matching service
page (see `seo-infrastructure`); while `pending`, that node MUST be omitted.

#### Scenario: Confirmed entry unlocks Offer

- GIVEN a pricing entry flips from `pending` to `confirmed`
- WHEN the matching service page's JSON-LD is regenerated
- THEN an `Offer` node with that `price` MUST appear inside its `Service`
  block
