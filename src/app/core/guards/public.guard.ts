import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { filter, map, take } from 'rxjs/operators';

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authInitialized$.pipe(
    filter(initialized => initialized), // Wait until initialized
    take(1),
    map(() => {
      if (!authService.isAuthenticated()) {
        return true;
      } else {
        // Redirect to dashboard if authenticated
        return router.createUrlTree(['/app/templates']);
      }
    })
  );
};
