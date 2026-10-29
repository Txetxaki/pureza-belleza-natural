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
  /**
   * Virginia's own booking page, hosted by Boty Reserve. Lives here because it
   * is site identity (like `url` and `telephone`), not page content. /reservar
   * embeds it as an iframe; a campaign or the footer may link to it directly.
   */
  readonly bookingUrl: string;
  /** The salon's Instagram profile — rendered in the footer and emitted as `sameAs`. */
  readonly instagramUrl: string;
  readonly instagramHandle: string;
  /**
   * The public Google Business rating, shown as PLAIN TEXT social proof only.
   * Deliberately never emitted as `aggregateRating`/`review` JSON-LD: Google
   * treats self-served reviews on a LocalBusiness as ineligible for review
   * rich results. Update by hand when the profile moves.
   */
  readonly googleRating: { readonly value: string; readonly count: number };
  /**
   * Opening hours as published on the salon's Google Business profile — the
   * single source for /contacto, the footer and `openingHoursSpecification`.
   * One entry per weekday, Monday first; an empty `periods` means closed.
   */
  readonly openingHours: readonly DayHours[];
}

/** schema.org day names — also the values `openingHoursSpecification` takes. */
export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

/** One continuous opening window, 24h `HH:MM`. */
export interface OpeningPeriod {
  readonly opens: string;
  readonly closes: string;
}

export interface DayHours {
  readonly day: DayOfWeek;
  /** Full Spanish name, for tables ("Lunes"). */
  readonly label: string;
  /** Abbreviated Spanish name, for compact summaries ("lun"). */
  readonly short: string;
  readonly periods: readonly OpeningPeriod[];
}

const MORNING: OpeningPeriod = { opens: '10:00', closes: '14:00' };
const AFTERNOON: OpeningPeriod = { opens: '17:00', closes: '19:30' };

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
  bookingUrl: 'https://reserve.boty.agency/r/pureza?theme=light',
  instagramUrl: 'https://www.instagram.com/pureza_belleza_natural/',
  instagramHandle: '@pureza_belleza_natural',
  googleRating: { value: '5,0', count: 36 },
  // Google Business profile, October 2026 (odd/tasks/rediseno-ficha-google.md
  // L3). Fresha and Treatwell still list older hours; they are not a source.
  openingHours: [
    { day: 'Monday', label: 'Lunes', short: 'lun', periods: [MORNING, AFTERNOON] },
    { day: 'Tuesday', label: 'Martes', short: 'mar', periods: [MORNING, AFTERNOON] },
    { day: 'Wednesday', label: 'Miércoles', short: 'mié', periods: [] },
    { day: 'Thursday', label: 'Jueves', short: 'jue', periods: [MORNING, AFTERNOON] },
    { day: 'Friday', label: 'Viernes', short: 'vie', periods: [{ opens: '10:00', closes: '19:00' }] },
    { day: 'Saturday', label: 'Sábado', short: 'sáb', periods: [MORNING] },
    { day: 'Sunday', label: 'Domingo', short: 'dom', periods: [] },
  ],
};

/** "10:00–14:00 · 17:00–19:30", or `null` when the day is closed. */
export function formatPeriods(periods: readonly OpeningPeriod[]): string | null {
  if (periods.length === 0) return null;
  return periods.map((period) => `${period.opens}–${period.closes}`).join(' · ');
}

export interface HoursSummaryRow {
  /** "lun, mar y jue" */
  readonly days: string;
  /** `null` = closed. */
  readonly hours: string | null;
}

/**
 * Collapses the week into one row per distinct schedule, in the order each
 * schedule first appears, closed days last: "lun, mar y jue · 10:00–14:00 ·
 * 17:00–19:30", "vie · 10:00–19:00", … — what fits in a footer.
 */
export function summarizeOpeningHours(week: readonly DayHours[]): HoursSummaryRow[] {
  const groups = new Map<string, DayHours[]>();
  for (const day of week) {
    const key = formatPeriods(day.periods) ?? '';
    groups.set(key, [...(groups.get(key) ?? []), day]);
  }
  const joinDays = (days: readonly DayHours[]): string => {
    const names = days.map((day) => day.short);
    return names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} y ${names.at(-1)}`;
  };
  const rows = [...groups.entries()].map(([hours, days]) => ({
    days: joinDays(days),
    hours: hours === '' ? null : hours,
  }));
  return [...rows.filter((row) => row.hours !== null), ...rows.filter((row) => row.hours === null)];
}
