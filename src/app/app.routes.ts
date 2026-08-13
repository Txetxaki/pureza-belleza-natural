import { Routes } from '@angular/router';
import { seoRouteData } from './seo/domain/route-seo';
import { HomePage } from './salon/home/home-page';
import { ContactPage } from './contact/contact-page';
import { ColoracionVegetalAvedaPage } from './services/coloracion-vegetal-aveda/coloracion-vegetal-aveda-page';
import { MechasBabylightsBalayagePage } from './services/mechas-babylights-balayage/mechas-babylights-balayage-page';
import { RastasPage } from './services/rastas/rastas-page';
import { ExtensionesCabelloNaturalPage } from './services/extensiones-cabello-natural/extensiones-cabello-natural-page';
import { TratamientosCapilaresPage } from './services/tratamientos-capilares/tratamientos-capilares-page';
import { VirginiaPage } from './salon/virginia/virginia-page';
import { ElSalonPage } from './salon/el-salon/el-salon-page';
import { PreciosPage } from './salon/precios/precios-page';
import { ReservarPage } from './booking/reservar/reservar-page';

// SEO wiring (design.md §4/§7, PR4's documented pattern, landed here in PR5):
// `seoRouteData(path)` spreads the matching `route-seo.registry.json` entry
// into `route.data.seo`, which `SeoService` reads on every `NavigationEnd`
// (app.config.ts) — so a route can't ship without metadata.
export const routes: Routes = [
  { path: '', component: HomePage, data: seoRouteData('') },
  { path: 'contacto', component: ContactPage, data: seoRouteData('contacto') },
  {
    path: 'coloracion-vegetal-aveda',
    component: ColoracionVegetalAvedaPage,
    data: seoRouteData('coloracion-vegetal-aveda'),
  },
  {
    path: 'mechas-babylights-balayage',
    component: MechasBabylightsBalayagePage,
    data: seoRouteData('mechas-babylights-balayage'),
  },
  {
    path: 'rastas',
    component: RastasPage,
    data: seoRouteData('rastas'),
  },
  {
    path: 'extensiones-cabello-natural',
    component: ExtensionesCabelloNaturalPage,
    data: seoRouteData('extensiones-cabello-natural'),
  },
  {
    path: 'tratamientos-capilares',
    component: TratamientosCapilaresPage,
    data: seoRouteData('tratamientos-capilares'),
  },
  {
    path: 'virginia',
    component: VirginiaPage,
    data: seoRouteData('virginia'),
  },
  {
    path: 'el-salon',
    component: ElSalonPage,
    data: seoRouteData('el-salon'),
  },
  {
    path: 'precios',
    component: PreciosPage,
    data: seoRouteData('precios'),
  },
  {
    path: 'reservar',
    component: ReservarPage,
    data: seoRouteData('reservar'),
  },
];
