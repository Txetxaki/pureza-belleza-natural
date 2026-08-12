import { Routes } from '@angular/router';

// SEO wiring pattern for PR5 (home + contact routes, design.md §4/§7):
//
//   import { seoRouteData } from './seo/domain/route-seo';
//   import { HomePage } from './salon/home/home-page';
//   import { ContactPage } from './contact/contact-page';
//
//   export const routes: Routes = [
//     { path: '', component: HomePage, data: seoRouteData('') },
//     { path: 'contacto', component: ContactPage, data: seoRouteData('contacto') },
//   ];
//
// `seoRouteData(path)` spreads the matching `route-seo.registry.json` entry
// into `route.data.seo`, which `SeoService` reads on every `NavigationEnd`
// (app.config.ts) — so a route can't ship without metadata (design.md §4).
//
// PR4 (this change) ships the registry + `seoRouteData` helper only. The
// route components above (`home-page.ts`, `contact-page.ts`) don't exist yet
// — they're Phase 6/7, deferred to PR5 per PR1's original scaffold note.
// Adding route entries referencing nonexistent components here would break
// `npm run build`, so the array stays empty until PR5 lands them.
export const routes: Routes = [];
