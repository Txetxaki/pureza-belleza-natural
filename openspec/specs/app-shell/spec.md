# App Shell Specification

## Purpose

Establish the Angular 22 scaffold (pinned CLI, standalone components, signals, `@angular/ssr`), the
hybrid-prerender rendering configuration, and the shared layout shell (header, footer with NAP, root
shell) that every route in this change composes into.

## Requirements

### Requirement: Scaffold pinned to Angular CLI 22

The project MUST be scaffolded via an explicitly pinned `npx @angular/cli@22 new` invocation, not the
ambient global CLI, producing standalone components, TypeScript strict mode, and SCSS stylesheets.

#### Scenario: Fresh scaffold command

- GIVEN no Angular project exists in the repo
- WHEN the scaffold command runs
- THEN it MUST invoke `npx @angular/cli@22 new`, never a bare `ng new`
- AND `package.json` MUST record `@angular/core` at major version 22

#### Scenario: CLI version independence

- GIVEN the ambient global Angular CLI is a different major version (e.g. 21)
- WHEN the scaffold or any generation script runs
- THEN the recorded `@angular/core`/`@angular/cli` dependency versions MUST still be 22.x

### Requirement: Standalone + signals + @angular/ssr baseline

The application MUST use standalone components (no `NgModule`), MUST use Angular signals for reactive
state introduced by this change, and MUST depend on `@angular/ssr` for prerendering.

#### Scenario: No NgModule present

- GIVEN the generated `src/app/` source
- WHEN inspected
- THEN no `@NgModule`-decorated class MUST exist

#### Scenario: SSR dependency present

- GIVEN `package.json`
- WHEN dependencies are inspected
- THEN `@angular/ssr` MUST be listed

### Requirement: Hybrid prerender rendering config

`app.routes.server.ts` MUST define `ServerRoute[]` entries, and both proof routes (`/`, `/contacto`)
MUST use `RenderMode.Prerender`. `app.config.server.ts` MUST wire
`provideServerRendering(withRoutes(serverRoutes))`.

#### Scenario: Home and contact prerendered

- GIVEN `app.routes.server.ts`
- WHEN its entries are listed
- THEN an entry with `path: ''` and an entry with `path: 'contacto'` MUST both declare
  `renderMode: RenderMode.Prerender`

#### Scenario: Build output is static HTML

- GIVEN `npm run build` completes
- WHEN `dist/<project>/browser` is inspected
- THEN `index.html` MUST exist for `/` and `contacto/index.html` MUST exist for `/contacto`

### Requirement: Shared layout shell

A root shell component MUST compose a header, a `<router-outlet>`, and a footer; the footer MUST render
NAP (Name, Address, Phone) from one shared source, never duplicated per route.

#### Scenario: Every route renders through the shell

- GIVEN any prerendered route (`/`, `/contacto`)
- WHEN its HTML is inspected
- THEN the same header and footer markup MUST be present

#### Scenario: NAP consistency

- GIVEN the footer component renders on any route
- WHEN business name, address, and phone are inspected
- THEN all three MUST come from one shared constant/service, never hardcoded per route
