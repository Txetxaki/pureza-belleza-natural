import { Component, ElementRef, computed, signal, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ROUTE_SEO_REGISTRY } from '../../../seo/domain/route-seo';
import { buildHeaderNav, type HeaderNav } from '../route-registry';

/**
 * Site-wide header. Three centred zones (design.md D7,
 * `buildHeaderNav` in `../route-registry.ts`): non-service nav links left,
 * the `Pureza` wordmark centred, the `Carta` services disclosure + reserve
 * CTA on the right. Entirely registry-status-driven — flipping a registry
 * entry's `status` grows or shrinks every zone with zero edits here.
 *
 * The `Carta` disclosure is a plain button + `<ul>` (design.md "Header
 * dropdown" — deliberately NOT `role="menu"`, five links don't need the APG
 * menu contract):
 * - Click/Enter/Space toggles `aria-expanded` (native `<button>` semantics —
 *   Enter/Space already dispatch `click`, no extra handler needed).
 * - `Escape` closes and returns focus to the trigger.
 * - `ArrowDown` on the trigger opens the panel and focuses its first link.
 * - `focusout` outside the whole `.header-carta` container closes it —
 *   never inside it (tabbing between the trigger and its own links must not
 *   close the panel mid-navigation).
 * - No-JS path: the panel is always in the prerendered DOM, hidden via
 *   `visibility/opacity` (never `display: none`, so its links stay tabbable)
 *   and revealed by `.header-carta:focus-within` — a documented, accepted
 *   imperfection is that `aria-expanded` stays `"false"` in that path, since
 *   no click ever ran. The same five links also live in the centred footer
 *   (belt-and-braces — the dropdown is an enhancement, never the only path).
 */
@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  protected readonly nav = computed<HeaderNav>(() => buildHeaderNav(ROUTE_SEO_REGISTRY));

  protected readonly dropdownOpen = signal(false);

  private readonly cartaTrigger = viewChild<ElementRef<HTMLButtonElement>>('cartaTrigger');
  private readonly cartaPanel = viewChild<ElementRef<HTMLUListElement>>('cartaPanel');

  protected toggleDropdown(): void {
    this.dropdownOpen.update((open) => !open);
  }

  protected openAndFocusFirstLink(event: Event): void {
    event.preventDefault();
    this.dropdownOpen.set(true);
    queueMicrotask(() => this.cartaPanel()?.nativeElement.querySelector('a')?.focus());
  }

  protected closeAndReturnFocus(): void {
    this.dropdownOpen.set(false);
    this.cartaTrigger()?.nativeElement.focus();
  }

  protected onContainerFocusOut(event: FocusEvent): void {
    const nextFocusTarget = event.relatedTarget as Node | null;
    const container = event.currentTarget as HTMLElement;
    if (!nextFocusTarget || !container.contains(nextFocusTarget)) {
      this.dropdownOpen.set(false);
    }
  }
}
