// Pure link-builder functions for the contact CTAs (design.md §7,
// contact-page spec "WhatsApp-first primary CTA"). No Angular dependency —
// `contact-page.ts` renders their output through `pz-cta`'s `external` input.

/** Default message used when a caller doesn't pass its own. */
export const DEFAULT_WHATSAPP_MESSAGE = 'Hola, querría pedir información/cita en Pureza.';

/**
 * `https://wa.me/<intl-number>?text=<encoded>` — `phone` MUST already be in
 * E.164 form (e.g. `SITE.telephone`, `+34633101155`); wa.me takes the digits
 * only, no leading `+`.
 */
export function buildWhatsAppUrl(phone: string, message: string = DEFAULT_WHATSAPP_MESSAGE): string {
  const digitsOnly = phone.replace(/[^\d]/g, '');
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

/** `tel:<number>` — kept in E.164 form, exactly as `SITE.telephone` provides it. */
export function buildTelUrl(phone: string): string {
  return `tel:${phone}`;
}
