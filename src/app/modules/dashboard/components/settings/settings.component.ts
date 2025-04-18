import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  // Form groups
  passwordForm!: FormGroup;
  profileForm!: FormGroup;

  // UI state
  isChangingPassword = signal(false);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);

  // User info
  userInfo = signal(this.authService.currentUser());

  ngOnInit(): void {
    this.initForms();
  }

  initForms(): void {
    // Password change form
    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required, Validators.minLength(8)]],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );

    // Profile update form - basic for now
    this.profileForm = this.fb.group({
      username: [this.userInfo()?.username || '', Validators.required],
      email: [
        this.userInfo()?.email || '',
        [Validators.required, Validators.email],
      ],
    });
  }

  /**
   * Custom validator to check that passwords match
   */
  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  /**
   * Handle password change form submission
   */
  onChangePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    // Reset previous messages
    this.passwordError.set(null);
    this.passwordSuccess.set(null);
    this.isChangingPassword.set(true);

    const passwordData = {
      oldPassword: this.passwordForm.value.oldPassword,
      newPassword: this.passwordForm.value.newPassword,
    };

    this.authService
      .changePassword(passwordData)
      .pipe(finalize(() => this.isChangingPassword.set(false)))
      .subscribe({
        next: () => {
          this.passwordSuccess.set(
            'Your password has been changed successfully'
          );
          this.passwordForm.reset();
        },
        error: (error) => {
          this.passwordError.set(
            error.error?.message ||
              'Failed to change password. Please try again.'
          );
        },
      });
  }

  /**
   * Get form control validity class
   */
  getFormControlClass(formGroup: FormGroup, controlName: string): string {
    const control = formGroup.get(controlName);
    if (!control) return '';

    return control.touched ? (control.valid ? 'is-valid' : 'is-invalid') : '';
  }

  /**
   * Get error message for form control
   */
  getErrorMessage(formGroup: FormGroup, controlName: string): string {
    const control = formGroup.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['minlength']) return 'Must be at least 8 characters';
    if (control.errors['email']) return 'Invalid email format';

    // For the confirm password field
    if (controlName === 'confirmPassword' && formGroup.errors?.['mismatch']) {
      return 'Passwords do not match';
    }

    return 'Invalid value';
  }

  getInitials(): string {
    const user = this.authService.currentUser();
    if (!user || !user.username) return '?';

    return user.username.substring(0, 2).toUpperCase();
  }
}
