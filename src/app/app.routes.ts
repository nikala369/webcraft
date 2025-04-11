import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { PreviewComponent } from './pages/preview/preview.component';
import { authGuard } from './core/guards/auth.guard';
import { AUTH_ROUTES } from './modules/auth/auth.routes';

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
      // App routes - protected by Auth Guard
      {
        path: 'app',
        canActivate: [authGuard],
        children: [
          {
            path: 'templates',
            loadComponent: () =>
              import(
                './modules/dashboard/components/templates/templates.component'
              ).then((m) => m.TemplatesComponent),
          },
          {
            path: 'builds',
            loadComponent: () =>
              import(
                './modules/dashboard/components/builds/builds.component'
              ).then((m) => m.BuildsComponent),
          },
          {
            path: 'domains',
            loadComponent: () =>
              import(
                './modules/dashboard/components/domains/domains.component'
              ).then((m) => m.DomainsComponent),
          },
          {
            path: 'settings',
            loadComponent: () =>
              import(
                './modules/dashboard/components/settings/settings.component'
              ).then((m) => m.SettingsComponent),
          },
          { path: '', redirectTo: 'templates', pathMatch: 'full' },
        ],
      },
      {
        path: 'activate',
        loadComponent: () =>
          import('./modules/auth/components/activate/activate.component').then(
            (m) => m.ActivateComponent
          ),
      },
    ],
  },
  // Auth module for authentication flow
  {
    path: 'auth',
    children: AUTH_ROUTES,
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
