# Virginia Page Specification

## Purpose

`/virginia`: E-E-A-T brand page establishing Virginia as a real,
credentialed practitioner, and the `Person` anchor every `BlogPosting` and
`Service` provider reference points back to.

## Requirements

### Requirement: E-E-A-T narrative, unique H1, no accent

`/virginia` MUST carry `primaryKeyword: "Virginia peluquera Ciudad Real"` as
its H1, MUST NOT bind any `[data-planta]` accent scope, and MUST present
experience/credentials content (not just a photo and a name).

#### Scenario: Neutral, no accent scope

- GIVEN the prerendered `/virginia` HTML
- WHEN `[data-planta]` attributes are enumerated
- THEN none MUST be present

### Requirement: Stable `Person` JSON-LD anchor

`/virginia` MUST emit a `Person` JSON-LD block with a stable `@id`, `name`,
and `worksFor` referencing the `HairSalon` `@id`. This `@id` MUST be the
same value referenced by every `BlogPosting.author` (see `diario`).

#### Scenario: Person @id is stable and referenced

- GIVEN `/virginia`'s `Person` JSON-LD and any launch article's
  `BlogPosting` JSON-LD
- WHEN their `@id`/`author.@id` values are compared
- THEN they MUST be identical

### Requirement: Registry-driven metadata, live status

`/virginia`'s registry entry MUST be consumed unedited and its `status`
MUST be `'live'`.

#### Scenario: Live status

- GIVEN the SEO registry
- WHEN the `virginia` entry is inspected
- THEN `status` MUST equal `'live'`
