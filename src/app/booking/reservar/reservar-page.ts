import { Component, OnInit, OnDestroy, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PzCta } from '../../shared/ui/pz-cta/pz-cta';
import { SeoService } from '../../seo/application/seo.service';
import { buildBreadcrumbListSchema } from '../../seo/generators/breadcrumb-list.schema';
import { SITE } from '../../seo/domain/site';
import { buildTelUrl, buildWhatsAppUrl } from '../../shared/utils/contact-links';

/** Height band the iframe is allowed to take, so a stray message can neither
 *  collapse it to nothing nor blow the page up. */
export const EMBED_MIN_HEIGHT = 320;
export const EMBED_MAX_HEIGHT = 4000;

/**
 * Resolves a booking-app height message to a clamped height, or `null` when the
 * message is not a trustworthy height report. Pure and exported so the origin
 * check (the security-relevant part) is tested directly.
 */
export function embedHeightFromMessage(
  event: { origin: string; data: unknown },
  expectedOrigin: string,
): number | null {
  if (event.origin !== expectedOrigin) return null;
  const data = event.data as { type?: string; height?: number } | null;
  if (data?.type !== 'reserve-embed:height') return null;
  if (typeof data.height !== 'number' || !Number.isFinite(data.height)) {
    return null;
  }
  return Math.max(EMBED_MIN_HEIGHT, Math.min(data.height, EMBED_MAX_HEIGHT));
}

/**
 * `/reservar` — the booking page. Its H1 shares no common keyword phrase with
 * `/contacto`'s H1, and it does NOT repeat `/contacto`'s address/hours/map/NAP
 * (anti-cannibalization rule 3) — it links there instead.
 *
 * ONLINE BOOKING (embedded): the page used to say "en Pureza no hay un
 * calendario online" and offer only WhatsApp/`tel:`. Virginia now has a real
 * booking page hosted by Boty Reserve (`SITE.bookingUrl`), so it is embedded
 * here as an iframe — the client books without leaving purezabellezanatural.es.
 * The booking app reports its height via `postMessage`, and the listener below
 * (browser-only, origin-checked against `SITE.bookingUrl`) resizes the iframe
 * so there is no inner scrollbar. WhatsApp and `tel:` stay as alternatives:
 * clients who prefer to explain their hair before committing are exactly this
 * salon's audience.
 *
 * This SUPERSEDES the old "No calendar widget" rule — the owner asked for the
 * calendar integrated. Reserve's `frame-ancestors` allow-lists this domain, so
 * only purezabellezanatural.es may embed it.
 *
 * `RenderMode.Prerender`, NOT Server: the iframe is static HTML at build time,
 * and the resize listener only runs in the browser after hydration, so the
 * route stays prerenderable.
 */
@Component({
  selector: 'app-reservar-page',
  imports: [PzCta, RouterLink],
  templateUrl: './reservar-page.html',
  styleUrl: './reservar-page.scss',
})
export class ReservarPage implements OnInit, OnDestroy {
  private readonly seo = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly site = SITE;
  protected readonly whatsappUrl = buildWhatsAppUrl(SITE.telephone);
  protected readonly telUrl = buildTelUrl(SITE.telephone);

  /** `SITE.bookingUrl` is a hardcoded first-party constant, safe to trust. */
  protected readonly bookingUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    SITE.bookingUrl,
  );
  private readonly bookingOrigin = new URL(SITE.bookingUrl).origin;

  /** Reserved height before the booking app reports its own (avoids a jump). */
  protected readonly frameHeight = signal(780);
  protected readonly frameLoaded = signal(false);

  private onMessage?: (event: MessageEvent) => void;

  constructor() {
    afterNextRender(() => {
      this.onMessage = (event: MessageEvent): void => {
        const height = embedHeightFromMessage(event, this.bookingOrigin);
        if (height !== null) this.frameHeight.set(height);
      };
      window.addEventListener('message', this.onMessage);
    });
  }

  ngOnInit(): void {
    this.seo.removeJsonLd('hair-salon');
    this.seo.setJsonLd(
      'breadcrumb',
      buildBreadcrumbListSchema([
        { name: 'Inicio', path: '' },
        { name: 'Reservar', path: 'reservar' },
      ]),
    );
  }

  ngOnDestroy(): void {
    if (this.onMessage) {
      window.removeEventListener('message', this.onMessage);
    }
  }

  protected onFrameLoad(): void {
    this.frameLoaded.set(true);
  }
}
