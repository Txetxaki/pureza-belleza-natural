import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { SITE } from '../../site';
import { POSTS_MANIFEST } from '../../../diario/domain/post-manifest';
import { NAV_ROUTES, filterNavEntries } from '../route-registry';
import { SiteFooter } from './site-footer';

describe('SiteFooter', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [SiteFooter],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(SiteFooter);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  // Regression guard (app-shell spec: "NAP consistency") — unchanged
  // assertions, only the render() helper above now provides a Router so the
  // new wordmark/link-row RouterLink bindings can resolve.
  it('renders name, address, and phone from the single SITE constant', async () => {
    const el = await render();

    expect(el.textContent).toContain(SITE.name);
    expect(el.textContent).toContain(SITE.streetAddress);
    expect(el.textContent).toContain(SITE.addressLocality);
    expect(el.textContent).toContain(SITE.telephoneDisplay);

    const phoneLink = el.querySelector('.site-footer__phone');
    expect(phoneLink?.getAttribute('href')).toBe(`tel:${SITE.telephone}`);
  });

  it('renders the wordmark, link row, and copyright line, in that order, each a direct centred child (app-shell spec: "Footer content order and centring")', async () => {
    const el = await render();

    const brand = el.querySelector('.site-footer__brand');
    const nav = el.querySelector('.site-footer__nav');
    const legal = el.querySelector('.site-footer__legal');

    // Two-line lockup: assert the accessible name, not concatenated text.
    expect(brand?.getAttribute('aria-label')).toBe('Pureza Belleza Natural');
    expect(brand?.textContent).toContain('Belleza Natural');
    expect(legal?.textContent).toContain(SITE.name);

    // DOCUMENT_POSITION_FOLLOWING (4) — brand precedes nav precedes legal.
    expect(brand?.compareDocumentPosition(nav!) ?? 0).toBeGreaterThanOrEqual(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(nav?.compareDocumentPosition(legal!) ?? 0).toBeGreaterThanOrEqual(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );

    // Centring is asserted structurally, not via computed style (jsdom does
    // not lay out CSS): `.site-footer` itself is `align-items: center;
    // text-align: center` (site-footer.scss) and every listed element is a
    // direct child of it, not nested inside an off-centre wrapper.
    const footer = el.querySelector('.site-footer');
    expect(brand?.parentElement).toBe(footer);
    expect(nav?.parentElement).toBe(footer);
    expect(legal?.parentElement).toBe(footer);
  });

  it("the link row is today's real live NAV_ROUTES minus home — grows automatically as more routes flip live, service routes included (D7 rollback property, unchanged from foundation)", async () => {
    const el = await render();
    const linkHrefs = Array.from(el.querySelectorAll('.site-footer__link')).map((a) =>
      a.getAttribute('href'),
    );
    const expected = filterNavEntries(NAV_ROUTES)
      .filter((entry) => entry.path !== '')
      .map((entry) => `/${entry.path}`);

    expect(linkHrefs).toEqual(expected);
  });

  it('carries every article too — the deepest pages on the site, and the ones the header can only reach through a scripted disclosure', async () => {
    const el = await render();
    const hrefs = Array.from(el.querySelectorAll('.site-footer__article-link')).map((a) =>
      a.getAttribute('href'),
    );

    expect(hrefs).toEqual(POSTS_MANIFEST.map((post) => `/diario/${post.slug}`));
  });

  it('leaves nothing unreachable: every prerendered route has a footer link', async () => {
    const el = await render();
    const hrefs = new Set(
      Array.from(el.querySelectorAll<HTMLAnchorElement>('a[href]')).map((a) =>
        a.getAttribute('href'),
      ),
    );

    const everyRoute = [
      '/',
      ...filterNavEntries(NAV_ROUTES)
        .filter((entry) => entry.path !== '')
        .map((entry) => `/${entry.path}`),
      ...POSTS_MANIFEST.map((post) => `/diario/${post.slug}`),
    ];

    expect(everyRoute.filter((route) => !hrefs.has(route))).toEqual([]);
  });
});
