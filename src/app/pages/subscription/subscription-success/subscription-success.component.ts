import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { interval, Subscription, EMPTY, of } from 'rxjs';
import { startWith, switchMap, takeWhile, delay } from 'rxjs/operators';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { UserBuildService } from '../../../core/services/build/user-build.service';
import { ConfirmationService } from '../../../core/services/shared/confirmation/confirmation.service';

@Component({
  selector: 'app-subscription-success',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './subscription-success.component.html',
  styleUrls: ['./subscription-success.component.scss'],
})
export class SubscriptionSuccessComponent implements OnInit, OnDestroy {
  isPolling = false;
  isComplete = false;
  hasError = false;
  maxPollingAttempts = 20; // 20 attempts x 3s = 60s timeout
  pollingAttempts = 0;
  statusMessage = 'Verifying payment...';
  siteUrl: string | null = null;
  isTestMode = false;

  // UI states
  showCopySuccess = false;

  private pollingSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userBuildService: UserBuildService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    // First check URL params for userBuildId
    const queryParamBuildId =
      this.route.snapshot.queryParamMap.get('userBuildId');

    // Get the build ID from localStorage if not in URL params
    const localStorageBuildId = localStorage.getItem('pendingBuildId');

    // Use URL param first, fall back to localStorage
    const buildId = queryParamBuildId || localStorageBuildId;

    if (!buildId) {
      this.handleError('No pending build found. Please try again.');
      return;
    }

    // Check if we're in test mode (test- prefix)
    this.isTestMode = buildId.startsWith('test-');

    if (this.isTestMode) {
      console.log('Running in TEST MODE with mock build ID:', buildId);
      this.startTestModePolling();
    } else {
      this.startPolling(buildId);
    }
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  /**
   * Start simulated polling for test mode
   */
  private startTestModePolling(): void {
    this.isPolling = true;
    let simulatedAttempts = 0;

    this.pollingSubscription = interval(1000) // Faster for testing
      .pipe(
        startWith(0),
        switchMap(() => {
          simulatedAttempts++;
          this.pollingAttempts = simulatedAttempts;

          // Simulate success after 3 attempts
          if (simulatedAttempts >= 3) {
            return of({
              status: 'ACTIVE' as const,
              siteUrl: 'https://example-site-' + Date.now() + '.webcraft.com',
            });
          }

          // Otherwise return pending
          return of({
            status: 'PENDING' as const,
          });
        }),
        takeWhile((response) => {
          // Handle the response same as real polling
          if (response.status === 'ACTIVE') {
            this.handleSuccess(response.siteUrl || '');
            return false; // Stop polling
          }

          return simulatedAttempts < 3; // Continue until we hit attempt 3
        })
      )
      .subscribe({
        next: () => {
          // Intermediate polling updates
          if (this.isPolling) {
            this.statusMessage = `Payment verified, publishing your website... (${simulatedAttempts}/3)`;
          }
        },
        complete: () => {
          console.log('Test mode polling complete');
        },
      });
  }

  private startPolling(buildId: string): void {
    this.isPolling = true;

    this.pollingSubscription = interval(3000)
      .pipe(
        startWith(0),
        switchMap(() => {
          this.pollingAttempts++;
          return this.userBuildService.publishBuild(buildId);
        }),
        takeWhile((response) => {
          // Continue polling if status is PENDING and we haven't reached max attempts
          const continuePolling =
            response.status === 'PENDING' &&
            this.pollingAttempts < this.maxPollingAttempts;

          // Handle complete and error states
          if (response.status === 'ACTIVE') {
            this.handleSuccess(response.siteUrl || '');
            return false; // Stop polling
          } else if (response.status === 'FAILED') {
            this.handleError(
              response.message || 'Failed to publish your website.'
            );
            return false; // Stop polling
          } else if (this.pollingAttempts >= this.maxPollingAttempts) {
            this.handleTimeout();
            return false; // Stop polling due to timeout
          }

          return continuePolling;
        })
      )
      .subscribe({
        next: () => {
          // Intermediate polling updates
          if (this.isPolling) {
            this.statusMessage = `Payment verified, publishing your website... (${this.pollingAttempts}/${this.maxPollingAttempts})`;
          }
        },
        error: (err) => {
          console.error('Error during polling:', err);
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

  private handleSuccess(siteUrl: string): void {
    this.isPolling = false;
    this.isComplete = true;
    this.siteUrl = siteUrl;
    this.statusMessage = 'Your website has been published successfully!';
    localStorage.removeItem('pendingBuildId'); // Clean up
    if (!this.isTestMode) {
      this.confirmationService.showConfirmation(
        'Website published successfully!',
        'success',
        5000
      );
    }
  }

  private handleError(message: string): void {
    this.isPolling = false;
    this.hasError = true;
    this.statusMessage = message;
    if (!this.isTestMode) {
      this.confirmationService.showConfirmation(message, 'error', 5000);
    }
  }

  private handleTimeout(): void {
    this.isPolling = false;
    this.hasError = true;
    this.statusMessage =
      'Your request is taking longer than expected. You can check the status in "My Builds" later.';
    localStorage.removeItem('pendingBuildId'); // Clean up
    if (!this.isTestMode) {
      this.confirmationService.showConfirmation(
        'Timeout while waiting for your website to be published. Please check the status in "My Builds" later.',
        'warning',
        5000
      );
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
