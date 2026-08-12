// Canonical NAP (Name, Address, Phone) — the single source consumed by the
// footer, the contact page, and the `HairSalon` JSON-LD schema.
//
// SEAM: design.md §3 places this constant at `seo/domain/site.ts`, but the
// `seo/` domain (PR4) hasn't landed yet. This file holds the real data now so
// the layout shell (PR3) has something authoritative to render instead of a
// hardcoded string. When PR4 introduces `seo/domain/site.ts`, it MUST either
// re-export this constant or this file must be deleted and every import
// updated to point at the SEO domain — the data must never be duplicated in
// two places. Do not copy these literal values elsewhere.
export interface Site {
  readonly name: string;
  readonly legalName: string;
  readonly streetAddress: string;
  readonly postalCode: string;
  readonly addressLocality: string;
  readonly addressCountry: string;
  readonly telephone: string; // E.164, used for tel: and wa.me links
  readonly telephoneDisplay: string; // human-readable, for visible text
  readonly url: string;
}

export const SITE: Site = {
  name: 'Pureza',
  legalName: 'Pureza — Peluquería de autor y bienestar botánico',
  streetAddress: 'Calle Pozo Dulce, 1',
  postalCode: '13001',
  addressLocality: 'Ciudad Real',
  addressCountry: 'ES',
  telephone: '+34633101155',
  telephoneDisplay: '633 101 155',
  url: 'https://purezabellezanatural.es',
};
