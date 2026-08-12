import { Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { PzPicture } from '../pz-picture/pz-picture';

/**
 * BLOCKED asset (task 4.8): `public/images/mapa-estatico.png` requires one
 * real Google Static Maps API call for the salon address, gated on a
 * `GOOGLE_MAPS_API_KEY` that was not available in this environment/session.
 * It was deliberately NOT fabricated. Flip this to `true` the same commit
 * that adds `public/images/mapa-estatico.png` — nothing else in this
 * component needs to change.
 */
export const STATIC_MAP_ASSET_AVAILABLE = false;

/** Pure — no API key required for a basic query-only Maps embed/search link. */
export function buildGoogleMapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function buildGoogleMapsEmbedUrl(address: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

/**
 * Static map image inside a `<button>`; clicking swaps to a live Google Maps
 * iframe (click-to-load — no eager third-party embed, no network request
 * before interaction). If the static asset isn't available (`hasStaticMap`
 * false), degrades to a plain "Cómo llegar" text link to Google Maps instead
 * of a broken `<img>` — this is the active path today (see
 * `STATIC_MAP_ASSET_AVAILABLE` above).
 */
@Component({
  selector: 'pz-static-map',
  imports: [PzPicture],
  templateUrl: './pz-static-map.html',
  styleUrl: './pz-static-map.scss',
})
export class PzStaticMap {
  readonly address = input.required<string>();
  readonly hasStaticMap = input(STATIC_MAP_ASSET_AVAILABLE);

  private readonly sanitizer = inject(DomSanitizer);

  protected readonly loaded = signal(false);

  protected readonly searchUrl = computed(() => buildGoogleMapsSearchUrl(this.address()));
  protected readonly embedUrl = computed<SafeResourceUrl>(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(buildGoogleMapsEmbedUrl(this.address())),
  );

  protected load(): void {
    this.loaded.set(true);
  }
}
