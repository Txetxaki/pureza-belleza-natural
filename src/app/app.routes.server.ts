import { RenderMode, ServerRoute } from '@angular/ssr';
import { POST_SLUGS } from './diario/domain/post-manifest';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'contacto',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'coloracion-vegetal-aveda',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'mechas-babylights-balayage',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'rastas',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'extensiones-cabello-natural',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'tratamientos-capilares',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'virginia',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'el-salon',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'precios',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'reservar',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'diario',
    renderMode: RenderMode.Prerender,
  },
  {
    // Fed from the post manifest (design.md Data Flow) — every launch
    // article gets its own static HTML, verified present in the installed
    // @angular/ssr 22.1.3 (Engram #2311; app-shell spec, "Diario slugs
    // prerendered via getPrerenderParams").
    path: 'diario/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return POST_SLUGS.map((slug) => ({ slug }));
    },
  },
];
