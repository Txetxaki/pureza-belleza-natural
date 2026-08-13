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
];
