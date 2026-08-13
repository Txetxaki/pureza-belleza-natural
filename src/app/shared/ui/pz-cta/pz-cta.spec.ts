import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { PzCta } from './pz-cta';

// PR3 shipped pz-cta with NO spec file; PR5's real usage on / and /contacto
// (home-page.ts, contact-page.ts) surfaced a real bug: the original template
// had THREE separate <ng-content> elements across nested @if branches, and
// Angular silently dropped the projected content in every rendered branch
// (confirmed empty in the actual `npm run build` prerendered output before
// this fix — not just a test artifact). Root-caused by bisection: a SECOND
// <ng-content>, even one in a branch that never renders, breaks projection
// everywhere. Fixed with a single <ng-template #ctaContent><ng-content />
// </ng-template> rendered via ngTemplateOutlet from whichever branch is
// active — see pz-cta.html's comment for the mechanism.
@Component({
  selector: 'test-host',
  imports: [PzCta],
  template: `
    <pz-cta variant="primary" href="https://wa.me/34633101155" [external]="true"> WhatsApp </pz-cta>
    <pz-cta variant="secondary" href="/contacto">Ir a contacto</pz-cta>
    <pz-cta variant="secondary">Sin destino</pz-cta>
    <pz-cta variant="primary" href="/reservar" [accent]="true">Reservar esta cita</pz-cta>
    <pz-cta variant="secondary" href="/reservar" [accent]="true">Reservar</pz-cta>
  `,
})
class TestHost {}

describe('PzCta — content projection (regression: multiple <ng-content> silently dropped it)', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('projects text content into the external (<a target="_blank">) branch', async () => {
    const el = await render();
    const anchors = el.querySelectorAll('a.pz-cta');
    const external = Array.from(anchors).find((a) =>
      a.getAttribute('href')?.startsWith('https://wa.me'),
    );
    expect(external?.textContent?.trim()).toBe('WhatsApp');
    expect(external?.getAttribute('target')).toBe('_blank');
    expect(external?.getAttribute('rel')).toBe('noopener');
  });

  it('projects text content into the internal (routerLink) branch', async () => {
    const el = await render();
    const anchors = el.querySelectorAll('a.pz-cta');
    const internal = Array.from(anchors).find((a) => a.textContent?.includes('Ir a contacto'));
    expect(internal).toBeTruthy();
    expect(internal?.getAttribute('href')).toBe('/contacto');
    // Internal links never carry target="_blank"/rel="noopener".
    expect(internal?.hasAttribute('target')).toBe(false);
  });

  it('projects text content into the <button> branch when no href is set', async () => {
    const el = await render();
    const button = el.querySelector('button.pz-cta');
    expect(button?.textContent?.trim()).toBe('Sin destino');
  });

  it('applies the secondary variant class only when requested', async () => {
    const el = await render();
    const anchors = Array.from(el.querySelectorAll('a.pz-cta'));
    const secondary = anchors.find((a) => a.textContent?.includes('Ir a contacto'));
    const primary = anchors.find((a) => a.textContent?.includes('WhatsApp'));
    expect(secondary?.className).toContain('pz-cta--secondary');
    expect(primary?.className).not.toContain('pz-cta--secondary');
  });

  it('applies pz-cta--accent (design.md D8) to the filled variant only when accent=true', async () => {
    const el = await render();
    const anchors = Array.from(el.querySelectorAll('a.pz-cta'));
    const accentFilled = anchors.find((a) => a.textContent?.includes('Reservar esta cita'));
    const plainFilled = anchors.find((a) => a.textContent?.includes('Ir a contacto'));

    expect(accentFilled?.className).toContain('pz-cta--accent');
    expect(plainFilled?.className).not.toContain('pz-cta--accent');
  });

  it('applies pz-cta--accent to the outlined (secondary) variant too — one flag covers both', async () => {
    const el = await render();
    const anchors = Array.from(el.querySelectorAll('a.pz-cta'));
    const accentOutlined = anchors.find(
      (a) => a.textContent?.trim() === 'Reservar' && a.className.includes('pz-cta--secondary'),
    );

    expect(accentOutlined?.className).toContain('pz-cta--accent');
    expect(accentOutlined?.className).toContain('pz-cta--secondary');
  });
});
