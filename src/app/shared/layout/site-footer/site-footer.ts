import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE, type Site } from '../../site';
import { filterNavEntries, NAV_ROUTES, type NavRouteEntry } from '../route-registry';

/**
 * Site-wide footer. Column-centred (design.md "Closing the four Stitch
 * gaps" — row "Editorial centring"): italic wordmark, then a centred
 * small-caps link row, then NAP, then a centred copyright line, in that
 * order (app-shell spec: "Footer content order and centring"). Renders NAP
 * (Name, Address, Phone) from the single `SITE` constant — never hardcoded
 * per route (app-shell spec: "NAP consistency") — only re-laid-out here,
 * never removed.
 *
 * The link row reuses `filterNavEntries(NAV_ROUTES)` — the same flat
 * projection the header used before this slice — so it already includes
 * every live route, service routes included once they ship (design.md
 * D7's rollback property applies here too, unchanged from `foundation`).
 */
@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
})
export class SiteFooter {
  protected readonly site: Site = SITE;
  protected readonly year = new Date().getFullYear();

  /** Every live nav-eligible route except home — the wordmark already links there. */
  protected readonly links = computed<NavRouteEntry[]>(() =>
    filterNavEntries(NAV_ROUTES).filter((entry) => entry.path !== ''),
  );
}
