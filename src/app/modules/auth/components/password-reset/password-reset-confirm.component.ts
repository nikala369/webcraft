import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { PasswordResetConfirmation } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-password-reset-confirm',
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
          <!-- Success message shown after successful reset -->
          <div class="success-message" *ngIf="resetSuccess">
            <div class="auth-header">
              <h1 class="auth-title">Password Reset Successful</h1>
              <div class="title-underline"></div>
            </div>
            <div class="success-icon">✓</div>
            <p>
              Your password has been successfully changed. You can now sign in
              with your new password.
            </p>
            <button class="btn btn-primary btn-block" routerLink="/auth/login">
              Sign In
            </button>
          </div>

          <!-- Form shown before successful reset -->
          <ng-container *ngIf="!resetSuccess">
            <div class="auth-header">
              <h1 class="auth-title">Create New Password</h1>
              <div class="title-underline"></div>
              <p class="auth-subtitle">
                Choose a strong password for your account
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
              <!-- New Password field -->
              <div class="form-group">
                <label for="newPassword" class="form-label">New Password</label>
                <div class="input-container">
                  <input
                    type="password"
                    id="newPassword"
                    formControlName="newPassword"
                    class="form-control"
                    placeholder="Enter new password (min. 8 characters)"
                    [class.is-invalid]="
                      resetForm.get('newPassword')?.invalid && submitted
                    "
                    autocomplete="off"
                  />
                </div>
              </div>

              <!-- Confirm Password field -->
              <div class="form-group">
                <label for="confirmPassword" class="form-label"
                  >Confirm Password</label
                >
                <div class="input-container">
                  <input
                    type="password"
                    id="confirmPassword"
                    formControlName="confirmPassword"
                    class="form-control"
                    placeholder="Confirm new password"
                    [class.is-invalid]="(resetForm.get('confirmPassword')?.invalid || resetForm.errors?.['passwordMismatch']) && submitted"
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
                <span *ngIf="!loading">Reset Password</span>
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
export class PasswordResetConfirmComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  resetForm: FormGroup;
  loading = false;
  resetSuccess = false;
  error = '';
  resetCode = '';
  submitted = false;

  constructor() {
    this.resetForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  ngOnInit(): void {
    // Get reset code from query params
    this.route.queryParams.subscribe((params) => {
      if (params['code']) {
        this.resetCode = params['code'];
      } else {
        this.error = 'Invalid password reset link. Please request a new one.';
      }
    });
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    this.submitted = true;

    if (this.resetForm.invalid || !this.resetCode) {
      return;
    }

    const { newPassword } = this.resetForm.value;

    this.loading = true;
    this.error = '';

    // Create reset confirmation object using the interface
    const resetData: PasswordResetConfirmation = {
      code: this.resetCode,
      newPassword: newPassword,
    };

    this.authService.resetPassword(resetData).subscribe({
      next: () => {
        this.loading = false;
        this.resetSuccess = true;
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err.error?.message ||
          'Password reset failed. The link may have expired. Please request a new one.';
      },
    });
  }
}
