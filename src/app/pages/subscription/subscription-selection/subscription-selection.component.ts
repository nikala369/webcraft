import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  NgZone,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EMPTY } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PlanBadgeComponent } from '../../../shared/components/plan-badge/plan-badge.component';
import {
  SubscriptionService,
  SubscriptionPlan,
} from '../../../core/services/subscription/subscription.service';
import { UserBuildService } from '../../../core/services/build/user-build.service';
import { environment } from '../../../../environments/environment';
// Assuming ConfirmationService is used elsewhere or can be removed if not directly used in this logic
// import { ConfirmationService } from '../../../core/services/shared/confirmation/confirmation.service';

@Component({
  selector: 'app-subscription-selection',
  standalone: true,
  imports: [CommonModule, FormsModule, PlanBadgeComponent],
  templateUrl: './subscription-selection.component.html',
  styleUrls: ['./subscription-selection.component.scss'],
})
export class SubscriptionSelectionComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('termsScrollContainer')
  termsScrollContainer!: ElementRef<HTMLElement>; // Typed ElementRef

  templateId: string | null = null;
  templateName: string | null = null;
  templatePlan: string | any;
  businessType: string | null = null;
  templateType: string | null = null;
  subscriptionPlans: SubscriptionPlan[] = [];
  selectedPlanId: string | null = null;
  isProcessing = false;
  errorMessage: string | null = null;
  environment = environment;
  termsAccepted = false;
  hasScrolledToBottom = false;
  isCheckboxVisible = false;
  scrolledPercentage = 0;

  private readonly scrollThreshold = 0.9; // 90% to show checkbox
  private readonly scrollBottomPxTolerance = 5; // Pixels from bottom to consider "at bottom"
  private scrollListener: (() => void) | null = null;
  private failsafeTimer: any = null;
  private scrollAnimationFrameId: number | null = null;

  planPrices = {
    standard: 99,
    premium: 399,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private userBuildService: UserBuildService,
    // private confirmationService: ConfirmationService, // Only if used
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.templateId = this.route.snapshot.queryParamMap.get('templateId');
    this.templateName = this.route.snapshot.queryParamMap.get('templateName');
    this.templatePlan = this.route.snapshot.queryParamMap.get('templatePlan');
    this.businessType = this.route.snapshot.queryParamMap.get('businessType');
    this.templateType = this.route.snapshot.queryParamMap.get('templateType');

    if (!this.templateId) {
      this.errorMessage = 'No template specified for subscription.';
      return;
    }
    this.loadSubscriptionPlans();
  }

  ngAfterViewInit(): void {
    // Initial setup if a plan is already selected (e.g., auto-selected)
    // The main logic for scroll setup will be in selectPlan
    if (this.selectedPlanId) {
      // Defer to ensure DOM is fully ready
      Promise.resolve().then(() => {
        if (this.termsScrollContainer?.nativeElement) {
          this.initializeOrReinitializeTermsScroll();
        } else {
          this.resetAndArmFailsafeTimer(); // Arm failsafe if container not found initially
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.cleanupScrollRelatedResources();
    if (this.failsafeTimer) {
      clearTimeout(this.failsafeTimer);
      this.failsafeTimer = null;
    }
  }

  private cleanupScrollRelatedResources(): void {
    if (this.scrollListener && this.termsScrollContainer?.nativeElement) {
      this.termsScrollContainer.nativeElement.removeEventListener(
        'scroll',
        this.scrollListener
      );
      this.scrollListener = null;
    }
    if (this.scrollAnimationFrameId) {
      cancelAnimationFrame(this.scrollAnimationFrameId);
      this.scrollAnimationFrameId = null;
    }
  }

  private resetAndArmFailsafeTimer(): void {
    if (this.failsafeTimer) {
      clearTimeout(this.failsafeTimer);
      this.failsafeTimer = null;
    }

    // Only arm if a plan is selected and checkbox isn't already visible
    if (this.selectedPlanId && !this.isCheckboxVisible) {
      this.failsafeTimer = setTimeout(() => {
        if (this.selectedPlanId && !this.isCheckboxVisible) {
          // Re-check condition
          this.ngZone.run(() => {
            if (!this.isCheckboxVisible) {
              // Final check
              this.isCheckboxVisible = true;
              this.hasScrolledToBottom = true;
              this.scrolledPercentage = 100;
              this.cdr.detectChanges();
              console.log('Failsafe: Terms checkbox shown.');
            }
          });
        }
      }, 5000); // 5 seconds
    }
  }

  private initializeOrReinitializeTermsScroll(): void {
    this.cleanupScrollRelatedResources(); // Always clean up first

    if (!this.termsScrollContainer?.nativeElement) {
      console.warn(
        'Terms scroll container not found during initialization attempt.'
      );
      // If container not found even when expected, arm failsafe as a backup.
      this.resetAndArmFailsafeTimer();
      return;
    }

    const element = this.termsScrollContainer.nativeElement;

    // Perform an initial state check. `forceUpdate = true` ensures UI state is set.
    this.checkScrollState(element, true);

    // If checkbox is already visible (e.g., not scrollable or already scrolled by `forceUpdate`),
    // no need for listener or failsafe related to scrolling.
    if (this.isCheckboxVisible) {
      if (this.failsafeTimer) {
        // If failsafe was armed, clear it as condition is met.
        clearTimeout(this.failsafeTimer);
        this.failsafeTimer = null;
      }
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.scrollListener = () => {
        if (this.scrollAnimationFrameId) {
          cancelAnimationFrame(this.scrollAnimationFrameId);
        }
        this.scrollAnimationFrameId = requestAnimationFrame(() => {
          // Ensure element still exists (e.g. if component is destroyed during rAF)
          if (this.termsScrollContainer?.nativeElement) {
            this.checkScrollState(
              this.termsScrollContainer.nativeElement,
              false
            );
          }
        });
      };
      element.addEventListener('scroll', this.scrollListener, {
        passive: true,
      });
    });

    // Arm the failsafe timer *after* attempting to set up the scroll listener,
    // only if the checkbox isn't already visible.
    this.resetAndArmFailsafeTimer();
  }

  private checkScrollState(element: HTMLElement, forceUpdate = false): void {
    const { scrollTop, scrollHeight, clientHeight } = element;
    const scrollableDistance = Math.max(0, scrollHeight - clientHeight);
    const epsilon = 1; // Small tolerance

    let newScrolledPercentage: number;
    let newHasScrolledToBottom: boolean;
    let newIsCheckboxVisible: boolean;

    if (scrollableDistance <= epsilon) {
      // Content isn't (or barely) scrollable
      newScrolledPercentage = 100;
      newHasScrolledToBottom = true;
      newIsCheckboxVisible = true; // Checkbox should be visible if not scrollable
    } else {
      newScrolledPercentage = Math.min(
        Math.round((scrollTop / scrollableDistance) * 100),
        100
      );
      const hasReachedScrollThreshold =
        scrollTop / scrollableDistance >=
        this.scrollThreshold - epsilon / scrollableDistance; // Adjusted for epsilon
      const isNearExactBottom =
        scrollTop + clientHeight >= scrollHeight - this.scrollBottomPxTolerance;

      newHasScrolledToBottom = hasReachedScrollThreshold || isNearExactBottom;
      newIsCheckboxVisible = newHasScrolledToBottom; // Checkbox visible when condition met
    }

    const percentageChanged = this.scrolledPercentage !== newScrolledPercentage;
    const scrolledToBottomStatusChanged =
      this.hasScrolledToBottom !== newHasScrolledToBottom;
    // Check if the checkbox needs to change from not visible to visible
    const checkboxShouldBecomeVisible =
      newIsCheckboxVisible && !this.isCheckboxVisible;

    if (
      forceUpdate ||
      percentageChanged ||
      scrolledToBottomStatusChanged ||
      checkboxShouldBecomeVisible
    ) {
      this.ngZone.run(() => {
        this.scrolledPercentage = newScrolledPercentage;
        this.hasScrolledToBottom = newHasScrolledToBottom;

        if (checkboxShouldBecomeVisible) {
          this.isCheckboxVisible = true;
          if (this.failsafeTimer) {
            // Clear failsafe if scroll condition met
            clearTimeout(this.failsafeTimer);
            this.failsafeTimer = null;
            console.log(
              'Terms scroll completed by user, failsafe timer cleared.'
            );
          }
        } else if (
          !newIsCheckboxVisible &&
          this.isCheckboxVisible &&
          !forceUpdate
        ) {
          // This case might occur if content resizes making it scrollable again after being non-scrollable
          // Resetting checkbox visibility if it was visible but now conditions aren't met
          // (excluding forceUpdate, which handles initial non-scrollable state)
          this.isCheckboxVisible = false;
        }
        // If forceUpdate is true and content is not scrollable, isCheckboxVisible will be set to true
        // by the initial logic (newIsCheckboxVisible = true).

        this.cdr.detectChanges();
      });
    }
  }

  loadSubscriptionPlans(): void {
    this.subscriptionService
      .getAllPlans()
      .pipe(
        catchError((error) => {
          console.error('Error loading subscription plans:', error);
          this.errorMessage =
            'Failed to load subscription plans. Please try again.';
          this.cdr.detectChanges();
          return EMPTY;
        })
      )
      .subscribe((plans) => {
        this.subscriptionPlans = plans.filter(
          (plan) => plan.type === 'BASIC' || plan.type === 'ADVANCED'
        );

        if (this.subscriptionPlans.length === 0) {
          this.errorMessage = 'No subscription plans available.';
        } else if (this.subscriptionPlans.length === 1) {
          this.selectPlan(this.subscriptionPlans[0].id); // This will trigger scroll init logic
        }
        this.cdr.detectChanges();
      });
  }

  selectPlan(planId: string): void {
    if (
      this.selectedPlanId === planId &&
      this.termsScrollContainer?.nativeElement
    ) {
      // If same plan is clicked and terms container exists, ensure it's in view
      // (e.g., user scrolled away and clicked the same plan card)
      const orderSummary = document.querySelector('.order-summary');
      if (orderSummary) {
        orderSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }

    const previousPlanId = this.selectedPlanId;
    this.selectedPlanId = planId;
    this.errorMessage = null;

    // Reset states relevant to terms agreement
    this.termsAccepted = false;
    this.scrolledPercentage = 0;
    this.hasScrolledToBottom = false;
    this.isCheckboxVisible = false; // Crucially reset this

    // Clean up any existing scroll listeners and failsafe timer *before* DOM updates
    this.cleanupScrollRelatedResources();
    if (this.failsafeTimer) {
      clearTimeout(this.failsafeTimer);
      this.failsafeTimer = null;
    }

    this.cdr.detectChanges(); // Allow Angular to update DOM based on new selectedPlanId

    // Defer the (re)initialization of scroll handling to the next microtask,
    // after Angular has updated the DOM (e.g. *ngIf for terms container).
    Promise.resolve().then(() => {
      if (this.selectedPlanId && this.termsScrollContainer?.nativeElement) {
        this.initializeOrReinitializeTermsScroll();

        // Scroll to order summary and focus terms, only if plan actually changed
        if (previousPlanId !== this.selectedPlanId) {
          const orderSummary = document.querySelector('.order-summary');
          if (orderSummary) {
            orderSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Delay focus to after scrollIntoView animation
            setTimeout(() => {
              if (this.termsScrollContainer?.nativeElement) {
                const termsEl = this.termsScrollContainer.nativeElement;
                termsEl.focus({ preventScroll: true });
                // Optional: hint scroll if actually scrollable
                if (
                  termsEl.scrollHeight > termsEl.clientHeight &&
                  termsEl.scrollTop < 5
                ) {
                  const currentScroll = termsEl.scrollTop;
                  termsEl.scrollTop = currentScroll + 5;
                  setTimeout(() => {
                    if (this.termsScrollContainer?.nativeElement) {
                      // Check again
                      termsEl.scrollTop = currentScroll; // Reset to original or 0
                    }
                  }, 300);
                }
              }
            }, 800); // Adjust delay as needed
          }
        }
      } else if (
        this.selectedPlanId &&
        !this.termsScrollContainer?.nativeElement
      ) {
        // This can happen if *ngIf logic is complex or there's an unexpected DOM state.
        // Arm failsafe as a backup.
        console.warn(
          'Terms container element not found after plan selection and DOM update. Arming failsafe.'
        );
        this.resetAndArmFailsafeTimer();
      }
    });
  }

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

  getTemplatePrice(): number {
    const plan = this.templatePlan?.toLowerCase() || 'standard';
    return this.planPrices[plan as keyof typeof this.planPrices] || 99;
  }

  getTemplatePriceDisplay(): string {
    return `$${this.getTemplatePrice()}`;
  }

  calculateTotalPrice(): string {
    if (!this.selectedPlanId) return this.getTemplatePriceDisplay();
    const selectedPlan = this.subscriptionPlans.find(
      (p) => p.id === this.selectedPlanId
    );
    if (!selectedPlan) return this.getTemplatePriceDisplay();

    const templatePrice = this.getTemplatePrice();
    const subscriptionPrice = selectedPlan.priceCents / 100;
    return `$${templatePrice + subscriptionPrice}`;
  }

  continueToPayment(): void {
    if (!this.templateId || !this.selectedPlanId || this.isProcessing) {
      this.errorMessage = "Can't proceed: Missing template or plan selection";
      return;
    }
    if (!this.termsAccepted) {
      this.errorMessage = 'Please accept the Terms and Conditions to continue';
      return;
    }
    this.isProcessing = true;
    this.errorMessage = null;
    this.cdr.detectChanges();

    this.userBuildService
      .initiateCombinedCheckout(this.templateId, this.selectedPlanId)
      .pipe(
        finalize(() => {
          this.isProcessing = false;
          this.cdr.detectChanges(); // Ensure UI reflects end of processing
        })
      )
      .subscribe({
        next: (checkoutUrl) => {
          if (!checkoutUrl) {
            throw new Error('Invalid checkout URL received from server');
          }
          window.location.href = checkoutUrl;
        },
        error: (error) => {
          console.error('Checkout error:', error);
          this.errorMessage =
            'Failed to initialize checkout. Please try again.';
          // isProcessing handled by finalize
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/app/templates']);
  }

  getSelectedPlan(): SubscriptionPlan | undefined {
    if (!this.selectedPlanId) return undefined;
    return this.subscriptionPlans.find(
      (plan) => plan.id === this.selectedPlanId
    );
  }

  getTemplateTypeDisplay(): string {
    return this.templateType || 'Business Website';
  }
}
