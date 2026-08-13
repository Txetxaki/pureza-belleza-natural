# Salon Page Specification

## Purpose

`/el-salon`: navigational trust page, no keyword target, shipping
photo-less at launch with one honest placeholder rather than fabricated
interior imagery.

## Requirements

### Requirement: Navigational, no primary keyword

`/el-salon`'s registry entry MUST have a null/empty `primaryKeyword` and
MUST be exempt from the keyword-uniqueness validator.

#### Scenario: Exempt from uniqueness check

- GIVEN the keyword-uniqueness validator runs
- WHEN `el-salon`'s entry is evaluated
- THEN it MUST be exempt, per its null `primaryKeyword`

### Requirement: Photo-less launch — atmospheric imagery + one honest placeholder

`/el-salon` MUST use only existing `atmosfera-*` botanical imagery for
non-interior visuals, and MUST render exactly one clearly-labelled
placeholder slot ("foto pendiente de la sesión") for the pending interior
photography. `/el-salon` MUST NOT use AI-generated interior/people imagery
or stock photos.

#### Scenario: One honest placeholder, no fabricated interior

- GIVEN the prerendered `/el-salon` HTML
- WHEN its imagery is inspected
- THEN exactly one interior placeholder slot MUST be present, labelled as
  pending, and no AI-generated interior or stock photo MUST be present

### Requirement: Live despite pending photography

`/el-salon`'s registry `status` MUST be `'live'` at launch; the photo gap
MUST NOT block shipping.

#### Scenario: Live status

- GIVEN the SEO registry
- WHEN the `el-salon` entry is inspected
- THEN `status` MUST equal `'live'`
