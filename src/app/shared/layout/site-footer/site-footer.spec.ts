import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { SITE } from '../../site';
import { SiteFooter } from './site-footer';

describe('SiteFooter', () => {
  it('renders name, address, and phone from the single SITE constant', async () => {
    await TestBed.configureTestingModule({ imports: [SiteFooter] }).compileComponents();
    const fixture = TestBed.createComponent(SiteFooter);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain(SITE.name);
    expect(el.textContent).toContain(SITE.streetAddress);
    expect(el.textContent).toContain(SITE.addressLocality);
    expect(el.textContent).toContain(SITE.telephoneDisplay);

    const phoneLink = el.querySelector('.site-footer__phone');
    expect(phoneLink?.getAttribute('href')).toBe(`tel:${SITE.telephone}`);
  });
});
