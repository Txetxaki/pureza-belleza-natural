import { Routes } from '@angular/router';
import { seoRouteData } from './seo/domain/route-seo';
import { HomePage } from './salon/home/home-page';
import { ContactPage } from './contact/contact-page';

// SEO wiring (design.md §4/§7, PR4's documented pattern, landed here in PR5):
// `seoRouteData(path)` spreads the matching `route-seo.registry.json` entry
// into `route.data.seo`, which `SeoService` reads on every `NavigationEnd`
// (app.config.ts) — so a route can't ship without metadata.
export const routes: Routes = [
  { path: '', component: HomePage, data: seoRouteData('') },
  { path: 'contacto', component: ContactPage, data: seoRouteData('contacto') },
];
