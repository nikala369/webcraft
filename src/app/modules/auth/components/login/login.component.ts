import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm!: FormGroup;
  private subscription = new Subscription();
  returnUrl: string = '/app';
  submitted = false;

  // For template access
  get usernameControl(): FormControl {
    return this.loginForm.get('username') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  get loading() {
    return this.authService.authLoading();
  }

  get error() {
    return this.authService.authError();
  }

  ngOnInit(): void {
    // Initialize form
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Get return URL from route parameters or default to '/app'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/app';

    // Auto-populate email from query params if available (e.g., from registration completion)
    const email = this.route.snapshot.queryParams['email'];
    if (email) {
      this.usernameControl.setValue(email);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSubmit(): void {
    this.submitted = true;

    // Mark controls as touched to trigger validation
    // if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach((key) => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
      // return;
    // }

    const { username, password } = this.loginForm.value;

    const loginSub = this.authService.login(username, password).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: () => {
        // Focus password field for re-entry
        const passwordInput = document.getElementById(
          'password'
        ) as HTMLInputElement;
        if (passwordInput) {
          passwordInput.focus();
          passwordInput.select();
        }
      },
    });

    this.subscription.add(loginSub);
  }

  // Helper method to check specific validation errors
  hasError(controlName: string, errorName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!control && control.touched && control.hasError(errorName);
  }
}
