import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { getRouteSeo } from '../../../seo/domain/route-seo';
import type { ServicePath } from '../../domain/service-index';
import { PzServiceAnchor } from './pz-service-anchor';

@Component({
  selector: 'test-host',
  imports: [PzServiceAnchor],
  template: `<pz-service-anchor [path]="path" />`,
})
class TestHost {
  path!: ServicePath;
}

async function render(path: ServicePath) {
  await TestBed.configureTestingModule({
    imports: [TestHost],
    providers: [provideRouter([])],
  }).compileComponents();
  const fixture = TestBed.createComponent(TestHost);
  fixture.componentInstance.path = path;
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return (fixture.nativeElement as HTMLElement).querySelector('a');
}

describe('PzServiceAnchor (diario spec, "Anchor text matches target keyword")', () => {
  it('renders the exact-match primaryKeyword as the anchor text, verbatim', async () => {
    const anchor = await render('coloracion-vegetal-aveda');
    expect(anchor?.textContent).toBe(getRouteSeo('coloracion-vegetal-aveda')?.primaryKeyword);
    expect(anchor?.getAttribute('href')).toBe('/coloracion-vegetal-aveda');
  });

  it('never hand-retypes the keyword — same value for a different path too', async () => {
    const anchor = await render('rastas');
    expect(anchor?.textContent).toBe('rastas Ciudad Real');
    expect(anchor?.getAttribute('href')).toBe('/rastas');
  });
});
