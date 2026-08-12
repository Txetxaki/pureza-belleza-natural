import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  MetadataPort,
  type OpenGraphProps,
  type TwitterCardProps,
} from '../domain/ports';

/**
 * `MetadataPort` implementation backed by Angular's `Title`/`Meta` services
 * plus `DOCUMENT` for the canonical `<link>` (Angular has no built-in service
 * for that tag). `Title.setTitle` and `Meta.updateTag` both replace an
 * existing value in place; the canonical link is queried and updated the same
 * way — no setter here ever appends a second node (design.md risk C).
 */
@Injectable({ providedIn: 'root' })
export class AngularMetadataAdapter implements MetadataPort {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  setTitle(title: string): void {
    this.title.setTitle(title);
  }

  setDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description });
  }

  setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  setOpenGraph(props: OpenGraphProps): void {
    this.meta.updateTag({ property: 'og:title', content: props.title });
    this.meta.updateTag({ property: 'og:description', content: props.description });
    this.meta.updateTag({ property: 'og:url', content: props.url });
    this.meta.updateTag({ property: 'og:type', content: props.type ?? 'website' });
  }

  setTwitterCard(props: TwitterCardProps): void {
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: props.title });
    this.meta.updateTag({ name: 'twitter:description', content: props.description });
  }
}
