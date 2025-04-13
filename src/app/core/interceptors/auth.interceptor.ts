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

const PUBLIC_PATHS = [
  '/security/user/login',
  '/security/user/creator',
  '/security/user/activate',
  '/security/user/request-reset-password',
  '/security/user/reset-password',
  '/security/user/resendActivationCode',
];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService: AuthService | null = null;
  private router: Router | null = null;

  constructor(private injector: Injector) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Lazy load services when needed
    if (!this.authService) {
      this.authService = this.injector.get(AuthService);
    }
    if (!this.router) {
      this.router = this.injector.get(Router);
    }

    if (this.shouldAddAuthHeader(req.url)) {
      const token = this.authService!.authToken();
      if (token) {
        req = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
      }
    }
    return next.handle(req).pipe(
      catchError((error) => this.handleAuthError(error))
    );
  }

  private shouldAddAuthHeader(url: string): boolean {
    const apiUrl = environment.apiUrl;
    const apiPrefix = environment.apiPrefix;
    const fullApiPath = apiUrl + apiPrefix;
    if (!url || !url.startsWith(fullApiPath)) {
      return false;
    }
    const pathPart = url.substring(fullApiPath.length);
    return !PUBLIC_PATHS.some(publicPath => pathPart.startsWith(publicPath));
  }

  private handleAuthError(error: HttpErrorResponse) {
    if (error.status === 401 && this.authService && this.router) {
      console.warn('Received 401 Unauthorized response. Logging out.');
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }
    return throwError(() => error);
  }
}
