import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { buildGoogleMapsEmbedUrl, buildGoogleMapsSearchUrl, PzStaticMap } from './pz-static-map';

const ADDRESS = 'Calle Pozo Dulce, 1, 13001 Ciudad Real';

describe('buildGoogleMapsSearchUrl', () => {
  it('builds a query-only Maps search URL, address encoded', () => {
    const url = buildGoogleMapsSearchUrl(ADDRESS);
    expect(url).toBe(
      'https://www.google.com/maps/search/?api=1&query=Calle%20Pozo%20Dulce%2C%201%2C%2013001%20Ciudad%20Real',
    );
  });
});

describe('buildGoogleMapsEmbedUrl', () => {
  it('builds a key-less embed URL, address encoded', () => {
    const url = buildGoogleMapsEmbedUrl(ADDRESS);
    expect(url).toContain('output=embed');
    expect(url).toContain(encodeURIComponent(ADDRESS));
  });
});

@Component({
  selector: 'test-host',
  imports: [PzStaticMap],
  template: `<pz-static-map [address]="address" [hasStaticMap]="hasStaticMap" />`,
})
class TestHost {
  address = ADDRESS;
  hasStaticMap = false;
}

describe('PzStaticMap', () => {
  it('falls back to a plain "Cómo llegar" link when the static asset is unavailable (task 4.8 is blocked today)', async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.hasStaticMap = false;
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector('.pz-static-map__fallback');

    expect(link?.textContent?.trim()).toBe('Cómo llegar');
    expect(el.querySelector('.pz-static-map__button')).toBeNull();
    expect(el.querySelector('.pz-static-map__iframe')).toBeNull();
  });

  it('renders the click-to-load button (no eager iframe) when the static asset is available', async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.hasStaticMap = true;
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.pz-static-map__button')).toBeTruthy();
    expect(el.querySelector('.pz-static-map__iframe')).toBeNull();
    expect(el.querySelector('.pz-static-map__fallback')).toBeNull();
  });

  it('swaps the button for a live iframe on click', async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.hasStaticMap = true;
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const button = el.querySelector<HTMLButtonElement>('.pz-static-map__button');
    button?.click();
    fixture.detectChanges();

    expect(el.querySelector('.pz-static-map__iframe')).toBeTruthy();
    expect(el.querySelector('.pz-static-map__button')).toBeNull();
  });
});
