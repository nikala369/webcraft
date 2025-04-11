import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-activation-resend',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-background">
        <div class="animated-bg"></div>
      </div>

      <div class="auth-logo" routerLink="/">
        <img src="assets/images/logo.svg" alt="Webcraft Logo" />
      </div>

      <div class="auth-container" style="align-items: center;">
        <div class="auth-card">
          <!-- Success message shown after successful resend -->
          <div class="success-message" *ngIf="success">
            <div class="auth-header">
              <h1 class="auth-title">Activation Link Sent</h1>
            </div>
            <div class="success-icon">✓</div>
            <p>
              An activation link has been sent to your email address. Please
              check your inbox (and spam folder) to activate your account.
            </p>
          </div>

          <!-- Form shown before successful resend -->
          <ng-container *ngIf="!success">
            <div class="auth-header">
              <h1 class="auth-title">Resend Activation Link</h1>
              <p class="auth-subtitle">
                Enter your account details to receive a new activation link
              </p>
            </div>

            <!-- Error message display -->
            <div class="auth-error" *ngIf="error">
              {{ error }}
            </div>

            <form
              [formGroup]="resendForm"
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
                      resendForm.get('username')?.invalid && submitted
                    "
                    autocomplete="off"
                  />
                </div>
              </div>

              <!-- Password field -->
              <div class="form-group">
                <label for="password" class="form-label">Password</label>
                <div class="input-container" style="margin-bottom: 15px;">
                  <input
                    type="password"
                    id="password"
                    formControlName="password"
                    class="form-control"
                    placeholder="Enter your password"
                    [class.is-invalid]="
                      resendForm.get('password')?.invalid && submitted
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
                <span *ngIf="!loading">Resend Activation Link</span>
                <span *ngIf="loading" class="loading-spinner"></span>
              </button>
            </form>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../login/login.component.scss'],
})
export class ActivationResendComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  resendForm: FormGroup;
  loading = false;
  success = false;
  error = '';
  submitted = false;

  private readonly API_URL = environment.apiUrl;
  private readonly API_PREFIX = environment.apiPrefix;
  private readonly RESEND_ENDPOINT = `${this.API_URL}${this.API_PREFIX}/security/user/resendActivationCode`;

  constructor() {
    this.resendForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Populate form with query params if available
    this.route.queryParams.subscribe((params) => {
      if (params['username']) {
        this.resendForm.get('username')?.setValue(params['username']);
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.resendForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const { username, password } = this.resendForm.value;

    this.http.post(this.RESEND_ENDPOINT, { username, password }).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        this.loading = false;
        this.error =
          err.error?.message ||
          'Failed to resend activation link. Please try again.';
      },
    });
  }
}
