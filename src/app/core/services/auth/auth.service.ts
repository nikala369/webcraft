import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';

import { TokenService } from './token.service';
import { environment } from '../../../../environments/environment';
import {
  AuthUser,
  AuthResponse,
  RegisterResponse,
  RegisterRequest,
  UserRole,
  UserStatus,
  PasswordResetRequest,
  PasswordResetConfirmation,
  PasswordChangeRequest,
  ApiError,
} from '../../models/auth.model';
import { ErrorHandlingService } from '../error-handling/error-handling.service';

/**
 * AuthService handles user authentication state and operations
 * using Angular Signals for reactive state management.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly errorHandlingService = inject(ErrorHandlingService);

  // Authentication state as Signals
  readonly authenticationState = signal<boolean>(false);
  readonly currentUser = signal<AuthUser | null>(null);
  readonly authToken = signal<string | null>(null);
  readonly authLoading = signal<boolean>(false);
  readonly authError = signal<string | null>(null);

  // API endpoints
  private readonly apiUrl = environment.apiUrl;
  private readonly apiPrefix = environment.apiPrefix;
  private readonly API_LOGIN = `${this.apiUrl}${this.apiPrefix}/security/user/login`;
  private readonly API_REGISTER = `${this.apiUrl}${this.apiPrefix}/security/user/creator`;
  private readonly API_USER = `${this.apiUrl}${this.apiPrefix}/security/user`;
  private readonly API_CHANGE_PASSWORD = `${this.apiUrl}${this.apiPrefix}/security/user/changePassword`;
  private readonly API_REQUEST_RESET = `${this.apiUrl}${this.apiPrefix}/security/user/request-reset-password`;
  private readonly API_RESET_PASSWORD = `${this.apiUrl}${this.apiPrefix}/security/user/reset-password`;

  constructor() {
    // Initialize auth state from stored token
    this.initAuthState();
  }

  /**
   * Check if user is authenticated
   * @returns Current authentication state
   */
  isAuthenticated(): boolean {
    return this.authenticationState();
  }

  /**
   * Initializes authentication state from stored token
   */
  public initAuthState(): void {
    const storedToken = this.tokenService.getToken();

    if (storedToken) {
      // Check if token is expired
      if (this.tokenService.isTokenExpired(storedToken)) {
        console.warn('Stored token is expired. Logging out.');
        this.logout();
        return;
      }

      // Update the token signal
      this.authToken.set(storedToken);

      // Try to fetch user data with this token
      this.fetchCurrentUser().subscribe({
        next: (user) => {
          // Success: Token is valid, user is authenticated
          this.currentUser.set(user);
          this.authenticationState.set(true);
          console.log('User authenticated from stored token');
        },
        error: (error) => {
          // Error: Token is invalid or expired, log out the user
          console.warn('Authentication failed with stored token:', error);
          // api is on 500, reactivate it later
          this.logout();
        },
      });
    }
  }

  /**
   * Attempts to log in the user with the provided credentials
   * @param username - The username or email
   * @param password - The password
   * @returns An Observable of the AuthResponse
   */
  login(username: string, password: string): Observable<AuthResponse> {
    this.authLoading.set(true);
    this.authError.set(null);

    return this.http
      .post<AuthResponse>(this.API_LOGIN, { username, password })
      .pipe(
        tap((response) => {
          // Save the token
          this.tokenService.saveToken(response.token);
          this.authToken.set(response.token);

          // Create a partial user object from the login response
          const partialUser: AuthUser = {
            id: 0, // We don't have this from login response
            username: response.username,
            email: '', // We don't have this from login response
            status: response.status as UserStatus,
            role: response.role as UserRole,
          };

          // Set the current user and authentication state
          this.currentUser.set(partialUser);
          this.authenticationState.set(true);
          this.authLoading.set(false);

          // Fetch the complete user data
          this.fetchCurrentUser().subscribe({
            next: (user) => {
              this.currentUser.set(user);
            },
            error: (error) => {
              console.error('Error fetching user details after login:', error);
            },
          });
        }),
        catchError((error: HttpErrorResponse) => {
          this.authLoading.set(false);

          // Handle specific error types
          if (error.status === 401) {
            this.authError.set(
              "No user found for this email/password. Don't have an account yet?"
            );
          } else if (error.status === 403) {
            this.authError.set(
              'Your account is not authorized to log in. Please contact support.'
            );
          } else {
            this.authError.set(
              error.error?.message ||
                'Login failed. Please check your credentials.'
            );
          }

          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Registers a new user
   * @param userData - The user registration data
   * @returns An Observable of the RegisterResponse
   */
  register(userData: {
    username: string;
    email: string;
    password: string;
  }): Observable<RegisterResponse> {
    this.authLoading.set(true);
    this.authError.set(null);

    return this.http.post<RegisterResponse>(this.API_REGISTER, userData).pipe(
      tap(() => {
        this.authLoading.set(false);
      }),
      catchError((error: HttpErrorResponse) => {
        this.authLoading.set(false);
        // Use the error handling service to format the error message.
        const formattedError = this.errorHandlingService.processError(error);
        this.authError.set(formattedError);
        return throwError(() => error);
      })
    );
  }

  /**
   * Activate user from mail link
   * @param activationCode - received token
   */
  activateUser(
    activationCode: string
  ): Observable<{ message: string; data: any }> {
    // Construct the endpoint using activationCode as a path parameter.
    const API_ACTIVATE = `${this.apiUrl}${this.apiPrefix}/security/user/activate/${activationCode}`;

    return this.http
      .post<{ message: string; data: any }>(API_ACTIVATE, {})
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        })
      );
  }

  /**
   * Changes the user's password
   * @param passwordData - The password change data
   * @returns An Observable of the response
   */
  changePassword(passwordData: {
    oldPassword: string;
    newPassword: string;
  }): Observable<any> {
    this.authLoading.set(true);
    this.authError.set(null);

    return this.http.post(this.API_CHANGE_PASSWORD, passwordData).pipe(
      tap(() => {
        this.authLoading.set(false);
      }),
      catchError((error: HttpErrorResponse) => {
        this.authLoading.set(false);
        this.authError.set(
          error.error?.message || 'Failed to change password. Please try again.'
        );
        return throwError(() => error);
      })
    );
  }

  /**
   * Logs out the current user
   */
  logout(): void {
    // Clear all authentication state
    this.currentUser.set(null);
    this.authenticationState.set(false);
    this.authToken.set(null);
    this.authError.set(null);
    this.tokenService.removeToken();

    // Redirect to login page
    this.router.navigate(['/auth/login']);
  }

  /**
   * Fetches the current user data
   * @returns An Observable of the User
   */
  fetchCurrentUser(): Observable<AuthUser> {
    return this.http.get<AuthUser>(this.API_USER).pipe(
      catchError((error: HttpErrorResponse) => {
        // If 401 Unauthorized, token is invalid
        if (error.status === 401 || error.status === 403) {
          this.logout();
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Requests a password reset for the given username or email
   * @param resetData - The reset request data
   * @returns An Observable of the response
   */
  requestPasswordReset(resetData: PasswordResetRequest): Observable<any> {
    this.authLoading.set(true);
    this.authError.set(null);

    return this.http.post(this.API_REQUEST_RESET, resetData).pipe(
      tap(() => {
        this.authLoading.set(false);
      }),
      catchError((error: HttpErrorResponse) => {
        this.authLoading.set(false);

        if (error.status === 404) {
          this.authError.set(
            "We couldn't find an account with that email/username. Please check and try again."
          );
        } else {
          this.authError.set(
            error.error?.message ||
              'Failed to request password reset. Please try again.'
          );
        }

        console.error('Password reset request error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Resets the password using the reset code
   * @param resetData - The password reset confirmation data
   * @returns An Observable of the response
   */
  resetPassword(resetData: PasswordResetConfirmation): Observable<any> {
    this.authLoading.set(true);
    this.authError.set(null);

    return this.http.post(this.API_RESET_PASSWORD, resetData).pipe(
      tap(() => {
        this.authLoading.set(false);
      }),
      catchError((error: HttpErrorResponse) => {
        this.authLoading.set(false);

        if (error.status === 400 && error.error?.message?.includes('expired')) {
          this.authError.set(
            'This reset link has expired. Please request a new password reset.'
          );
        } else if (error.status === 404) {
          this.authError.set(
            'Invalid reset code. Please check the link in your email.'
          );
        } else {
          this.authError.set(
            error.error?.message ||
              'Failed to reset password. The link may have expired.'
          );
        }

        console.error('Password reset error:', error);
        return throwError(() => error);
      })
    );
  }
}
