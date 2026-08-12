// Canonical NAP (Name, Address, Phone) — the single source consumed by the
// footer, the contact page, and the `HairSalon` JSON-LD schema.
//
// This is the canonical home for `SITE` per design.md §3/§4. PR3 introduced a
// temporary placeholder at `shared/site.ts` before this domain existed; that
// file now re-exports from here instead of holding a second copy — see
// `sdd/foundation/apply-progress` (Engram, project "virginia") for the seam
// history. Do not duplicate these literal values anywhere else.
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
