import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authInitialized$.pipe(
    filter(initialized => initialized), // Wait until initialized
    take(1), // Take the first emitted value after initialization
    map(() => {
      if (authService.isAuthenticated()) {
        return true;
      } else {
        // Redirect to login with return URL
        return router.createUrlTree(['/auth/login'], {
          queryParams: { returnUrl: state.url },
        });
      }
    })
  );
};
