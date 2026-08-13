import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import type { Planta } from '../../../seo/domain/route-seo';
import { PzSpecimen } from './pz-specimen';

const PLANTAS: readonly Planta[] = ['romero', 'espliego', 'esparto', 'vid', 'olivo'];

@Component({
  selector: 'test-host',
  imports: [PzSpecimen],
  template: `<pz-specimen [planta]="planta" />`,
})
class TestHost {
  planta!: Planta;
}

describe('PzSpecimen', () => {
  it.each(PLANTAS)('renders exactly one aria-hidden <svg> for planta="%s"', async (planta) => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.planta = planta;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const svgs = el.querySelectorAll('svg');

    expect(svgs).toHaveLength(1);
    expect(svgs[0].getAttribute('aria-hidden')).toBe('true');
    expect(svgs[0].getAttribute('stroke')).toBe('currentColor');
  });
});
