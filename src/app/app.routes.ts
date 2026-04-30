import { Routes } from '@angular/router';
import { Layout } from './features/layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home-page/home-page').then((m) => m.HomePage),
      },
      {
        path: 'about',
        loadComponent: () => import('./features/about-page/about-page').then((m) => m.AboutPage),
      },
    ],
  },
];
