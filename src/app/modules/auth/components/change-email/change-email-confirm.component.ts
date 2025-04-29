import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-change-email-confirm',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="auth-page">
      <div class="auth-background">
        <div class="animated-bg"></div>
      </div>

      <div class="auth-logo" routerLink="/">
        <img src="assets/images/logo.svg" alt="Webcraft Logo" />
      </div>

      <div class="auth-container">
        <div class="auth-card" style="max-width: 480px;">
          <div class="auth-header">
            <h1 class="auth-title">Confirm Email Change</h1>
            <p class="auth-subtitle" *ngIf="!success()">
              Please confirm your old email address to complete the change
            </p>
          </div>

          <!-- Token Missing/Invalid State -->
          <div *ngIf="tokenMissing()" class="error-container">
            <div class="auth-error">
              Invalid or missing confirmation token. Please use the link from
              the email sent to your new address.
            </div>
            <div class="action-buttons">
              <button class="btn btn-primary" routerLink="/app/settings">
                Back to Settings
              </button>
            </div>
          </div>

          <!-- Email Form -->
          <form
            *ngIf="!tokenMissing() && !loading() && !success()"
            [formGroup]="confirmForm"
            (ngSubmit)="onSubmit()"
            class="auth-form"
          >
            <!-- Old Email field -->
            <div class="form-group">
              <label for="oldEmail" class="form-label"
                >Current Email Address</label
              >
              <div class="input-container">
                <input
                  type="email"
                  id="oldEmail"
                  formControlName="oldEmail"
                  class="form-control"
                  placeholder="Enter your current email address"
                  autocomplete="email"
                />
              </div>
              <div
                *ngIf="oldEmailControl.invalid && oldEmailControl.touched"
                class="form-error"
              >
                <span *ngIf="oldEmailControl.errors?.['required']"
                  >Current email is required</span
                >
                <span *ngIf="oldEmailControl.errors?.['email']"
                  >Please enter a valid email address</span
                >
              </div>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              class="btn btn-primary btn-block"
              [disabled]="confirmForm.invalid || submitting()"
            >
              <span *ngIf="!submitting()">Confirm Email Change</span>
              <span *ngIf="submitting()" class="loading-spinner-sm"></span>
            </button>

            <!-- Cancel button -->
            <button
              type="button"
              class="btn btn-outline btn-block mt-3"
              routerLink="/app/settings"
            >
              Cancel
            </button>
          </form>

          <!-- Error Message -->
          <div *ngIf="error()" class="auth-error mt-4">
            {{ errorMessage() }}
          </div>

          <!-- Loading State -->
          <div *ngIf="loading()" class="loading-container">
            <div class="loading-spinner"></div>
            <p>Processing your request...</p>
          </div>

          <!-- Success State -->
          <div *ngIf="success()" class="success-container">
            <div class="success-icon" style="text-align: center;">✓</div>
            <p class="success-message">
              Your email address has been successfully changed! You can now use
              your new email address to sign in.
            </p>
            <button
              class="btn btn-primary btn-block mt-4"
              routerLink="/app/settings"
              style="margin-top: 15px;"
            >
              Back to Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../login/login.component.scss'],
})
export class ChangeEmailConfirmComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  // Form
  confirmForm!: FormGroup;

  // UI state signals
  tokenMissing = signal(false);
  loading = signal(false);
  submitting = signal(false);
  success = signal(false);
  error = signal(false);
  errorMessage = signal('');

  // Store the token from query params
  private confirmToken = '';

  ngOnInit(): void {
    this.initForm();

    // Extract token from query parameters
    this.route.queryParams.subscribe((params) => {
      this.confirmToken = params['token'];

      if (!this.confirmToken) {
        this.tokenMissing.set(true);
      }
    });
  }

  initForm(): void {
    this.confirmForm = this.fb.group({
      oldEmail: ['', [Validators.required, Validators.email]],
    });
  }

  get oldEmailControl() {
    return this.confirmForm.get('oldEmail')!;
  }

  onSubmit(): void {
    if (this.confirmForm.invalid) {
      this.confirmForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(false);

    const oldEmail = this.confirmForm.value.oldEmail;

    this.authService
      .confirmEmailChange(oldEmail, this.confirmToken)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.success.set(true);
        },
        error: (err) => {
          this.error.set(true);
          this.errorMessage.set(
            err.error?.message ||
              'Failed to confirm email change. Please try again later.'
          );
        },
      });
  }
}
