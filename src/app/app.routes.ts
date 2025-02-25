import { Routes } from '@angular/router';
import {MainLayoutComponent} from "./layout/main-layout/main-layout.component";

export const appRoutes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
      { path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
      { path: 'learn-more', loadComponent: () => import('./pages/learn-more/learn-more.component').then(m => m.LearnMoreComponent) },
      { path: 'pricing', loadComponent: () => import('./pages/pricing/pricing.component').then(m => m.PricingComponent) },
      { path: 'preview', loadComponent: () => import('./pages/preview/preview.component').then(m => m.PreviewComponent) },
      { path: 'contact', loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
