import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { POSTS_MANIFEST } from '../../../diario/domain/post-manifest';
import { SITE, type Site } from '../../site';
import { summarizeOpeningHours, type HoursSummaryRow } from '../../../seo/domain/site';
import { PzWordmark } from '../../ui/pz-wordmark/pz-wordmark';
import { buildDiarioNav, filterNavEntries, NAV_ROUTES, type NavRouteEntry } from '../route-registry';

/**
 * Site-wide footer, on the deeper sand ground and capped at `--pz-wrap` like
 * the header. Centred column (app-shell spec: "Footer content order and
 * centring"): the watercolour logo, then three short columns (where, hours,
 * Instagram + Google rating + booking), then the small-caps link row, the
 * articles and the copyright line, in that order. Renders NAP
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
  imports: [RouterLink, PzWordmark],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.scss',
})
export class SiteFooter {
  protected readonly site: Site = SITE;
  protected readonly year = new Date().getFullYear();
  /** Google Business hours, one row per distinct schedule — fits a footer column. */
  protected readonly hours: readonly HoursSummaryRow[] = summarizeOpeningHours(SITE.openingHours);

  /** Every live nav-eligible route except home — the wordmark already links there. */
  protected readonly links = computed<NavRouteEntry[]>(() =>
    filterNavEntries(NAV_ROUTES).filter((entry) => entry.path !== ''),
  );

  /**
   * The three articles, in their own row beneath the route links. Articles are
   * not registry rows, so `filterNavEntries` above can never reach them — yet
   * they are exactly the pages that most need a scriptless path, being two
   * levels deep. This row is what makes the header's `Diario` disclosure a
   * true enhancement rather than the only way in.
   */
  protected readonly articles: readonly NavRouteEntry[] = buildDiarioNav(POSTS_MANIFEST);
}
