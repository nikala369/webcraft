import { inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../../environments/environment';

// List of API paths that should NOT receive the Authorization header
const PUBLIC_PATHS = [
  '/security/user/login',
  '/security/user/creator',
  '/security/user/activate',
  '/security/user/request-reset-password',
  '/security/user/reset-password',
  '/security/user/resendActivationCode',
];

/**
 * Functional interceptor that adds JWT token to API requests
 * and handles unauthorized (401) responses.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if this is an API request that needs authorization
  if (shouldAddAuthHeader(req.url)) {
    const token = authService.authToken();

    if (token) {
      // Clone the request and add the Authorization header
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Forward the cloned request with the token
      return next(authReq).pipe(
        catchError((error) => handleAuthError(error, authService, router))
      );
    }
  }

  // If no token or public path, proceed with original request
  return next(req).pipe(
    catchError((error) => handleAuthError(error, authService, router))
  );
};

/**
 * Determines whether an Authorization header should be added to a request
 * @param url - The request URL
 * @returns True if we should add auth header, false otherwise
 */
function shouldAddAuthHeader(url: string): boolean {
  // Get the API URL and prefix from environment
  const apiUrl = environment.apiUrl;
  const apiPrefix = environment.apiPrefix;
  const fullApiPath = apiUrl + apiPrefix;

  // Only add auth header to API requests
  if (!url || !url.startsWith(fullApiPath)) {
    return false;
  }

  // Extract the path part after the API prefix for comparison
  const pathPart = url.substring(fullApiPath.length);

  // Don't add auth header to public paths
  return !PUBLIC_PATHS.some((publicPath) => pathPart.startsWith(publicPath));
}

/**
 * Handles authentication errors (401 Unauthorized)
 * @param error - The HTTP error
 * @param authService - The auth service
 * @param router - The router
 * @returns An observable that throws the error
 */
function handleAuthError(error: any, authService: AuthService, router: Router) {
  if (error instanceof HttpErrorResponse && error.status === 401) {
    console.warn('Received 401 Unauthorized response. Logging out.');

    // Log out the user
    authService.logout();
  }

  // Re-throw the error for the calling service to handle
  return throwError(() => error);
}
