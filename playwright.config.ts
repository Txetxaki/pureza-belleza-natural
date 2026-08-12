import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for `foundation` PR5 (Phase 8, design.md "Testing
 * strategy" table: "E2E ... Playwright over the prerendered dist"). Runs
 * against the REAL `npm run build` output via `scripts/serve-dist.mjs` — not
 * `ng serve` — so what's asserted is the actual static HTML that ships, not
 * a dev-server SPA shell.
 *
 * `npm run build` must be run before `npx playwright test` (the webServer
 * below does NOT rebuild — see README's "Build & CI" section, task 9.2).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4310',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'node scripts/serve-dist.mjs',
    url: 'http://localhost:4310',
    reuseExistingServer: !process.env['CI'],
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
