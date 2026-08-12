// SEAM RESOLVED (PR4): the canonical `SITE` NAP constant now lives at
// `seo/domain/site.ts` (design.md §3/§4). This file re-exports it so every
// existing import of `shared/site.ts` (e.g. `site-footer.ts`) keeps working
// unchanged — see `sdd/foundation/apply-progress` (Engram, project
// "virginia") for the full seam history. Do not reintroduce a second copy of
// this data here; import from `seo/domain/site` directly in new code instead.
export { SITE, type Site } from '../seo/domain/site';
