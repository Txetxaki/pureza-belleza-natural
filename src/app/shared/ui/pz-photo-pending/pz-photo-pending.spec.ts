import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { PzPhotoPending } from './pz-photo-pending';

@Component({
  selector: 'test-host',
  imports: [PzPhotoPending],
  template: `
    <pz-photo-pending
      [base]="base"
      alt="Resultado de coloración vegetal, planta romero"
      [width]="1200"
      [height]="800"
    />
  `,
})
class TestHost {
  base = 'resultado-romero';
}

describe('PzPhotoPending (service-pages spec: "No fabricated hair photography", "Placeholder reads as pending, not broken"; salon-page spec: "One honest placeholder")', () => {
  async function render(base: string) {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.base = base;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the honest "Foto pendiente de la sesión" label — no <picture>/<img> at all — when base is absent from available-photos.generated.ts', async () => {
    // "resultado-romero" is the stable placeholder-photo filename convention
    // documented in design.md ("Stable placeholder filenames") — not present
    // in public/images/ yet, so this must render the pending label, never a
    // broken-image state and never a fabricated result.
    const el = await render('resultado-romero');

    expect(el.querySelector('picture')).toBeNull();
    expect(el.querySelector('img')).toBeNull();
    const placeholder = el.querySelector('.pz-photo-pending');
    expect(placeholder).toBeTruthy();
    expect(placeholder?.textContent?.trim().toLowerCase()).toBe('foto pendiente de la sesión');
  });

  it('carries the correct final aspect-ratio on the placeholder so layout is already right', async () => {
    const el = await render('resultado-romero');
    const placeholder = el.querySelector<HTMLElement>('.pz-photo-pending');

    expect(placeholder?.style.aspectRatio).toBe('1200 / 800');
  });

  it('exposes an accessible label naming both the subject and the pending state, not a broken/blank image', async () => {
    const el = await render('resultado-romero');
    const placeholder = el.querySelector('.pz-photo-pending');

    expect(placeholder?.getAttribute('role')).toBe('img');
    expect(placeholder?.getAttribute('aria-label')).toBe(
      'Resultado de coloración vegetal, planta romero — foto pendiente de la sesión',
    );
  });

  it('renders the real pz-picture (a genuine <picture>) once base is present in available-photos.generated.ts — a pure file-drop swap, zero template change', async () => {
    const el = await render('atmosfera-romero');

    expect(el.querySelector('.pz-photo-pending')).toBeNull();
    expect(el.querySelector('picture.pz-picture')).toBeTruthy();
  });
});
