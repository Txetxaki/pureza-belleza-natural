import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { PzPlate } from './pz-plate';

// `price`/`href` (design.md "Closing the four Stitch gaps" — row "Carta
// price column", Slice 7) are BOTH optional — this spec proves the existing
// no-price/no-href shape keeps rendering unchanged (no dangling empty <a>,
// no stray price text) AND that supplying both wires a single stretched link
// plus a right-aligned price string, never a raw number.
describe('PzPlate', () => {
  async function render(overrides: { price?: string; href?: string } = {}) {
    await TestBed.configureTestingModule({
      imports: [PzPlate],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(PzPlate);
    // `specimen`/`photo` render via `ngTemplateOutlet`, which is a no-op for
    // a null value — this spec exercises `price`/`href`, not the required
    // TemplateRef contract (covered by the component's usage in home-page).
    fixture.componentRef.setInput('specimen', null);
    fixture.componentRef.setInput('photo', null);
    fixture.componentRef.setInput('title', 'Coloración vegetal');
    if (overrides.price !== undefined) {
      fixture.componentRef.setInput('price', overrides.price);
    }
    if (overrides.href !== undefined) {
      fixture.componentRef.setInput('href', overrides.href);
    }
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders no price and no link when both inputs are omitted (existing usage unaffected)', async () => {
    const el = await render();

    expect(el.querySelector('.pz-plate__price')).toBeNull();
    expect(el.querySelector('.pz-plate__link')).toBeNull();
    expect(el.querySelector('.pz-plate__title')?.textContent?.trim()).toBe('Coloración vegetal');
  });

  it('renders the pre-formatted price string verbatim, never a number computation', async () => {
    const el = await render({ price: 'Consultar' });

    expect(el.querySelector('.pz-plate__price')?.textContent?.trim()).toBe('Consultar');
  });

  it('wraps the title in a single stretched link when href is set', async () => {
    const el = await render({ href: '/coloracion-vegetal-aveda' });

    const links = el.querySelectorAll('a.pz-plate__link');
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe('/coloracion-vegetal-aveda');
    expect(links[0].textContent?.trim()).toBe('Coloración vegetal');
  });
});
