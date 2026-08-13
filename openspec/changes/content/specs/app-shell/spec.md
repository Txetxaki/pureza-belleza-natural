# Delta for App Shell

## ADDED Requirements

### Requirement: Header centred wordmark with services dropdown

The header MUST centre the `Pureza` wordmark. It MUST expose a services
dropdown/menu that links directly to the five live service routes — never
to a `/servicios` index page, which MUST NOT exist (anti-cannibalization
rule 1).

#### Scenario: Wordmark centred

- GIVEN any route's header
- WHEN its layout is inspected
- THEN the wordmark MUST render horizontally centred between the nav and
  the reserve CTA

#### Scenario: Dropdown links to five service routes, no index page

- GIVEN the header's services dropdown
- WHEN its entries are enumerated
- THEN exactly the five live service routes MUST be listed, and no entry
  or route MUST point to `/servicios`

## MODIFIED Requirements

### Requirement: Shared layout shell, centred footer

A root shell component MUST compose a header, a `<router-outlet>`, and a
footer; the footer MUST render NAP (Name, Address, Phone) from one shared
source, never duplicated per route. The footer MUST render, in order, a
centred italic wordmark, a centred row of small-caps links, then a centred
copyright line — matching the Stitch mockup's editorial centring.
(Previously: header/footer composition and NAP-sourcing only; no centring
requirement stated.)

#### Scenario: Every route renders through the shell

- GIVEN any prerendered route (all twelve)
- WHEN its HTML is inspected
- THEN the same header and footer markup MUST be present

#### Scenario: NAP consistency

- GIVEN the footer component renders on any route
- WHEN business name, address, and phone are inspected
- THEN all three MUST come from one shared constant/service, never
  hardcoded per route

#### Scenario: Footer content order and centring

- GIVEN any route's footer
- WHEN its wordmark, link row, and copyright line are inspected
- THEN they MUST appear in that order, each horizontally centred

### Requirement: Full prerender rendering config — twelve routes, no server exception

`app.routes.server.ts` MUST define `ServerRoute[]` entries for all twelve
registry routes, and every one of them — including `/reservar` and any
nested `/reservar/**` path — MUST use `RenderMode.Prerender`. There is no
server-rendered route in this project (see `reservar-page` spec: Angular has
no first-party SSR adapter on the deployment target, and `/reservar` has no
dynamic state to render in this phase — decision #2267/#2310).
`/diario/:slug` entries MUST be generated via `getPrerenderParams`,
returning the three launch article slugs, and MUST use
`RenderMode.Prerender`. `app.config.server.ts` MUST wire
`provideServerRendering(withRoutes(serverRoutes))`.
(Previously: only `/` and `/contacto` declared, both `RenderMode.Prerender`.
An intermediate draft of this requirement introduced a `/reservar`
`RenderMode.Server` exception sourced from a stale `config.yaml` note; that
exception is superseded and MUST NOT be reintroduced — see decision #2310.)

#### Scenario: Home and contact prerendered

- GIVEN `app.routes.server.ts`
- WHEN its entries are listed
- THEN an entry with `path: ''` and an entry with `path: 'contacto'` MUST
  both declare `renderMode: RenderMode.Prerender`

#### Scenario: All ten new routes prerendered, `/reservar` included

- GIVEN `app.routes.server.ts`
- WHEN its entries are listed
- THEN every registry route, including `reservar`, MUST declare
  `renderMode: RenderMode.Prerender`

#### Scenario: Diario slugs prerendered via getPrerenderParams

- GIVEN `app.routes.server.ts`'s `/diario/:slug` entry
- WHEN its `getPrerenderParams` resolves
- THEN it MUST return exactly the three launch article slugs, each
  rendered via `RenderMode.Prerender`

#### Scenario: Build output is static HTML

- GIVEN `npm run build` completes
- WHEN `dist/<project>/browser` is inspected
- THEN `index.html` MUST exist for every one of the twelve prerendered
  routes, including `reservar/index.html`, and no route MUST require a live
  Node server to be served
