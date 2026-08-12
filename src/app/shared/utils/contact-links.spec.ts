import { describe, expect, it } from 'vitest';
import { buildTelUrl, buildWhatsAppUrl, DEFAULT_WHATSAPP_MESSAGE } from './contact-links';

const PHONE_E164 = '+34633101155';

describe('buildWhatsAppUrl', () => {
  it('builds a wa.me URL with the international number (no leading "+") and the default message encoded', () => {
    const url = buildWhatsAppUrl(PHONE_E164);
    expect(url).toBe(
      `https://wa.me/34633101155?text=${encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE)}`,
    );
  });

  it('accepts a custom message, URL-encoded', () => {
    const url = buildWhatsAppUrl(PHONE_E164, 'Hola, ¿tenéis hueco mañana?');
    expect(url).toBe(
      'https://wa.me/34633101155?text=' + encodeURIComponent('Hola, ¿tenéis hueco mañana?'),
    );
    expect(url).not.toContain(' ');
    expect(url).not.toContain('¿');
  });

  it('strips any non-digit characters from the phone number', () => {
    const url = buildWhatsAppUrl('+34 633 101 155', 'hola');
    expect(url.startsWith('https://wa.me/34633101155?text=')).toBe(true);
  });
});

describe('buildTelUrl', () => {
  it('builds a tel: URL preserving the E.164 phone number as-is', () => {
    expect(buildTelUrl(PHONE_E164)).toBe('tel:+34633101155');
  });
});
