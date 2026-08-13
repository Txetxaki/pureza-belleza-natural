# Reservar Page Specification

## Purpose

`/reservar`: the conversion page explaining how booking works and what to
send Virginia — deliberately distinct from `/contacto`'s navigational NAP
content, so the two never overlap on H1 or intent (anti-cannibalization
rule 3).

## Requirements

### Requirement: Content distinct from `/contacto`

`/reservar` MUST cover how booking works and what information to send
(service wanted, preferred dates, hair length/history). `/reservar` MUST
NOT duplicate `/contacto`'s location/hours/map/NAP content, and its H1 MUST
NOT overlap `/contacto`'s H1 even partially.

#### Scenario: H1s do not overlap

- GIVEN `/reservar` and `/contacto`'s rendered H1 text
- WHEN compared
- THEN they MUST share no common keyword phrase

#### Scenario: No NAP/map duplication

- GIVEN `/reservar`'s rendered content
- WHEN inspected for address, hours, or an embedded map
- THEN none of those MUST be present (they live on `/contacto` only)

### Requirement: WhatsApp/tel CTA only, no calendar

`/reservar` MUST present WhatsApp and `tel:` CTAs as the booking mechanism
and MUST NOT embed or link to a real-time booking calendar widget in this
change.

#### Scenario: No calendar widget

- GIVEN the prerendered `/reservar` HTML
- WHEN inspected
- THEN no calendar/scheduling widget or iframe MUST be present

### Requirement: Prerendered, like every other route

`/reservar` MUST use `RenderMode.Prerender`, exactly like the other eleven
routes. There is no server-rendered route in this project.

The `RenderMode.Server` note in `openspec/config.yaml`'s stack description is
superseded and MUST NOT be treated as authoritative. Two independent reasons,
both already recorded before this change:

1. **There is nothing dynamic to render.** In this phase `/reservar` is a
   WhatsApp/`tel:` conversion page explaining how booking works — no calendar,
   no availability lookup, no per-user state (decision #2267). A server render
   of static content buys nothing and costs a live Node process.
2. **The deployment target cannot serve it.** `openspec/changes/foundation/exploration.md`
   §2.1 verified against Vercel's own framework-support matrix that Angular has
   no first-party SSR adapter; the community workaround routes *every* request
   — including the eleven prerendered pages — through a single serverless
   function, destroying the "static routes served free from the CDN" property
   the whole architecture depends on. The exploration's explicit recommendation
   was to drop `RenderMode.Server` entirely, in this phase and the next.

A real booking application, if it ever ships, is a separate change that must
re-open the hosting question first.

#### Scenario: Prerender render mode

- GIVEN `app.routes.server.ts`
- WHEN the `reservar` entry is inspected
- THEN it MUST declare `renderMode: RenderMode.Prerender`, not `Server`

#### Scenario: Static output exists

- GIVEN a completed `npm run build`
- WHEN `dist/pureza/browser/` is inspected
- THEN `reservar/index.html` MUST exist as a prerendered file
- AND the build MUST NOT require a Node server to serve it

### Requirement: Registry-driven metadata, live status

`/reservar`'s `primaryKeyword` ("pedir cita peluquería Ciudad Real") MUST
come from the registry unedited and `status` MUST be `'live'`.

#### Scenario: Live status

- GIVEN the SEO registry
- WHEN the `reservar` entry is inspected
- THEN `status` MUST equal `'live'`
