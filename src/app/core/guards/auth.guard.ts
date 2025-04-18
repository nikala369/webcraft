import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { filter, map, take } from 'rxjs/operators';
import { SelectionStateService } from '../services/selection/selection-state.service';
import { ConfirmationService } from '../services/shared/confirmation/confirmation.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const selectionStateService = inject(SelectionStateService);
  const confirmationService = inject(ConfirmationService);

  return authService.authInitialized$.pipe(
    filter((initialized) => initialized), // Wait until initialized
    take(1), // Take the first emitted value after initialization
    map(() => {
      if (authService.isAuthenticated()) {
        return true;
      } else {
        // Show a friendly message
        confirmationService.showConfirmation(
          'Please log in to continue',
          'info',
          4000
        );

        // Save selection state if present in query params
        const queryParams = route.queryParams;
        if (queryParams['businessType'] || queryParams['plan']) {
          selectionStateService.saveSelections(
            queryParams['businessType'],
            queryParams['plan'],
            queryParams['templateId']
          );
          console.log('Saved selection state before auth redirect:', {
            businessType: queryParams['businessType'],
            plan: queryParams['plan'],
            templateId: queryParams['templateId'],
          });
        }

        // Redirect to login with return URL
        return router.createUrlTree(['/auth/login'], {
          queryParams: { returnUrl: state.url },
        });
      }
    })
  );
};
