import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { JsonLdPort } from '../domain/ports';

/**
 * `JsonLdPort` implementation. `upsert` queries `script[data-pz-schema="id"]`
 * first and reuses that node if found, so a client-side re-navigation (or
 * hydration re-applying the same schema on an already-prerendered page) never
 * produces a second `<script>` tag for the same id (design.md risk C).
 */
@Injectable({ providedIn: 'root' })
export class JsonLdAdapter implements JsonLdPort {
  private readonly document = inject(DOCUMENT);

  upsert(id: string, schema: Record<string, unknown>): void {
    const selector = `script[data-pz-schema="${id}"]`;
    let script = this.document.head.querySelector<HTMLScriptElement>(selector);
    if (!script) {
      script = this.document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-pz-schema', id);
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  }

  /** No-op if the node doesn't exist — safe to call defensively on every route. */
  remove(id: string): void {
    const script = this.document.head.querySelector(`script[data-pz-schema="${id}"]`);
    script?.remove();
  }
}
