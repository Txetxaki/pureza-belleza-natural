import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { JsonLdPort, MetadataPort } from './seo/domain/ports';
import { AngularMetadataAdapter } from './seo/infrastructure/angular-metadata.adapter';
import { JsonLdAdapter } from './seo/infrastructure/json-ld.adapter';
import { SeoService } from './seo/application/seo.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    { provide: MetadataPort, useClass: AngularMetadataAdapter },
    { provide: JsonLdPort, useClass: JsonLdAdapter },
    // Forces SeoService's singleton to construct eagerly so its NavigationEnd
    // subscription (seo/application/seo.service.ts) is live before the first
    // route resolves — see design.md §4. This is SEO metadata application,
    // not analytics: the deferred Umami NavigationEnd hook (out of scope for
    // `foundation`) is a separate, not-yet-added concern.
    provideAppInitializer(() => {
      inject(SeoService);
    }),
  ],
};
