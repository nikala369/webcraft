import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { PreviewComponent } from './pages/preview/preview.component';
import { authGuard } from './core/guards/auth.guard';
import { AUTH_ROUTES } from './modules/auth/auth.routes';
import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// Create template redirect components
@Component({
  template: '',
  standalone: true,
})
class NewTemplateRedirectComponent {
  private router = inject(Router);

  constructor() {
    this.router.navigate(['/preview'], { queryParams: { newTemplate: true } });
  }
}

@Component({
  template: '',
  standalone: true,
})
class EditTemplateRedirectComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.router.navigate(['/preview'], {
          queryParams: { templateId: id, mode: 'edit' },
        });
      }
    });
  }
}

@Component({
  template: '',
  standalone: true,
})
class ViewTemplateRedirectComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.router.navigate(['/preview'], {
          queryParams: { templateId: id, mode: 'view' },
        });
      }
    });
  }
}

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
  // App routes - protected by Auth Guard
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './modules/dashboard/components/dashboard-layout/dashboard-layout.component'
      ).then((m) => m.DashboardLayoutComponent),
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
          import('./modules/dashboard/components/builds/builds.component').then(
            (m) => m.BuildsComponent
          ),
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
  // Auth module for authentication flow
  {
    path: 'auth',
    children: AUTH_ROUTES,
  },
  {
    path: 'subscription-selection',
    loadComponent: () =>
      import(
        './pages/subscription/subscription-selection/subscription-selection.component'
      ).then((m) => m.SubscriptionSelectionComponent),
  },
  {
    path: 'subscription/success',
    loadComponent: () =>
      import(
        './pages/subscription/subscription-success/subscription-success.component'
      ).then((m) => m.SubscriptionSuccessComponent),
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
