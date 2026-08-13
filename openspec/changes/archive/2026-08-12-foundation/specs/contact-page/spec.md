# Contact Page Specification

## Purpose

`/contacto` end to end: WhatsApp-first primary CTA with phone as secondary, click-to-load static map,
and the navigational (no-keyword) SEO entry.

## Requirements

### Requirement: WhatsApp-first primary CTA

`/contacto` MUST present a WhatsApp deep link (`wa.me` or `api.whatsapp.com`) as the primary
call-to-action for initiating contact. A `tel:` phone link MUST also be present but MUST be secondary
(not the primary/first CTA in visual hierarchy or DOM order among the contact CTAs).

#### Scenario: WhatsApp link is primary

- GIVEN the prerendered `/contacto` HTML
- WHEN the contact CTAs are inspected
- THEN a `wa.me`/`api.whatsapp.com` link MUST be present and marked as the primary action (e.g. primary
  button variant, first in CTA order)

#### Scenario: Phone remains available as secondary

- GIVEN the prerendered `/contacto` HTML
- WHEN the contact CTAs are inspected
- THEN a `tel:` link MUST be present, rendered as a secondary action

### Requirement: Route composition and layout

`/contacto` MUST render through the shared layout shell and MUST use `RenderMode.Prerender`.

#### Scenario: Contact renders through shell

- GIVEN `/contacto` renders
- WHEN inspected
- THEN the shared header and footer MUST be present

### Requirement: Navigational SEO entry, no primary keyword

`/contacto`'s SEO registry entry MUST have an empty/null primary keyword (navigational, per the
12-route keyword map) and MUST still carry title, meta description, canonical, and a `BreadcrumbList`
JSON-LD block.

#### Scenario: No keyword collision risk

- GIVEN the keyword-uniqueness validator runs
- WHEN `/contacto`'s entry is evaluated
- THEN it MUST be exempt from the uniqueness check (see `seo-infrastructure`)

#### Scenario: Metadata still present despite no keyword

- GIVEN the prerendered `/contacto` page
- WHEN `<title>`, meta description, canonical, and JSON-LD are inspected
- THEN all MUST be present and non-empty

### Requirement: Click-to-load static map

`/contacto` MUST show the salon location as a static map image by default; the interactive Google Maps
embed MUST load only after explicit user interaction, never automatically on page load.

#### Scenario: No iframe before interaction

- GIVEN the prerendered `/contacto` HTML, before any click
- WHEN inspected
- THEN no Maps `<iframe>` MUST be present in the DOM

#### Scenario: Interactive map loads on click

- GIVEN the static map image is rendered
- WHEN the user clicks it
- THEN the interactive Maps embed MUST then load
