import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { PasswordResetRequest } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-password-reset-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-background">
        <div class="animated-bg"></div>
      </div>

      <div class="auth-logo" routerLink="/">
        <img src="assets/images/logo.svg" alt="Webcraft Logo" />
        <span class="logo-text">Webcraft75</span>
      </div>

      <div class="auth-container">
        <div class="auth-card">
          <!-- Success message shown after submitting -->
          <div class="success-message" *ngIf="requestSent">
            <div class="auth-header">
              <h1 class="auth-title">Check Your Email</h1>
              <div class="title-underline"></div>
            </div>
            <div class="success-icon">✓</div>
            <p>
              If an account exists with username
              <strong>{{ submittedUsername }}</strong
              >, we've sent instructions to reset your password.
            </p>
            <p class="note">Don't forget to check your spam folder.</p>
            <button class="btn btn-primary btn-block" routerLink="/auth/login">
              Return to Login
            </button>
          </div>

          <!-- Form shown before successful submission -->
          <ng-container *ngIf="!requestSent">
            <div class="auth-header">
              <h1 class="auth-title">Reset Your Password</h1>
              <div class="title-underline"></div>
              <p class="auth-subtitle">
                Enter your username to receive a reset link
              </p>
            </div>

            <!-- Error message display -->
            <div class="auth-error" *ngIf="error">
              {{ error }}
            </div>

            <form
              [formGroup]="resetForm"
              (ngSubmit)="onSubmit()"
              class="auth-form"
            >
              <!-- Username field -->
              <div class="form-group">
                <label for="username" class="form-label">Username</label>
                <div class="input-container">
                  <input
                    type="text"
                    id="username"
                    formControlName="username"
                    class="form-control"
                    placeholder="Enter your username"
                    [class.is-invalid]="
                      resetForm.get('username')?.invalid && submitted
                    "
                    autocomplete="off"
                  />
                </div>
              </div>

              <!-- Submit button -->
              <button
                type="submit"
                class="btn btn-primary btn-block"
                [disabled]="loading"
              >
                <span *ngIf="!loading">Send Reset Link</span>
                <span *ngIf="loading" class="loading-spinner"></span>
              </button>

              <!-- Back to login link -->
              <div class="auth-links register-link">
                <p>
                  Remember your password?
                  <a routerLink="/auth/login">Sign in</a>
                </p>
              </div>
            </form>

            <div class="terms-text">
              By using Webcraft, you agree to our
              <a href="/terms" target="_blank">Terms of Service</a> and
              <a href="/privacy" target="_blank">Privacy Policy</a>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../login/login.component.scss'],
})
export class PasswordResetRequestComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  resetForm: FormGroup;
  loading = false;
  requestSent = false;
  error = '';
  submittedUsername = '';
  submitted = false;

  constructor() {
    this.resetForm = this.fb.group({
      username: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.resetForm.invalid) {
      return;
    }

    const { username } = this.resetForm.value;
    this.submittedUsername = username;

    this.loading = true;
    this.error = '';

    // Create password reset request object using the interface
    const resetRequest: PasswordResetRequest = {
      source: 'USERNAME',
      username: username,
    };

    this.authService.requestPasswordReset(resetRequest).subscribe({
      next: () => {
        this.loading = false;
        this.requestSent = true;
      },
      error: (err) => {
        this.loading = false;
        // For security reasons, we don't want to reveal whether a username exists or not
        // We'll show success message regardless of error, but log for debugging
        console.error('Password reset request error:', err);
        this.requestSent = true;
      },
    });
  }
}
