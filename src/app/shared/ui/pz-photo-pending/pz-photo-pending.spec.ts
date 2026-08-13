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
  // A base that will never exist on disk — every real slot now ships a
  // photo, so the fallback branch needs a synthetic name to be testable.
  base = 'slot-sin-foto';
}

describe('PzPhotoPending (service-pages spec: "No fabricated hair photography"; salon-page spec: "One honest placeholder")', () => {
  async function render(base: string) {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.base = base;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders a silent frame — never a fabricated result, and never a line of copy telling the visitor the site is unfinished', async () => {
    const el = await render('slot-sin-foto');

    expect(el.querySelector('picture')).toBeNull();
    expect(el.querySelector('img')).toBeNull();
    const placeholder = el.querySelector('.pz-photo-pending');
    expect(placeholder).toBeTruthy();
    expect(placeholder?.textContent?.trim()).toBe('');
  });

  it('carries the correct final aspect-ratio on the placeholder so layout is already right', async () => {
    const el = await render('slot-sin-foto');
    const placeholder = el.querySelector<HTMLElement>('.pz-photo-pending');

    expect(placeholder?.style.aspectRatio).toBe('1200 / 800');
  });

  it('stays out of the accessibility tree — announcing an empty frame is noise, not information', async () => {
    const el = await render('slot-sin-foto');
    const placeholder = el.querySelector('.pz-photo-pending');

    expect(placeholder?.getAttribute('aria-hidden')).toBe('true');
    expect(placeholder?.hasAttribute('role')).toBe(false);
    expect(placeholder?.hasAttribute('aria-label')).toBe(false);
  });

  it('renders the real pz-picture (a genuine <picture>) once base is present in available-photos.generated.ts — a pure file-drop swap, zero template change', async () => {
    const el = await render('atmosfera-romero');

    expect(el.querySelector('.pz-photo-pending')).toBeNull();
    expect(el.querySelector('picture.pz-picture')).toBeTruthy();
  });
});
