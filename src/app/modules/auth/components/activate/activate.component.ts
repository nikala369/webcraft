import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import {AuthService} from "../../../../core/services/auth/auth.service";

@Component({
  selector: 'app-activate',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-background">
        <div class="animated-bg"></div>
      </div>

      <div class="auth-logo" routerLink="/">
        <img src="assets/images/logo.svg" alt="Webcraft Logo" />
      </div>

      <div class="auth-container">
        <div class="auth-card" style="max-width: 420px;">
          <!-- Loading State -->
          <div *ngIf="loading()" class="activation-loading">
            <div class="auth-header">
              <h1 class="auth-title">Activating Account</h1>
              <div class="title-underline"></div>
              <p class="auth-subtitle">
                Please wait while we verify your account
              </p>
            </div>
            <div class="loading-spinner"></div>
            <p>Activating your account...</p>
          </div>

          <!-- Success State -->
          <div *ngIf="!loading() && success()" class="success-message">
            <div class="auth-header">
              <h1 class="auth-title">Account Activated!</h1>
            </div>
            <div class="success-icon">✓</div>
            <p>
              Your account has been successfully activated. You can now sign in
              to Webcraft.
            </p>
            <button class="btn btn-primary btn-block" routerLink="/auth/login">
              Sign In
            </button>
          </div>

          <!-- Error State -->
          <div *ngIf="!loading() && error()" class="error-container">
            <div class="auth-header">
              <h1 class="auth-title">Activation Failed</h1>
            </div>
            <div class="error-icon">!</div>
            <div class="auth-error">{{ errorMessage() }}</div>
            <div class="action-buttons">
              <button class="btn btn-outline" routerLink="/auth/login">
                Sign In
              </button>
              <button
                class="btn btn-primary"
                style="text-wrap: none;"
                routerLink="/auth/resend-activation"
                [queryParams]="{ username: username }"
              >
                Resend Activation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../login/login.component.scss'],
})
export class ActivateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  // Signals for UI state
  loading = signal(true);
  success = signal(false);
  error = signal(false);
  errorMessage = signal(
    'Failed to activate your account. The activation link may have expired or is invalid.'
  );

  // Store username for potential resend functionality
  username = '';

  private readonly API_URL = environment.apiUrl;
  private readonly API_PREFIX = environment.apiPrefix;
  // Expects backend activation endpoint like: GET {API_URL}{API_PREFIX}/security/user/activate/{token}
  private readonly API_ACTIVATE = `${this.API_URL}${this.API_PREFIX}/security/user/activate`;

  ngOnInit(): void {
    // Subscribe to query parameters.
    this.route.queryParams.subscribe((params) => {
      // Check for activation code under either 'token' or 'code'
      const activationCode = params['token'] || params['code'];
      if (activationCode) {
        this.activateAccount(activationCode);
      } else {
        this.handleError('Invalid activation link. No activation code found.');
      }
    });
  }

  activateAccount(activationCode: string): void {
    this.loading.set(true);
    this.authService.activateUser(activationCode).pipe(
      catchError((error) => {
        if (error.error?.username) {
          this.username = error.error.username;
        }
        this.handleError(error.error?.message || 'Failed to activate your account.');
        return of(null);
      }),
      finalize(() => {
        this.loading.set(false);
      })
    )
      .subscribe((response) => {
        if (response) {
          this.success.set(true);
        }
      });
  }

  private handleError(message: string): void {
    this.loading.set(false);
    this.error.set(true);
    this.success.set(false);
    this.errorMessage.set(message);
  }
}
