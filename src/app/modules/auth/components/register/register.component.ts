import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm!: FormGroup;
  registrationSuccess = signal(false);
  successMessage = signal('');
  private subscription = new Subscription();
  submitted = false;

  // Store user data for potential resend
  registeredUsername = signal('');
  registeredEmail = signal('');

  ngOnInit(): void {
    this.setupForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private setupForm(): void {
    this.registerForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  get loading() {
    return this.authService.authLoading();
  }

  get error() {
    return this.authService.authError();
  }

  /**
   * Custom validator to check if password and confirm password match
   */
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    // Only validate if both fields have values
    if (password && confirmPassword) {
      return password === confirmPassword ? null : { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    this.submitted = true;

    if (this.registerForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.registerForm.controls).forEach((key) => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const { username, email, password } = this.registerForm.value;

    // Store these values for potential resend activation
    this.registeredUsername.set(username);
    this.registeredEmail.set(email);

    const registerSub = this.authService
      .register({ username, email, password })
      .subscribe({
        next: (response) => {
          this.registrationSuccess.set(true);
          this.successMessage.set(
            response.message || 'Registration successful!'
          );
          this.registerForm.reset();
        },
        error: () => {
          // Error already handled in authService
        },
      });

    this.subscription.add(registerSub);
  }

  /**
   * Resend activation email
   */
  resendActivation() {
    if (!this.registeredUsername()) {
      return;
    }

    this.router.navigate(['/auth/resend-activation'], {
      queryParams: {
        username: this.registeredUsername(),
        email: this.registeredEmail(),
      },
    });
  }

  /**
   * Helper method to check specific validation errors
   */
  hasError(controlName: string, errorName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }
}
