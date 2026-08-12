import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { filterNavEntries, NAV_ROUTES, type NavRouteEntry } from '../route-registry';

/**
 * Site-wide header. Navigation is entirely data-driven — see
 * `../route-registry.ts`. When `content` (or PR4's real registry) flips more
 * entries `live`, this component needs zero edits: the `@for` below already
 * renders whatever `filterNavEntries` returns.
 */
@Component({
  selector: 'app-site-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './site-header.html',
  styleUrl: './site-header.scss',
})
export class SiteHeader {
  private readonly navEntries = computed<NavRouteEntry[]>(() => filterNavEntries(NAV_ROUTES));

  protected readonly brand = computed<NavRouteEntry | undefined>(() =>
    this.navEntries().find((entry) => entry.path === ''),
  );

  protected readonly links = computed<NavRouteEntry[]>(() =>
    this.navEntries().filter((entry) => entry.path !== ''),
  );
}
