import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { POSTS_MANIFEST } from '../../../diario/domain/post-manifest';
import { ROUTE_SEO_REGISTRY } from '../../../seo/domain/route-seo';
import { PzWordmark } from '../../ui/pz-wordmark/pz-wordmark';
import { buildDiarioNav, buildHeaderNav, type HeaderNav, type NavRouteEntry } from '../route-registry';

/** The two disclosures this header owns; `null` means both panels are shut. */
type PanelId = 'carta' | 'diario';

/**
 * Site-wide header. Three centred zones (design.md D7,
 * `buildHeaderNav` in `../route-registry.ts`): non-service nav links left,
 * the wordmark centred, the `Carta` and `Diario` disclosures + reserve CTA on
 * the right. Entirely registry-status-driven — flipping a registry entry's
 * `status` grows or shrinks every zone with zero edits here.
 *
 * Each disclosure is a plain button + `<ul>` (design.md "Header dropdown" —
 * deliberately NOT `role="menu"`, a handful of links don't need the APG menu
 * contract):
 * - Click/Enter/Space toggles `aria-expanded` (native `<button>` semantics —
 *   Enter/Space already dispatch `click`, no extra handler needed).
 * - `Escape` closes and returns focus to the trigger.
 * - `ArrowDown` on the trigger opens the panel and focuses its first link.
 * - Clicking a link inside a panel closes it. Without this the panel stays
 *   open over the page it just navigated to, because a same-document router
 *   navigation neither reloads the DOM nor moves focus out of the container.
 * - `focusout` outside the whole disclosure container closes it — never
 *   inside it (tabbing between the trigger and its own links must not close
 *   the panel mid-navigation).
 * - No-JS path: panels are always in the prerendered DOM, hidden via
 *   `visibility/opacity` (never `display: none`, so their links stay tabbable)
 *   and revealed by `:focus-within` — a documented, accepted imperfection is
 *   that `aria-expanded` stays `"false"` in that path, since no click ever
 *   ran. Every link in both panels also lives in the footer (belt-and-braces —
 *   the dropdowns are an enhancement, never the only path).
 *
 * `openPanel` is one signal rather than a boolean per disclosure: the panels
 * are mutually exclusive, and a single value makes that structural instead of
 * a rule two independent booleans could drift out of.
 */
@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive, PzWordmark],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  private readonly router = inject(Router);

  protected readonly nav = computed<HeaderNav>(() => buildHeaderNav(ROUTE_SEO_REGISTRY));
  protected readonly diarioPosts: readonly NavRouteEntry[] = buildDiarioNav(POSTS_MANIFEST);

  protected readonly openPanel = signal<PanelId | null>(null);

  /**
   * Current URL as a signal. `RouterLinkActive` cannot do this job: both
   * triggers are `<button>`s, and the state they render is "one of my CHILDREN
   * is the active route", which no directive on the parent can observe.
   * Seeded with `router.url` so the very first (prerendered) render is already
   * correct — `NavigationEnd` for the initial navigation may have fired before
   * this component existed.
   */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** Compared against the path itself and its `/`-suffixed form so `/diario`
   * matches `/diario/<slug>` but never a sibling like `/diario-taller`. */
  private isUnder(path: string): boolean {
    const current = this.url().split(/[?#]/, 1)[0];
    return current === `/${path}` || current.startsWith(`/${path}/`);
  }

  protected readonly cartaActive = computed(() =>
    this.nav().dropdownServices.some((service) => this.isUnder(service.path)),
  );

  protected readonly diarioActive = computed(() => this.isUnder('diario'));

  protected isOpen(panel: PanelId): boolean {
    return this.openPanel() === panel;
  }

  protected togglePanel(panel: PanelId): void {
    this.openPanel.update((open) => (open === panel ? null : panel));
  }

  protected closePanel(): void {
    this.openPanel.set(null);
  }

  protected openAndFocusFirstLink(panel: PanelId, event: Event, list: HTMLElement): void {
    event.preventDefault();
    this.openPanel.set(panel);
    queueMicrotask(() => list.querySelector('a')?.focus());
  }

  protected closeAndReturnFocus(trigger: HTMLButtonElement): void {
    this.closePanel();
    trigger.focus();
  }

  protected onContainerFocusOut(event: FocusEvent): void {
    const nextFocusTarget = event.relatedTarget as Node | null;
    const container = event.currentTarget as HTMLElement;
    if (!nextFocusTarget || !container.contains(nextFocusTarget)) {
      this.closePanel();
    }
  }
}
