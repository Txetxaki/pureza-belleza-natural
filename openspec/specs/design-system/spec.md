# Design System Specification

## Purpose

Define the shape of the design-token contract — neutral base plus five plant-owned accents, each with
live/text variants — and the self-hosted typography pipeline. Exact color hex values are owned by a
parallel `sdd-design` artifact; this spec constrains structure, roles, and build-time guarantees only.

## Requirements

### Requirement: Neutral base token set

The token system MUST expose exactly four neutral-base roles: background (MUST be pure white), an
ink/primary-text token, a secondary-text token, and a hairline-border token.

#### Scenario: Background token is pure white

- GIVEN the compiled token stylesheet
- WHEN the background token is inspected
- THEN its value MUST equal `#FFFFFF`

#### Scenario: Four neutral roles present

- GIVEN the token file
- WHEN neutral-base tokens are listed
- THEN exactly four roles MUST exist: background, ink/primary-text, secondary-text, hairline-border

### Requirement: Five plant-accent tokens with live/text variants

The token system MUST define exactly five named plant-accent groups. Each group MUST expose a "live"
variant (illustration/decorative use) and a "text" variant (link/italic use).

#### Scenario: Five accents, two variants each

- GIVEN the token file
- WHEN plant-accent groups are listed
- THEN exactly five groups MUST exist, each exposing a `-live` and a `-text` token

#### Scenario: Text variant meets AA contrast

- GIVEN any accent's `-text` token value
- WHEN its contrast ratio against the background token is computed
- THEN it MUST meet or exceed WCAG 2.2 AA (4.5:1 for normal text)

### Requirement: One accent per future service route, never mixed

Each of the five plant accents MUST be reserved for exactly one of the five future service routes
(owned by the `content` change). A single service page MUST NOT combine more than one plant accent as
its primary decorative color.

#### Scenario: Accent-to-route ownership documented

- GIVEN the token contract documentation
- WHEN reviewed
- THEN each accent name MUST map to exactly one reserved service route, with no route sharing an accent

### Requirement: No dark theme

The system MUST ship light-only tokens. It MUST NOT define a `prefers-color-scheme: dark` alternate
token set or a dark-mode toggle in this change.

#### Scenario: No dark media query

- GIVEN the compiled stylesheet
- WHEN searched for `prefers-color-scheme: dark`
- THEN no such rule MUST be present

### Requirement: Self-hosted typography only

All typefaces MUST be self-hosted as latin-subset `.woff2` files under the app's public assets,
declared via hand-written `@font-face` rules with `font-display: swap`, and preloaded via
`<link rel="preload" as="font" type="font/woff2" crossorigin>` for the display weight.

#### Scenario: No external font request

- GIVEN any prerendered page's HTML and network requests
- WHEN inspected
- THEN no request MUST target `fonts.googleapis.com`, `fonts.gstatic.com`, or any external font host

#### Scenario: font-display swap declared

- GIVEN the `@font-face` rules
- WHEN inspected
- THEN each MUST declare `font-display: swap`

### Requirement: `optimization.fonts` regression guard

`angular.json`'s `optimization.fonts` option MUST remain `false`, and the repository MUST carry an
explanatory note (README or adjacent doc, since JSON forbids comments) stating that enabling it only
inlines Google/Adobe Fonts CSS and does not achieve self-hosting.

#### Scenario: Fonts optimization stays off

- GIVEN `angular.json`
- WHEN the production build configuration is inspected
- THEN `optimization.fonts` MUST be `false`

#### Scenario: Guard note present

- GIVEN the repository
- WHEN searched near the `optimization.fonts` setting or in the project README
- THEN an explanatory note MUST exist stating why it must stay off
