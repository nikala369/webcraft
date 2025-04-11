import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1 class="dashboard-title">Account Settings</h1>
      </header>

      <div class="settings-layout">
        <!-- Profile Section -->
        <section class="settings-card">
          <h2 class="settings-section-title">Profile Information</h2>

          <div class="profile-avatar-section">
            <div class="profile-avatar">{{ getInitials() }}</div>
            <div class="profile-avatar-actions">
              <span class="profile-username">{{
                authService.currentUser()?.username
              }}</span>
              <span class="profile-email">{{
                authService.currentUser()?.email
              }}</span>
              <p class="profile-note">Profile picture upload coming soon</p>
            </div>
          </div>

          <div class="form-note">
            <p>Username and email updates will be available soon.</p>
          </div>
        </section>

        <!-- Password Section -->
        <section class="settings-card">
          <h2 class="settings-section-title">Change Password</h2>

          <form
            [formGroup]="passwordForm"
            (ngSubmit)="onSubmit()"
            class="settings-form"
          >
            <!-- Current Password -->
            <div class="form-group">
              <label for="currentPassword" class="form-label"
                >Current Password</label
              >
              <input
                type="password"
                id="currentPassword"
                formControlName="currentPassword"
                class="form-control"
                [class.is-invalid]="
                  passwordForm.get('currentPassword')?.invalid &&
                  passwordForm.get('currentPassword')?.touched
                "
              />
              <div
                class="invalid-feedback"
                *ngIf="passwordForm.get('currentPassword')?.errors?.['required'] && passwordForm.get('currentPassword')?.touched"
              >
                Current password is required
              </div>
            </div>

            <!-- New Password -->
            <div class="form-group">
              <label for="newPassword" class="form-label">New Password</label>
              <input
                type="password"
                id="newPassword"
                formControlName="newPassword"
                class="form-control"
                [class.is-invalid]="
                  passwordForm.get('newPassword')?.invalid &&
                  passwordForm.get('newPassword')?.touched
                "
              />
              <div
                class="invalid-feedback"
                *ngIf="passwordForm.get('newPassword')?.errors?.['required'] && passwordForm.get('newPassword')?.touched"
              >
                New password is required
              </div>
              <div
                class="invalid-feedback"
                *ngIf="passwordForm.get('newPassword')?.errors?.['minlength'] && passwordForm.get('newPassword')?.touched"
              >
                Password must be at least 8 characters
              </div>
            </div>

            <!-- Confirm New Password -->
            <div class="form-group">
              <label for="confirmPassword" class="form-label"
                >Confirm New Password</label
              >
              <input
                type="password"
                id="confirmPassword"
                formControlName="confirmPassword"
                class="form-control"
                [class.is-invalid]="(passwordForm.get('confirmPassword')?.invalid || passwordForm.errors?.['passwordMismatch']) && passwordForm.get('confirmPassword')?.touched"
              />
              <div
                class="invalid-feedback"
                *ngIf="passwordForm.get('confirmPassword')?.errors?.['required'] && passwordForm.get('confirmPassword')?.touched"
              >
                Please confirm your new password
              </div>
              <div
                class="invalid-feedback"
                *ngIf="passwordForm.errors?.['passwordMismatch'] && passwordForm.get('confirmPassword')?.touched"
              >
                Passwords do not match
              </div>
            </div>

            <!-- Success/Error messages -->
            <div class="form-message success" *ngIf="successMessage">
              {{ successMessage }}
            </div>
            <div class="form-message error" *ngIf="errorMessage">
              {{ errorMessage }}
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              class="submit-button"
              [disabled]="passwordForm.invalid || loading"
            >
              <span *ngIf="!loading">Change Password</span>
              <span *ngIf="loading" class="loading-spinner"></span>
            </button>
          </form>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
      }

      .dashboard-header {
        margin-bottom: 2rem;
      }

      .dashboard-title {
        font-size: 1.75rem;
        font-weight: 600;
        color: var(--text-color, #1e293b);
        margin: 0;
      }

      /* Settings layout */
      .settings-layout {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .settings-card {
        background-color: var(--card-bg-color, #ffffff);
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        padding: 1.5rem;
      }

      .settings-section-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-color, #1e293b);
        margin: 0 0 1.5rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
      }

      /* Profile section */
      .profile-avatar-section {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        margin-bottom: 1.5rem;
      }

      .profile-avatar {
        width: 80px;
        height: 80px;
        background-color: var(--primary-color, #3b82f6);
        border-radius: 12px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 1.75rem;
      }

      .profile-avatar-actions {
        display: flex;
        flex-direction: column;
      }

      .profile-username {
        font-weight: 600;
        font-size: 1.125rem;
        color: var(--text-color, #1e293b);
        margin-bottom: 0.25rem;
      }

      .profile-email {
        color: var(--text-muted-color, #64748b);
        font-size: 0.9375rem;
        margin-bottom: 0.5rem;
      }

      .profile-note {
        font-size: 0.875rem;
        color: var(--text-muted-color, #94a3b8);
        font-style: italic;
        margin: 0.5rem 0 0;
      }

      .form-note {
        background-color: var(--info-light-color, rgba(59, 130, 246, 0.1));
        padding: 0.75rem 1rem;
        border-radius: 8px;
        color: var(--info-color, #3b82f6);
        font-size: 0.875rem;
      }

      /* Form styling */
      .settings-form {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .form-label {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-color, #1e293b);
      }

      .form-control {
        padding: 0.75rem 1rem;
        background-color: var(--input-bg-color, #f8fafc);
        border: 1px solid var(--input-border-color, #e2e8f0);
        border-radius: 8px;
        font-size: 0.9375rem;
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .form-control:focus {
        outline: none;
        border-color: var(--primary-color, #3b82f6);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
      }

      .form-control.is-invalid {
        border-color: var(--danger-color, #ef4444);
      }

      .invalid-feedback {
        font-size: 0.75rem;
        color: var(--danger-color, #ef4444);
      }

      .form-message {
        padding: 0.75rem;
        border-radius: 6px;
        font-size: 0.875rem;
      }

      .form-message.success {
        background-color: rgba(16, 185, 129, 0.1);
        color: var(--success-color, #10b981);
      }

      .form-message.error {
        background-color: rgba(239, 68, 68, 0.1);
        color: var(--danger-color, #ef4444);
      }

      .submit-button {
        margin-top: 0.5rem;
        background-color: var(--primary-color, #3b82f6);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.75rem 1.5rem;
        font-weight: 500;
        font-size: 0.9375rem;
        cursor: pointer;
        transition: background-color 0.2s, transform 0.1s;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .submit-button:hover:not(:disabled) {
        background-color: var(--primary-color-hover, #2563eb);
      }

      .submit-button:active {
        transform: translateY(1px);
      }

      .submit-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .loading-spinner {
        display: inline-block;
        width: 1.25rem;
        height: 1.25rem;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Responsive adjustments */
      @media (max-width: 576px) {
        .dashboard-container {
          padding: 1.5rem 1rem;
        }

        .profile-avatar-section {
          flex-direction: column;
          align-items: flex-start;
        }

        .profile-avatar-actions {
          margin-top: 1rem;
        }
      }
    `,
  ],
})
export class SettingsComponent {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);

  passwordForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor() {
    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  // Custom validator to check if passwords match
  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  getInitials(): string {
    const user = this.authService.currentUser();
    if (!user || !user.username) return '?';

    return user.username.substring(0, 2).toUpperCase();
  }

  onSubmit() {
    if (this.passwordForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.passwordForm.controls).forEach((key) => {
        const control = this.passwordForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService
      .changePassword({ oldPassword: currentPassword, newPassword })
      .subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = 'Password successfully changed';
          this.passwordForm.reset();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage =
            error.error?.message ||
            'Failed to change password. Please try again.';
        },
      });
  }
}
