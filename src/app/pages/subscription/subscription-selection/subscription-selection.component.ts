import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError, finalize, switchMap, tap } from 'rxjs/operators';
import { PlanBadgeComponent } from '../../../shared/components/plan-badge/plan-badge.component';
import { SubscriptionService } from '../../../core/services/subscription/subscription.service';
import { UserBuildService } from '../../../core/services/build/user-build.service';
import { environment } from '../../../../environments/environment';
import { ConfirmationService } from '../../../core/services/shared/confirmation/confirmation.service';

@Component({
  selector: 'app-subscription-selection',
  standalone: true,
  imports: [CommonModule, PlanBadgeComponent],
  templateUrl: './subscription-selection.component.html',
  styleUrls: ['./subscription-selection.component.scss'],
})
export class SubscriptionSelectionComponent implements OnInit {
  templateId: string | null = null;
  templateName: string | null = null;
  templatePlan: string | any;
  subscriptionPlans: any[] = [];
  selectedPlanId: string | null = null;
  isProcessing = false;
  errorMessage: string | null = null;
  environment = environment;

  // Premium template pricing constants
  private PREMIUM_TEMPLATE_PRICE = 50.0; // $50 one-time fee

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private userBuildService: UserBuildService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    // Extract query parameters
    this.templateId = this.route.snapshot.queryParamMap.get('templateId');
    this.templateName = this.route.snapshot.queryParamMap.get('templateName');
    this.templatePlan = this.route.snapshot.queryParamMap.get('templatePlan');

    if (!this.templateId) {
      this.errorMessage = 'No template specified for subscription.';
      return;
    }

    this.loadSubscriptionPlans();
  }

  loadSubscriptionPlans(): void {
    this.subscriptionService
      .getAllPlans()
      .pipe(
        catchError((error) => {
          console.error('Error loading subscription plans:', error);
          this.errorMessage =
            'Failed to load subscription plans. Please try again.';
          return EMPTY;
        })
      )
      .subscribe((plans) => {
        // Filter to only show BASIC and ADVANCED plans
        this.subscriptionPlans = plans.filter(
          (plan) => plan.type === 'BASIC' || plan.type === 'ADVANCED'
        );

        // If premium template, filter to show only ADVANCED plans
        if (this.templatePlan === 'premium') {
          this.subscriptionPlans = this.subscriptionPlans.filter(
            (plan) => plan.type === 'ADVANCED'
          );
        }

        if (this.subscriptionPlans.length === 0) {
          this.errorMessage = 'No subscription plans available.';
        } else if (this.subscriptionPlans.length === 1) {
          // Auto-select the only plan available
          this.selectPlan(this.subscriptionPlans[0].id);
        }
      });
  }

  selectPlan(planId: string): void {
    this.selectedPlanId = planId;
    this.errorMessage = null;
  }

  /**
   * Get a user-friendly label for the plan type
   */
  getPlanTypeLabel(planType: string): string {
    switch (planType) {
      case 'BASIC':
        return 'Basic';
      case 'ADVANCED':
        return 'Advanced';
      default:
        return planType;
    }
  }

  /**
   * Get features for a specific plan type
   */
  getPlanFeatures(planType: string): string[] {
    const basicFeatures = [
      'Single website hosting',
      'Custom domain support',
      'Free SSL certificate',
      'Basic analytics',
      'Standard support',
    ];

    const advancedFeatures = [
      'Multiple website hosting',
      'Custom domain support',
      'Free SSL certificate',
      'Advanced analytics',
      'Premium support',
      'Performance optimization',
      'Access to premium templates',
    ];

    return planType === 'BASIC' ? basicFeatures : advancedFeatures;
  }

  /**
   * Calculate the total price (subscription + template if premium)
   */
  calculateTotalPrice(): number {
    return (
      this.getSubscriptionPriceOnly() +
      (this.templatePlan === 'premium' ? this.PREMIUM_TEMPLATE_PRICE : 0)
    );
  }

  /**
   * Get only the subscription price
   */
  getSubscriptionPriceOnly(): number {
    if (!this.selectedPlanId) return 0;

    const selectedPlan = this.subscriptionPlans.find(
      (plan) => plan.id === this.selectedPlanId
    );
    return selectedPlan ? selectedPlan.priceCents / 100 : 0;
  }

  /**
   * Get the premium template price (one-time fee)
   */
  getPremiumTemplatePrice(): number {
    return this.PREMIUM_TEMPLATE_PRICE;
  }

  /**
   * Continue to payment and start Stripe checkout
   */
  continueToPayment(): void {
    if (!this.templateId || !this.selectedPlanId || this.isProcessing) {
      this.errorMessage = "Can't proceed: Missing template or plan selection";
      return;
    }

    this.isProcessing = true;
    this.errorMessage = null;

    console.log('Starting payment process:', {
      templateId: this.templateId,
      planId: this.selectedPlanId,
    });

    // Prepare request data
    const buildRequest = {
      userTemplateId: this.templateId,
      subscriptionId: this.selectedPlanId,
    };

    // 1. Create a user build record
    this.userBuildService
      .createUserBuild(buildRequest)
      .pipe(
        tap((build) => {
          // Store the build ID for success page
          if (build && build.id) {
            localStorage.setItem('pendingBuildId', build.id);
          } else {
            console.error('Missing build ID in response');
          }
        }),

        // 2. Initiate Stripe checkout with the build ID
        switchMap((build) => {
          console.log('Initiating checkout for build ID:', build.id);

          // Make API call to get checkout URL
          return this.userBuildService.initiateCheckout(build.id).pipe(
            tap((checkoutUrl) => {
              console.log('Received checkout URL:', checkoutUrl);

              // Ensure we got a valid URL
              if (!checkoutUrl) {
                throw new Error('Invalid checkout URL received from server');
              }

              // Redirect to Stripe checkout
              console.log('Redirecting to Stripe checkout URL...');
              window.location.href = checkoutUrl;
            })
          );
        }),

        // Handle errors at any point in the flow
        catchError((error) => {
          console.error('Error in payment flow:', error);

          // Handle various error cases
          if (error?.status === 401) {
            this.errorMessage =
              'Authentication required. Please log in and try again.';
            this.confirmationService.showConfirmation(
              'Authentication required. Please log in to continue.',
              'error',
              5000
            );
          } else if (error?.error?.message) {
            this.errorMessage = `Error: ${error.error.message}`;
            this.confirmationService.showConfirmation(
              `Payment error: ${error.error.message}`,
              'error',
              5000
            );
          } else {
            this.errorMessage = 'Failed to initiate payment. Please try again.';
            this.confirmationService.showConfirmation(
              'Payment initiation failed. Please try again later.',
              'error',
              5000
            );
          }
          return EMPTY;
        }),

        // Reset processing state when done
        finalize(() => {
          this.isProcessing = false;
        })
      )
      .subscribe({
        // This will never execute since we redirect to Stripe on success
        // But handle any unexpected error that doesn't get caught above
        error: (err) => {
          console.error('Unexpected error in subscription flow:', err);
          this.errorMessage =
            'An unexpected error occurred. Please try again later.';
          this.isProcessing = false;
        },
      });
  }

  /**
   * Navigate back to templates page
   */
  goBack(): void {
    this.router.navigate(['/app/templates']);
  }
}
