import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { JsonLdPort, MetadataPort } from './seo/domain/ports';
import { AngularMetadataAdapter } from './seo/infrastructure/angular-metadata.adapter';
import { JsonLdAdapter } from './seo/infrastructure/json-ld.adapter';
import { SeoService } from './seo/application/seo.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // `scrollPositionRestoration: 'top'`, not `'enabled'`. `'enabled'` restores
    // the previous scroll offset on backwards navigation, which is correct for
    // a browsing app but wrong here: every route is a standalone editorial page
    // and a forward click that lands mid-page reads as a broken link. `'top'`
    // sends every navigation to the top unconditionally. `anchorScrolling`
    // keeps in-page `#fragment` links (the `/precios` service anchors) working.
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
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
