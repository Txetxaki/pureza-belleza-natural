// Fixture test for the prebuild keyword-uniqueness gate (task 8.2). Unlike
// validate-keyword-uniqueness.spec.ts (which imports the script's exported
// pure functions directly), this spec actually SPAWNS
// scripts/validate-keyword-uniqueness.mjs as node's `prebuild` step would,
// against a TEMPORARY fixture copy of the registry with a deliberately
// duplicated keyword written under `os.tmpdir()`. The real, committed
// `src/app/seo/route-seo.registry.json` is never read for writing and never
// modified by this test — only copied, then mutated in the copy.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

// `import.meta.url` isn't a `file:` URL once Vite transforms this spec, so
// paths are resolved from `process.cwd()` instead — Angular's vitest runner
// always runs with cwd = the project root (same assumption
// generate-sitemap.spec.ts's sibling `.mjs` import relies on).
const REAL_SCRIPT_PATH = join(process.cwd(), 'scripts', 'validate-keyword-uniqueness.mjs');
const REAL_REGISTRY_PATH = join(
  process.cwd(),
  'src',
  'app',
  'seo',
  'route-seo.registry.json',
);

let tempDir: string | undefined;

afterEach(() => {
  if (tempDir) {
    rmSync(tempDir, { recursive: true, force: true });
    tempDir = undefined;
  }
});

describe('scripts/validate-keyword-uniqueness.mjs — spawned as a real process (not just its exported functions)', () => {
  it('exits 0 against the real, unmodified registry — sanity-checks the fixture harness itself', () => {
    const output = execFileSync(process.execPath, [REAL_SCRIPT_PATH], {
      cwd: process.cwd(),
      encoding: 'utf-8',
    });
    expect(output).toContain('routes OK');
  });

  it('exits non-zero when a FIXTURE COPY of the registry has a duplicated keyword — the real committed registry is never touched', () => {
    tempDir = mkdtempSync(join(tmpdir(), 'pz-validate-fixture-'));
    const fixtureSeoDir = join(tempDir, 'src', 'app', 'seo');
    mkdirSync(fixtureSeoDir, { recursive: true });

    const registry = JSON.parse(readFileSync(REAL_REGISTRY_PATH, 'utf-8')) as Array<{
      primaryKeyword: string | null;
    }>;
    expect(registry.length).toBeGreaterThan(1);
    // Deliberately collide route[1]'s keyword with route[0]'s, in the copy only.
    registry[1] = { ...registry[1], primaryKeyword: registry[0].primaryKeyword };
    writeFileSync(
      join(fixtureSeoDir, 'route-seo.registry.json'),
      JSON.stringify(registry, null, 2),
      'utf-8',
    );

    let threw = false;
    try {
      execFileSync(process.execPath, [REAL_SCRIPT_PATH], { cwd: tempDir, encoding: 'utf-8' });
    } catch (error) {
      threw = true;
      const execError = error as { status: number | null; stderr: string };
      expect(execError.status).not.toBe(0);
      expect(execError.stderr).toContain('duplicate primary keyword');
    }
    expect(threw).toBe(true);

    // The real registry on disk is untouched by this test.
    const realRegistryAfter = readFileSync(REAL_REGISTRY_PATH, 'utf-8');
    const realRegistryParsed = JSON.parse(realRegistryAfter) as Array<{
      primaryKeyword: string | null;
    }>;
    expect(realRegistryParsed[1].primaryKeyword).not.toBe(realRegistryParsed[0].primaryKeyword);
  });
});
