import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { interval, Subscription, of, Observable, catchError } from 'rxjs';
import { startWith, switchMap, takeWhile } from 'rxjs/operators';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { UserBuildService } from '../../../core/services/build/user-build.service';
import {
  UserBuild,
  ExtendedUserBuild,
  BuildStatus,
} from '../../../core/models/user-build.model';
import { ConfirmationService } from '../../../core/services/shared/confirmation/confirmation.service';

interface BuildStep {
  name: string;
  description: string;
  isComplete: boolean;
  icon: string;
  percentage: number;
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
  subscriptionDate: string | null = null;
  userTemplateId: string | null = null;

  // Build progress tracking
  buildProgress = 5; // Start with 5% to show immediate progress
  minAnimationDuration = 4000; // Minimum animation duration in ms
  animationStartTime = 0; // When animation began

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
    this.animationStartTime = Date.now();
    this.startBuildAnimation();
  }

  ngOnInit(): void {
    // Get userTemplateId from query params
    this.userTemplateId =
      this.route.snapshot.queryParamMap.get('userTemplateId');
    if (!this.userTemplateId) {
      this.handleError('No template found. Please try again.');
      return;
    }

    // Start polling after a short delay
    setTimeout(() => {
      this.startPollingBuildStatus(this.userTemplateId!);
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
   * Check if a build is in published state
   */
  private isBuildPublished(status: BuildStatus | undefined): boolean {
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
   * Poll the build status API every 3 seconds
   * Continue until we get a valid published result or timeout
   */
  private startPollingBuildStatus(userTemplateId: string): void {
    this.isPolling = true;
    this.hasError = false;
    this.pollingAttempts = 0;

    this.pollingSubscription = interval(3000)
      .pipe(
        startWith(0), // Start immediately
        switchMap(() => {
          this.pollingAttempts++;

          // Call the API and handle errors at this level
          return this.userBuildService
            .getUserBuildByTemplateId(userTemplateId)
            .pipe(
              catchError((error) => {
                console.error('Error fetching build status:', error);
                // Return null instead of erroring the whole stream
                // This allows polling to continue despite intermittent errors
                return of(null);
              })
            );
        }),
        takeWhile((build) => {
          // If we've reached max attempts, stop polling with timeout
          if (this.pollingAttempts >= this.maxPollingAttempts) {
            this.handleTimeout();
            return false;
          }

          // If response is null/undefined, keep polling
          if (!build) {
            return true;
          }

          // Extract data from the response
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
          if (build.address?.address) {
            this.siteUrl = build.address.address;
          } else if (build.siteUrl) {
            this.siteUrl = build.siteUrl;
          }

          // Check if build is published
          const isPublished = this.isBuildPublished(build.status);

          if (isPublished) {
            // When we have a successful published build
            const elapsed = Date.now() - this.animationStartTime;

            // Ensure minimum animation time for good UX
            if (elapsed < this.minAnimationDuration) {
              setTimeout(() => {
                this.handleSuccess(build);
              }, this.minAnimationDuration - elapsed);
            } else {
              this.handleSuccess(build);
            }
            return false; // Stop polling
          }

          // Continue polling while waiting for published status
          return true;
        })
      )
      .subscribe({
        error: (err) => {
          console.error('Fatal error during build status polling:', err);
          this.handleError(
            'An error occurred while checking your website status.'
          );
        },
        complete: () => {
          // If polling wasn't explicitly stopped by a success or timeout handler,
          // and we're still in polling state, treat it as a timeout
          if (this.isPolling) {
            this.handleTimeout();
          }
        },
      });
  }

  private handleSuccess(buildData: ExtendedUserBuild): void {
    this.isPolling = false;
    this.isComplete = true;
    this.hasError = false;

    // Complete all steps
    this.buildSteps.forEach((step) => (step.isComplete = true));
    this.buildProgress = 100;
    this.statusMessage = 'Your website has been published successfully!';

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
