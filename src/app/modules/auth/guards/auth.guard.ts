import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

/**
 * Guard to protect routes that require authentication
 * Uses functional approach compatible with Angular's latest router
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Use () notation to read the signal value
  if (authService.isAuthenticated()) {
    return true;
  }

  // If not authenticated, redirect to login
  router.navigate(['/auth/login'], {
    // Store the attempted URL for redirecting after login
    queryParams: { returnUrl: state.url },
  });

  return false;
};

/**
 * Guard to protect routes that should NOT be accessible when authenticated
 * (like login and register pages)
 */
export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Use () notation to read the signal value
  if (!authService.isAuthenticated()) {
    return true;
  }

  // If authenticated, redirect to home or dashboard
  router.navigate(['/dashboard']);
  return false;
};
