import { Routes } from '@angular/router';
import { publicGuard } from '../../core/guards/public.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent
      ),
    canActivate: [publicGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    canActivate: [publicGuard],
  },
  {
    path: 'activate',
    loadComponent: () =>
      import('./components/activate/activate.component').then(
        (m) => m.ActivateComponent
      ),
  },
  {
    path: 'resend-activation',
    loadComponent: () =>
      import('./components/activation-resend/activation-resend.component').then(
        (m) => m.ActivationResendComponent
      ),
    canActivate: [publicGuard],
  },
  {
    path: 'password-reset',
    loadComponent: () =>
      import(
        './components/password-reset/password-reset-request.component'
      ).then((m) => m.PasswordResetRequestComponent),
    canActivate: [publicGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import(
        './components/password-reset/password-reset-confirm.component'
      ).then((m) => m.PasswordResetConfirmComponent),
    canActivate: [publicGuard],
  },
  {
    path: 'change-email-request',
    loadComponent: () =>
      import('./components/change-email/change-email-request.component').then(
        (m) => m.ChangeEmailRequestComponent
      ),
  },
  {
    path: 'change-email-confirm',
    loadComponent: () =>
      import('./components/change-email/change-email-confirm.component').then(
        (m) => m.ChangeEmailConfirmComponent
      ),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
