import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { interval, Subscription, EMPTY, of, Observable } from 'rxjs';
import { startWith, switchMap, takeWhile } from 'rxjs/operators';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import {
  UserBuildService,
  UserBuild,
} from '../../../core/services/build/user-build.service';
import { ConfirmationService } from '../../../core/services/shared/confirmation/confirmation.service';

interface BuildStep {
  name: string;
  description: string;
  isComplete: boolean;
  icon: string;
  percentage: number;
}

// Extended interface to match actual API response format
interface ExtendedUserBuild extends UserBuild {
  address?: {
    address: string;
    loadBalancerAddress?: string;
  };
  userTemplate?: {
    id: string;
    name: string;
    template?: {
      id: string;
      name: string;
      description?: string;
      templatePlan?: {
        id: string;
        type: string;
        description?: string;
        priceCents?: number;
      };
      templateType?: {
        id: string;
        name: string;
        key: string;
      };
    };
  };
  userBuildSubscription?: {
    status: string;
    createdAt: string;
  };
}

@Component({
  selector: 'app-subscription-success',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './subscription-success.component.html',
  styleUrls: ['./subscription-success.component.scss'],
})
export class SubscriptionSuccessComponent implements OnInit, OnDestroy {
  isPolling = true; // Start with polling active
  isComplete = false;
  hasError = false;
  maxPollingAttempts = 20; // 20 attempts x 3s = 60s timeout
  pollingAttempts = 0;
  statusMessage = 'Preparing your website for publishing...';
  siteUrl: string | null = null;
  templateName: string | null = null;
  businessType: string | null = null;
  templatePlanType: string | null = null;
  buildId: string | null = null;
  subscriptionDate: string | null = null;

  // Build progress tracking
  buildProgress = 5; // Start with 5% to show immediate progress
  forcedDelay = true; // Always show animation even if build is already complete
  buildSteps: BuildStep[] = [
    {
      name: 'Initializing',
      description: 'Setting up your website environments',
      isComplete: false,
      icon: 'template',
      percentage: 10,
    },
    {
      name: 'Content Processing',
      description: 'Processing your customized content',
      isComplete: false,
      icon: 'edit',
      percentage: 30,
    },
    {
      name: 'Assets Optimization',
      description: 'Optimizing images and media',
      isComplete: false,
      icon: 'view',
      percentage: 50,
    },
    {
      name: 'Deployment',
      description: 'Deploying to high-performance servers',
      isComplete: false,
      icon: 'desktop',
      percentage: 75,
    },
    {
      name: 'DNS Configuration',
      description: 'Configuring your website address',
      isComplete: false,
      icon: 'domain',
      percentage: 90,
    },
    {
      name: 'Final Checks',
      description: 'Running quality assurance tests',
      isComplete: false,
      icon: 'check',
      percentage: 100,
    },
  ];
  currentStepIndex = 0;

  // UI states
  showCopySuccess = false;

  private pollingSubscription: Subscription | null = null;
  private buildAnimationSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userBuildService: UserBuildService,
    private confirmationService: ConfirmationService
  ) {
    // Start animation as early as possible, even during component construction
    this.startBuildAnimation();
  }

  ngOnInit(): void {
    // First check URL params for userBuildId
    const queryParamBuildId =
      this.route.snapshot.queryParamMap.get('userBuildId');

    // Get the build ID from localStorage if not in URL params
    const localStorageBuildId = localStorage.getItem('pendingBuildId');

    // Use URL param first, fall back to localStorage
    this.buildId = queryParamBuildId || localStorageBuildId;

    if (!this.buildId) {
      this.handleError('No pending build found. Please try again.');
      return;
    }

    // Start polling after a very short delay
    setTimeout(() => {
      this.startPollingBuildStatus(this.buildId!);
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    if (this.buildAnimationSubscription) {
      this.buildAnimationSubscription.unsubscribe();
    }
  }

  /**
   * Helper to determine if a build is published
   */
  private isBuildPublished(status: string): boolean {
    // Support both 'ACTIVE' and 'PUBLISHED' as published statuses
    return status === 'ACTIVE' || status === 'PUBLISHED';
  }

  /**
   * Start a visual animation of the build process
   * This runs independently of actual build status to ensure a good UX
   */
  private startBuildAnimation(): void {
    // Immediately make the first step active
    this.buildSteps[0].isComplete = true;
    this.buildProgress = this.buildSteps[0].percentage;

    // Move through build steps on a predefined timeline
    this.buildAnimationSubscription = interval(3000)
      .pipe(
        startWith(500), // Start after just 500ms for immediate visual feedback
        takeWhile(
          () =>
            this.currentStepIndex < this.buildSteps.length - 1 &&
            !this.isComplete
        )
      )
      .subscribe(() => {
        if (this.currentStepIndex < this.buildSteps.length - 1) {
          // Move to next step
          this.currentStepIndex++;

          // Mark current step as complete
          this.buildSteps[this.currentStepIndex].isComplete = true;

          // Update progress
          this.buildProgress =
            this.buildSteps[this.currentStepIndex].percentage;

          // Update status message based on current step
          this.statusMessage = `${
            this.buildSteps[this.currentStepIndex].name
          }...`;
        }
      });
  }

  /**
   * Poll the build status using GET /api/user-build/{id} every 3s
   * Stop when status is published, error, or timeout
   */
  private startPollingBuildStatus(buildId: string): void {
    this.pollingSubscription = interval(3000)
      .pipe(
        startWith(0),
        switchMap(() => {
          this.pollingAttempts++;
          return this.userBuildService.getUserBuildById(
            buildId
          ) as Observable<ExtendedUserBuild>;
        }),
        takeWhile((build: ExtendedUserBuild) => {
          // Capture additional data from the response
          if (build.userTemplate?.name) {
            this.templateName = build.userTemplate.name;
          }

          if (build.userTemplate?.template?.templateType?.name) {
            this.businessType = build.userTemplate.template.templateType.name;
          }

          if (build.userTemplate?.template?.templatePlan?.type) {
            this.templatePlanType =
              build.userTemplate.template.templatePlan.type;
          }

          if (build.userBuildSubscription?.createdAt) {
            this.subscriptionDate = build.userBuildSubscription.createdAt;
          }

          // Get site URL from address object or fallback to siteUrl property
          if (build.address?.address) {
            this.siteUrl = build.address.address;
          } else if (build.siteUrl) {
            this.siteUrl = build.siteUrl;
          }

          // Continue polling if not published and not timed out
          const continuePolling =
            !this.isBuildPublished(build.status) &&
            this.pollingAttempts < this.maxPollingAttempts;

          // Handle published state
          if (this.isBuildPublished(build.status)) {
            // If we want to show full animation, delay success slightly
            if (
              this.forcedDelay &&
              this.currentStepIndex < this.buildSteps.length - 2
            ) {
              // Don't mark as complete yet, let animation finish
              return true;
            } else {
              this.handleSuccess(build);
              return false; // Stop polling
            }
          } else if (this.pollingAttempts >= this.maxPollingAttempts) {
            this.handleTimeout();
            return false; // Stop polling due to timeout
          }

          return continuePolling;
        })
      )
      .subscribe({
        error: (err) => {
          console.error('Error during build status polling:', err);
          this.handleError(
            'An error occurred while checking your website status.'
          );
        },
        complete: () => {
          // Polling complete, but if not success or error, it's a timeout
          if (this.isPolling) {
            this.handleTimeout();
          }
        },
      });
  }

  private handleSuccess(buildData: ExtendedUserBuild): void {
    // Ensure all steps are complete
    this.buildSteps.forEach((step) => (step.isComplete = true));
    this.buildProgress = 100;

    // Update component state
    this.isPolling = false;
    this.isComplete = true;
    this.statusMessage = 'Your website has been published successfully!';

    // Clean up
    localStorage.removeItem('pendingBuildId');

    // Show success message
    this.confirmationService.showConfirmation(
      'Website published successfully!',
      'success',
      5000
    );
  }

  private handleError(message: string): void {
    this.isPolling = false;
    this.hasError = true;
    this.statusMessage = message;
    this.confirmationService.showConfirmation(message, 'error', 5000);
  }

  private handleTimeout(): void {
    this.isPolling = false;
    this.hasError = true;
    this.statusMessage =
      'Your request is taking longer than expected. You can check the status in "My Builds" later.';
    localStorage.removeItem('pendingBuildId'); // Clean up
    this.confirmationService.showConfirmation(
      'Timeout while waiting for your website to be published. Please check the status in "My Builds" later.',
      'warning',
      5000
    );
  }

  /**
   * Format a date string into a readable format
   */
  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  }

  copyToClipboard(): void {
    if (this.siteUrl) {
      navigator.clipboard
        .writeText(this.siteUrl)
        .then(() => {
          this.showCopySuccess = true;
          setTimeout(() => {
            this.showCopySuccess = false;
          }, 2000);
        })
        .catch(() => {
          this.confirmationService.showConfirmation(
            'Failed to copy URL.',
            'error',
            3000
          );
        });
    }
  }

  visitSite(): void {
    if (this.siteUrl) {
      window.open(this.siteUrl, '_blank');
    }
  }

  goToBuilds(): void {
    this.router.navigate(['/app/builds']);
  }

  goToDashboard(): void {
    this.router.navigate(['/app/templates']);
  }
}
