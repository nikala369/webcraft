import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { PreviewComponent } from './pages/preview/preview.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'business-type',
        loadComponent: () =>
          import('./pages/business-type/business-type.component').then(
            (m) => m.BusinessTypeComponent
          ),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/about/about.component').then((m) => m.AboutComponent),
      },
      {
        path: 'learn-more',
        loadComponent: () =>
          import('./pages/learn-more/learn-more.component').then(
            (m) => m.LearnMoreComponent
          ),
      },
      {
        path: 'pricing',
        loadComponent: () =>
          import('./pages/pricing/pricing.component').then(
            (m) => m.PricingComponent
          ),
      },
      {
        path: 'preview',
        loadComponent: () =>
          import('./pages/preview/preview.component').then(
            (m) => m.PreviewComponent
          ),
        children: [
          {
            path: 'home',
            component: PreviewComponent,
            data: { page: 'home' },
          },
          {
            path: 'about',
            component: PreviewComponent,
            data: { page: 'about' },
          },
          {
            path: 'contact',
            component: PreviewComponent,
            data: { page: 'contact' },
          },
          {
            path: '',
            redirectTo: 'home',
            pathMatch: 'full',
          },
        ],
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./pages/contact/contact.component').then(
            (m) => m.ContactComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
