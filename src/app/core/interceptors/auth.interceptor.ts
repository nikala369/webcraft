import { Injectable, Injector } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { environment } from '../../../environments/environment';
import { TokenService } from '../services/auth/token.service';

// List of API paths that don't require authentication
export const PUBLIC_PATHS = [
  '/security/user/login',
  '/security/user/creator',
  '/security/user/request-reset-password',
  '/security/user/reset-password',
  '/security/user/activate',
  '/template/public',
  '/component/catalog',
];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService?: AuthService;
  private tokenService?: TokenService;
  private router?: Router;

  constructor(private injector: Injector) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Lazy-load dependencies to avoid circular dependency issues
    if (!this.authService) {
      this.authService = this.injector.get(AuthService);
    }
    if (!this.tokenService) {
      this.tokenService = this.injector.get(TokenService);
    }
    if (!this.router) {
      this.router = this.injector.get(Router);
    }

    // Only add auth header for API requests and non-public paths
    if (this.shouldAddAuthHeader(request.url)) {
      const token = this.authService.authToken();

      if (token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(`Added auth token to request: ${request.url}`);
      } else {
        console.warn(
          `No token available for authenticated request: ${request.url}`
        );
      }
    } else {
      console.log(`Skipping auth header for public path: ${request.url}`);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.error(`401 Unauthorized for request: ${request.url}`);

          // Don't navigate to login if we're already on a public path
          if (!this.isPublicPath(request.url)) {
            console.log(`Navigating to login due to 401 from: ${request.url}`);
            this.authService!.logout();
            this.router!.navigate(['/auth/login']);
          }
        }
        return throwError(() => error);
      })
    );
  }

  private shouldAddAuthHeader(url: string): boolean {
    const apiUrl = environment.apiUrl;
    const apiPrefix = environment.apiPrefix;
    const fullApiPath = `${apiUrl}${apiPrefix}`;

    // If not an API call, no need for auth header
    if (!url || !url.startsWith(apiUrl)) {
      return false;
    }

    // Extract the path part after the API prefix
    const pathPart = url.substring(apiUrl.length);

    // Check if the path is a public path
    for (const publicPath of PUBLIC_PATHS) {
      if (pathPart.includes(publicPath)) {
        return false;
      }
    }

    return true;
  }

  private isPublicPath(url: string): boolean {
    const apiUrl = environment.apiUrl;
    const apiPrefix = environment.apiPrefix;
    const fullApiPath = `${apiUrl}${apiPrefix}`;

    if (!url || !url.startsWith(apiUrl)) {
      return true; // Non-API URLs are considered public
    }

    const pathPart = url.substring(apiUrl.length);

    // Check if the path is a public path
    for (const publicPath of PUBLIC_PATHS) {
      if (pathPart.includes(publicPath)) {
        return true;
      }
    }

    return false;
  }
}
