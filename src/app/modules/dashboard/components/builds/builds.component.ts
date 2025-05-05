import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
  DestroyRef,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserBuildService } from '../../../../core/services/build/user-build.service';
import {
  ExtendedUserBuild,
  BuildStatus,
  ApiResponse,
} from '../../../../core/models/user-build.model';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { BuildStepsComponent } from '../../../../shared/components/build-steps/build-steps.component';
import { PlanBadgeComponent } from '../../../../shared/components/plan-badge/plan-badge.component';
import { SafeResourceUrlPipe } from '../../../../shared/pipes/safe-resource-url.pipe';
import { NgLetDirective } from '../../../../shared/directives/ng-let.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth/auth.service';

// Extend the build type to include UI state
interface BuildWithUIState extends ExtendedUserBuild {
  isPublishing?: boolean;
}

@Component({
  selector: 'app-builds',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IconComponent,
    BuildStepsComponent,
    DatePipe,
    PlanBadgeComponent,
    SafeResourceUrlPipe,
    NgLetDirective,
  ],
  templateUrl: './builds.component.html',
  styleUrls: ['./builds.component.scss'],
})
export class BuildsComponent implements OnInit {
  builds = signal<BuildWithUIState[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedBuildId = signal<string | null>(null);

  // Filters
  filterStatus = signal<string>('all');
  filteredBuilds = computed(() => {
    const status = this.filterStatus();
    const builds = this.builds();

    if (status === 'all') {
      return builds;
    } else if (status === 'published') {
      return builds.filter((build) => build.status === 'PUBLISHED');
    } else if (status === 'unpublished') {
      return builds.filter((build) => build.status === 'UNPUBLISHED');
    }

    return builds;
  });

  // Pagination state
  currentPage = signal(0);
  pageSize = signal(8);
  totalPages = signal(0);
  totalElements = signal(0);
  isFirstPage = signal(true);
  isLastPage = signal(true);

  // Iframe loading state
  iframeLoading = signal(false);

  hasBuilds = computed(() => this.filteredBuilds().length > 0);

  // Computed property for the selected build - should only read, not write to signals
  selectedBuild = computed(() => {
    const id = this.selectedBuildId();
    if (!id) {
      return null;
    }

    const build = this.builds().find((build) => build.id === id);
    return build || null;
  });

  // Status mapping for user-friendly display
  statusMap: Record<string, string> = {
    PENDING: 'Building',
    ACTIVE: 'Live',
    PUBLISHED: 'Live',
    UNPUBLISHED: 'Draft',
    STOPPED: 'Stopped',
    FAILED: 'Failed',
  };

  // Services
  private userBuildService = inject(UserBuildService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);

  constructor() {
    // Setup the effect in constructor for proper injection context
    effect(() => {
      // Only run this logic when data has loaded and we have a selectedBuildId
      if (!this.loading() && this.selectedBuildId()) {
        const id = this.selectedBuildId();
        const build = this.builds().find((build) => build.id === id);

        // If build ID is set but build not found
        if (!build && id) {
          console.warn(
            `Selected build ID ${id} not found in ${
              this.builds().length
            } builds. Available IDs: ${this.builds()
              .map((b) => b.id)
              .join(', ')}`
          );

          // Set an error message for the user
          this.error.set(
            'Could not find the selected website. Please try selecting another one.'
          );

          // If we have builds available, auto-select the first one after a delay
          if (this.builds().length > 0) {
            setTimeout(() => {
              this.selectedBuildId.set(this.builds()[0].id);
              // Clear the error once a new build is selected
              this.error.set(null);
            }, 500);
          }
        } else if (build) {
          // Clear any error if we found the build
          this.error.set(null);
        }
      }
    });
  }

  ngOnInit(): void {
    this.loadBuilds();
  }

  loadBuilds(): void {
    this.loading.set(true);
    this.error.set(null);

    // Use pagination parameters
    const params = {
      page: this.currentPage(),
      size: this.pageSize(),
    };

    this.userBuildService
      .getUserBuilds(params)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (
          response: ApiResponse<ExtendedUserBuild> | ExtendedUserBuild[]
        ) => {
          // Ensure we're handling the paginated response correctly
          let buildsArr: ExtendedUserBuild[] = [];
          let isFirst = true;
          let isLast = true;
          let totalPages = 1;
          let totalElements = 0;

          if (response && 'content' in response) {
            // Paginated response
            buildsArr = response.content;
            isFirst = response.first !== false; // Default to true if undefined
            isLast = response.last !== false; // Default to true if undefined
            totalPages = response.totalPages || 1;
            totalElements = response.totalElements || buildsArr.length;
          } else if (Array.isArray(response)) {
            // Array response
            buildsArr = response;
            isFirst = this.currentPage() === 0;
            isLast = true;
            totalPages = 1;
            totalElements = buildsArr.length;
          } else {
            // Unexpected response format
            console.error('Unexpected API response format:', response);
            this.error.set(
              'Received invalid data from the server. Please try again.'
            );
            this.loading.set(false);
            return;
          }

          this.builds.set(buildsArr as BuildWithUIState[]);
          this.totalPages.set(totalPages);
          this.totalElements.set(totalElements);
          this.isFirstPage.set(isFirst);
          this.isLastPage.set(isLast);

          // Handle build selection
          setTimeout(() => {
            const currentId = this.selectedBuildId();

            if (!currentId && buildsArr.length > 0) {
              // If no build is selected and we have builds, select the first one
              this.selectedBuildId.set(buildsArr[0].id);
            } else if (currentId) {
              // If a build is selected, check if it exists in the new data
              const found = buildsArr.find((b) => b.id === currentId);

              if (!found && buildsArr.length > 0) {
                // If not found, select the first build
                this.selectedBuildId.set(buildsArr[0].id);
              }
            }

            this.iframeLoading.set(true);
            this.loading.set(false);
          }, 0);
        },
        error: (err) => {
          console.error('Error loading builds:', err);
          this.error.set('Failed to load your builds. Please try again.');
          this.loading.set(false);
        },
      });
  }

  nextPage(): void {
    if (!this.isLastPage()) {
      this.currentPage.update((page) => page + 1);
      this.loadBuilds();
    }
  }

  previousPage(): void {
    if (!this.isFirstPage()) {
      this.currentPage.update((page) => page - 1);
      this.loadBuilds();
    }
  }

  /**
   * Reset iframe loading state when a new build is selected
   * This ensures the loading state is properly shown when changing builds
   */
  resetIframeLoading(): void {
    this.iframeLoading.set(true);
  }

  /**
   * Select a build by ID
   */
  selectBuild(buildId: string): void {
    if (this.selectedBuildId() !== buildId) {
      this.selectedBuildId.set(buildId);
      this.resetIframeLoading();
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
      case 'PUBLISHED':
        return 'status-live';
      case 'PENDING':
        return 'status-building';
      case 'FAILED':
        return 'status-failed';
      case 'UNPUBLISHED':
        return 'status-draft';
      case 'STOPPED':
        return 'status-stopped';
      default:
        return 'status-unknown';
    }
  }

  getBuildType(build: ExtendedUserBuild): string {
    try {
      if (!build) return 'Unknown';

      if (build?.userTemplate?.template?.templateType) {
        const templateType = build.userTemplate.template.templateType;
        // Return the name if available, otherwise return the key with first letter capitalized
        return (
          templateType.name ||
          (templateType.key
            ? templateType.key.charAt(0).toUpperCase() +
              templateType.key.slice(1)
            : 'Unknown')
        );
      }
      return 'Unknown';
    } catch (err) {
      return 'Unknown';
    }
  }

  getTemplateName(build: ExtendedUserBuild): string {
    try {
      if (!build) return 'Unnamed Template';

      // First check userTemplate.name, then template.name if available
      if (build?.userTemplate?.name) {
        return build.userTemplate.name;
      } else if (build?.userTemplate?.template?.name) {
        return build.userTemplate.template.name;
      }
      return 'Unnamed Template';
    } catch (err) {
      return 'Unnamed Template';
    }
  }

  getPlanType(build: ExtendedUserBuild): string {
    try {
      if (!build) return 'standard';

      if (build?.userTemplate?.template?.templatePlan?.type) {
        // Always convert to lowercase for consistent plan usage
        return build.userTemplate.template.templatePlan.type.toLowerCase();
      }
      return 'standard';
    } catch (err) {
      return 'standard';
    }
  }

  formatCreatedDate(dateString?: string | null): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Check if date is valid before formatting
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'N/A';
    }
  }

  getWebsiteUrl(build: ExtendedUserBuild): string | null {
    try {
      if (!build) return null;

      // First check direct siteUrl property, then address.address if it exists and is not null
      let url = build?.siteUrl || (build?.address?.address ?? null);

      // If URL is null but we have loadBalancerAddress, use that as fallback
      if (!url && build?.address?.loadBalancerAddress) {
        url = build.address.loadBalancerAddress;
      }

      // Ensure URL has proper protocol
      if (url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
      }

      return url;
    } catch (err) {
      return null;
    }
  }

  getBuildCreatedDate(build: ExtendedUserBuild): string | null {
    try {
      if (!build) return null;

      // Check multiple possible locations for date information
      if (build?.userBuildSubscription?.createdAt) {
        return build.userBuildSubscription.createdAt;
      } else if (build?.createdAt) {
        return build.createdAt;
      }
      // Return null if no date is found
      return null;
    } catch (err) {
      return null;
    }
  }

  openLiveWebsite(build: ExtendedUserBuild): void {
    const url = this.getWebsiteUrl(build);
    if (url) {
      window.open(url, '_blank');
    }
  }

  handleNewBuild(): void {
    this.router.navigate(['/preview']);
  }

  /**
   * Refreshes the iframe by forcing a reload
   * @param url The URL to refresh
   */
  refreshIframe(url: string): void {
    if (!url) {
      console.error('Cannot refresh iframe: No URL provided');
      return;
    }

    this.iframeLoading.set(true);

    // Force iframe refresh by toggling a query parameter
    const iframe = document.querySelector(
      '.website-preview-iframe'
    ) as HTMLIFrameElement;

    if (!iframe) {
      console.error('Cannot refresh iframe: No iframe element found');
      this.iframeLoading.set(false);
      return;
    }

    try {
      // Add or update a timestamp parameter to force reload
      let refreshUrl: string;

      if (url.includes('://')) {
        // Standard URL handling
        const urlObj = new URL(url);
        urlObj.searchParams.set('t', Date.now().toString());
        refreshUrl = urlObj.toString();
      } else {
        // Fallback if URL is not properly formatted
        refreshUrl = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
      }

      // Apply the URL to the iframe
      setTimeout(() => {
        iframe.src = refreshUrl;
      }, 100);
    } catch (err) {
      // Fallback if URL parsing fails
      console.error('Error refreshing iframe:', err);
      setTimeout(() => {
        iframe.src = url;
      }, 100);
    }
  }

  refreshBuildStatus(buildId: string): void {
    if (!buildId) {
      console.error('Invalid build ID for refresh');
      return;
    }

    this.userBuildService
      .getUserBuildById(buildId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updatedBuild) => {
          if (!updatedBuild) {
            this.error.set('Could not refresh build status. Please try again.');
            return;
          }

          const buildList = [...this.builds()];
          const index = buildList.findIndex((b) => b.id === buildId);

          if (index !== -1) {
            // Replace the existing build with the updated one
            buildList[index] = updatedBuild as BuildWithUIState;
            this.builds.set(buildList);

            // If this is the currently selected build, ensure UI updates
            if (this.selectedBuildId() === buildId) {
              // Force a UI refresh by toggling the selection
              const currentId = this.selectedBuildId();
              this.selectedBuildId.set(null);
              setTimeout(() => {
                this.selectedBuildId.set(currentId);
                // If the status has changed to PUBLISHED, reset iframe
                if (updatedBuild.status === 'PUBLISHED') {
                  this.resetIframeLoading();
                }
              }, 10);
            }
          } else {
            // If the build wasn't in the list, add it
            this.builds.update((builds) => [
              ...builds,
              updatedBuild as BuildWithUIState,
            ]);

            // If no build is currently selected, select this one
            if (!this.selectedBuildId()) {
              this.selectedBuildId.set(buildId);
            }
          }
        },
        error: (err) => {
          console.error('Error refreshing build status:', err);

          // Set appropriate error message based on the error
          if (err.message && err.message.includes('not found')) {
            this.error.set(
              `The website build could not be found. It may have been deleted.`
            );

            // Remove this build from the list if it's no longer on the server
            this.builds.update((builds) =>
              builds.filter((build) => build.id !== buildId)
            );

            // If this was the selected build, auto-select another one
            if (
              this.selectedBuildId() === buildId &&
              this.builds().length > 0
            ) {
              this.selectedBuildId.set(this.builds()[0].id);
            }
          } else {
            this.error.set('Failed to refresh build status. Please try again.');
          }
        },
      });
  }

  // Publish template
  publishTemplate(build: BuildWithUIState): void {
    if (!build || build.isPublishing) return;

    // Set publishing state
    build.isPublishing = true;
    this.updateBuildInList(build);

    // Check authentication first
    if (!this.authService.isAuthenticated()) {
      build.isPublishing = false;
      this.updateBuildInList(build);
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    // For unpublished builds, redirect to subscription selection page
    if (build.status === 'UNPUBLISHED') {
      const templateId = build.userTemplate?.id;
      const templateName = this.getTemplateName(build);
      const templatePlan = this.getPlanType(build);

      if (templateId) {
        this.router.navigate(['/subscription-selection'], {
          queryParams: {
            templateId: templateId,
            templateName: templateName,
            templatePlan: templatePlan,
            buildId: build.id,
          },
        });
        build.isPublishing = false;
        this.updateBuildInList(build);
        return;
      }
    }

    // If we don't have template info or for other cases, call the publish API directly
    this.userBuildService
      .publishBuild(build.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          // Update local state
          build.isPublishing = false;
          build.status = 'PUBLISHED';
          if (response.siteUrl) {
            build.siteUrl = response.siteUrl;
          }
          this.updateBuildInList(build);

          // If this is the current selected build, refresh the iframe
          if (this.selectedBuildId() === build.id) {
            this.resetIframeLoading();
          }
        },
        error: (err) => {
          build.isPublishing = false;
          this.updateBuildInList(build);
          this.error.set('Failed to publish website. Please try again.');
          console.error('Error publishing build:', err);
        },
      });
  }

  // Helper to update a build in the list
  private updateBuildInList(updatedBuild: BuildWithUIState): void {
    const builds = this.builds();
    const index = builds.findIndex((b) => b.id === updatedBuild.id);

    if (index >= 0) {
      builds[index] = updatedBuild;
      this.builds.set([...builds]);
    }
  }

  // Apply filter
  setFilter(filter: string): void {
    this.filterStatus.set(filter);

    // If current selection is not in filtered results, select first filtered item
    const currentId = this.selectedBuildId();
    const filtered = this.filteredBuilds();

    if (filtered.length > 0) {
      const currentBuildInFiltered = filtered.some(
        (build) => build.id === currentId
      );

      if (!currentBuildInFiltered) {
        this.selectedBuildId.set(filtered[0].id);
      }
    }
  }
}
