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
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-change-email-request',
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
            <h1 class="auth-title">Change Email Address</h1>
            <p class="auth-subtitle" *ngif="!success()">
              Enter your new email address to continue the change process
            </p>
          </div>

          <!-- Token Missing/Invalid State -->
          <div *ngIf="tokenMissing()" class="error-container">
            <div class="auth-error">
              Invalid or missing token. Please use the link from your email or
              request a new email change.
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
            [formGroup]="emailForm"
            (ngSubmit)="onSubmit()"
            class="auth-form"
          >
            <!-- New Email field -->
            <div class="form-group">
              <label for="email" class="form-label">New Email Address</label>
              <div class="input-container">
                <input
                  type="email"
                  id="email"
                  formControlName="email"
                  class="form-control"
                  placeholder="Enter your new email address"
                  autocomplete="email"
                />
              </div>
              <div
                *ngIf="emailControl.invalid && emailControl.touched"
                class="form-error"
              >
                <span *ngIf="emailControl.errors?.['required']"
                  >Email is required</span
                >
                <span *ngIf="emailControl.errors?.['email']"
                  >Please enter a valid email address</span
                >
              </div>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              class="btn btn-primary btn-block"
              [disabled]="emailForm.invalid || submitting()"
            >
              <span *ngIf="!submitting()">Continue</span>
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
              We've sent a confirmation link to your new email address. Please
              check your inbox and click the link to complete the email change
              process.
            </p>
            <button
              class="btn btn-primary btn-block mt-4"
              style="margin-top: 15px;"
              routerLink="/app/settings"
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
export class ChangeEmailRequestComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  // Form
  emailForm!: FormGroup;

  // UI state signals
  tokenMissing = signal(false);
  loading = signal(false);
  submitting = signal(false);
  success = signal(false);
  error = signal(false);
  errorMessage = signal('');

  // Store the token from query params
  private changeEmailToken = '';

  ngOnInit(): void {
    this.initForm();

    // Extract token from query parameters
    this.route.queryParams.subscribe((params) => {
      this.changeEmailToken = params['token'];

      if (!this.changeEmailToken) {
        this.tokenMissing.set(true);
      }
    });
  }

  initForm(): void {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get emailControl() {
    return this.emailForm.get('email')!;
  }

  onSubmit(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(false);

    const newEmail = this.emailForm.value.email;

    this.authService
      .setPendingNewEmail(newEmail, this.changeEmailToken)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.success.set(true);
        },
        error: (err) => {
          this.error.set(true);
          this.errorMessage.set(
            err.error?.message ||
              'Failed to process your request. Please try again later.'
          );
        },
      });
  }
}
