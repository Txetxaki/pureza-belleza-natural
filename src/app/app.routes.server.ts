import { RenderMode, ServerRoute } from '@angular/ssr';

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
];
