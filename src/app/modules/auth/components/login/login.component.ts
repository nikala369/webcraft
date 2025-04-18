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
import { SelectionStateService } from '../../../../core/services/selection/selection-state.service';

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
  private selectionStateService = inject(SelectionStateService);

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
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });

    const { username, password } = this.loginForm.value;

    const loginSub = this.authService.login(username, password).subscribe({
      next: () => {
        // Check if we have saved selection state
        if (this.selectionStateService.hasRecentSelections()) {
          const selections = this.selectionStateService.getSelections();

          // If we have both business type and plan, route to preview
          if (selections.businessType && selections.planType) {
            console.log(
              'Redirecting to preview with saved selections:',
              selections
            );

            this.router.navigate(['/preview'], {
              queryParams: {
                businessType: selections.businessType,
                plan: selections.planType,
                templateId: selections.templateId,
                new: true,
              },
            });

            // Clear selections after use
            this.selectionStateService.clearSelections();
            return;
          }
          // If we only have business type, route to plan selection
          else if (selections.businessType) {
            console.log(
              'Redirecting to plan selection with business type:',
              selections.businessType
            );

            this.router.navigate(['/pricing'], {
              queryParams: {
                businessType: selections.businessType,
              },
            });

            // Clear selections after use
            this.selectionStateService.clearSelections();
            return;
          }
        }

        // Check if returnUrl contains a template selection path
        if (
          this.returnUrl.includes('/preview') ||
          this.returnUrl.includes('/pricing')
        ) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          // Default to dashboard templates view
          this.router.navigate(['/app/templates']);
        }
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
