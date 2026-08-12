#!/usr/bin/env node
// prebuild — build-breaking anti-cannibalization gate (design.md §5,
// seo-infrastructure spec "Build-breaking keyword-uniqueness validator").
// Reads `src/app/seo/route-seo.registry.json` and fails the build (non-zero
// exit) if any two routes: share a normalized primary keyword, share a path,
// or share a `planta`; or if any single route's `title`/`description` exceeds
// its length budget, or `priority` falls outside 0..1.
//
// Runs as `npm run build`'s `prebuild` step (package.json), BEFORE the image
// pipeline (scripts/generate-image-variants.mjs) — this is meant to be a
// fast, cheap gate ahead of the slower sharp-based one (design risk D: CI
// must invoke `npm run build`, never bare `ng build`, or this gate is
// bypassed).
//
// Exported functions below are pure and unit-tested independently of the
// `main()` side effects (reading the registry file, process.exit).

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 155;

/** trim + lowercase + NFC + collapse internal whitespace; `null`/empty stays `null`. */
export function normalizeKeyword(keyword) {
  if (keyword === null || keyword === undefined) {
    return null;
  }
  const normalized = keyword.normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ');
  return normalized === '' ? null : normalized;
}

/**
 * Two routes sharing the same non-empty normalized `primaryKeyword` fail the
 * build. Routes with an empty/null keyword are exempt (navigational routes).
 */
export function findDuplicateKeywords(routes) {
  const seenAt = new Map();
  const duplicates = [];
  for (const route of routes) {
    const normalized = normalizeKeyword(route.primaryKeyword);
    if (normalized === null) {
      continue;
    }
    const firstPath = seenAt.get(normalized);
    if (firstPath !== undefined) {
      duplicates.push({ keyword: normalized, paths: [firstPath, route.path] });
    } else {
      seenAt.set(normalized, route.path);
    }
  }
  return duplicates;
}

/** Two registry entries declaring the same `path` fail the build. */
export function findDuplicatePaths(routes) {
  const seen = new Set();
  const duplicates = [];
  for (const route of routes) {
    if (seen.has(route.path)) {
      duplicates.push({ path: route.path });
    } else {
      seen.add(route.path);
    }
  }
  return duplicates;
}

/** Two routes claiming the same `planta` fail the build — one accent per route. */
export function findDuplicatePlantas(routes) {
  const seenAt = new Map();
  const duplicates = [];
  for (const route of routes) {
    if (route.planta === null || route.planta === undefined) {
      continue;
    }
    const firstPath = seenAt.get(route.planta);
    if (firstPath !== undefined) {
      duplicates.push({ planta: route.planta, paths: [firstPath, route.path] });
    } else {
      seenAt.set(route.planta, route.path);
    }
  }
  return duplicates;
}

/** `title > 60`, `description > 155`, or `priority` outside `0..1`. */
export function findFieldViolations(routes) {
  const violations = [];
  for (const route of routes) {
    if (route.title.length > TITLE_MAX) {
      violations.push({
        path: route.path,
        field: 'title',
        reason: `length ${route.title.length} exceeds ${TITLE_MAX}`,
      });
    }
    if (route.description.length > DESCRIPTION_MAX) {
      violations.push({
        path: route.path,
        field: 'description',
        reason: `length ${route.description.length} exceeds ${DESCRIPTION_MAX}`,
      });
    }
    if (route.priority < 0 || route.priority > 1) {
      violations.push({
        path: route.path,
        field: 'priority',
        reason: `value ${route.priority} outside 0..1`,
      });
    }
  }
  return violations;
}

/** Runs all four checks; each key holds that check's violations array (empty = pass). */
export function validateRegistry(routes) {
  return {
    duplicateKeywords: findDuplicateKeywords(routes),
    duplicatePaths: findDuplicatePaths(routes),
    duplicatePlantas: findDuplicatePlantas(routes),
    fieldViolations: findFieldViolations(routes),
  };
}

export function hasViolations(result) {
  return (
    result.duplicateKeywords.length > 0 ||
    result.duplicatePaths.length > 0 ||
    result.duplicatePlantas.length > 0 ||
    result.fieldViolations.length > 0
  );
}

function formatResult(result) {
  const lines = [];
  for (const dup of result.duplicateKeywords) {
    lines.push(`  duplicate primary keyword "${dup.keyword}" on: ${dup.paths.join(', ')}`);
  }
  for (const dup of result.duplicatePaths) {
    lines.push(`  duplicate path "${dup.path}"`);
  }
  for (const dup of result.duplicatePlantas) {
    lines.push(`  duplicate planta "${dup.planta}" on: ${dup.paths.join(', ')}`);
  }
  for (const violation of result.fieldViolations) {
    lines.push(`  ${violation.path || '(root)'}: ${violation.field} — ${violation.reason}`);
  }
  return lines.join('\n');
}

async function main() {
  const registryPath = join(process.cwd(), 'src', 'app', 'seo', 'route-seo.registry.json');
  const raw = await readFile(registryPath, 'utf-8');
  const routes = JSON.parse(raw);
  const result = validateRegistry(routes);

  if (hasViolations(result)) {
    console.error('[validate-keyword-uniqueness] registry validation failed:');
    console.error(formatResult(result));
    process.exitCode = 1;
    return;
  }

  console.log(`[validate-keyword-uniqueness] ${routes.length} routes OK`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((error) => {
    console.error('[validate-keyword-uniqueness] failed:', error);
    process.exitCode = 1;
  });
}
