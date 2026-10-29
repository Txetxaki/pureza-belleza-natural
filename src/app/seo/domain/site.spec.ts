import { describe, expect, it } from 'vitest';
import { formatPeriods, SITE, summarizeOpeningHours } from './site';

describe('SITE — public data from the Google Business profile', () => {
  it('lists the seven weekdays, Monday first, with the Google hours', () => {
    expect(SITE.openingHours.map((day) => [day.label, formatPeriods(day.periods)])).toEqual([
      ['Lunes', '10:00–14:00 · 17:00–19:30'],
      ['Martes', '10:00–14:00 · 17:00–19:30'],
      ['Miércoles', null],
      ['Jueves', '10:00–14:00 · 17:00–19:30'],
      ['Viernes', '10:00–19:00'],
      ['Sábado', '10:00–14:00'],
      ['Domingo', null],
    ]);
  });

  it('carries the Instagram profile and the Google rating as plain data', () => {
    expect(SITE.instagramUrl).toBe('https://www.instagram.com/pureza_belleza_natural/');
    expect(SITE.instagramHandle).toBe('@pureza_belleza_natural');
    expect(SITE.googleRating).toEqual({ value: '5,0', count: 36 });
  });
});

describe('summarizeOpeningHours', () => {
  it('collapses the week into one row per schedule, closed days last', () => {
    expect(summarizeOpeningHours(SITE.openingHours)).toEqual([
      { days: 'lun, mar y jue', hours: '10:00–14:00 · 17:00–19:30' },
      { days: 'vie', hours: '10:00–19:00' },
      { days: 'sáb', hours: '10:00–14:00' },
      { days: 'mié y dom', hours: null },
    ]);
  });

  it('formats a closed day as null rather than an empty string', () => {
    expect(formatPeriods([])).toBeNull();
  });
});
