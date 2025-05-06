import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
  DestroyRef,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  Router,
  RouterModule,
  ActivatedRoute,
  NavigationExtras,
} from '@angular/router';
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
import { finalize, switchMap, of, catchError } from 'rxjs';

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
export class BuildsComponent implements OnInit, AfterViewInit {
  builds = signal<BuildWithUIState[]>([]);
  loading = signal(true);
  initialLoadingComplete = signal(false);
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
  private route = inject(ActivatedRoute);

  // Add a property to track pending buildId selection
  pendingBuildIdToSelect: string | null = null;

  @ViewChildren('buildItemRef') buildItemRefs!: QueryList<ElementRef>;
  @ViewChildren('buildItemsContainer')
  buildItemsContainer!: QueryList<ElementRef>;

  iframeReloadToken = signal<number>(Date.now());
  iframeLoadTimeout: any = null;

  showEmptyState = computed(() => {
    // Only show empty state when:
    // 1. Initial loading is complete (no flickers during first load)
    // 2. Regular loading is complete
    // 3. No errors
    // 4. No builds
    // 5. No pending buildId selection
    return (
      this.initialLoadingComplete() &&
      !this.loading() &&
      !this.error() &&
      !this.hasBuilds() &&
      !this.pendingBuildIdToSelect
    );
  });

  constructor() {
    // Setup the effect in constructor for proper injection context
    effect(() => {
      // Only reset iframe loading when selected build changes
      const buildId = this.selectedBuildId();

      // Only run this logic when data has loaded and we have a selectedBuildId
      if (!this.loading() && buildId) {
        // Reset loading state for iframe only if we're not already loading
        this.iframeLoading.set(true);

        const build = this.builds().find((build) => build.id === buildId);

        // If build ID is set but build not found
        if (!build && buildId) {
          console.warn(
            `Selected build ID ${buildId} not found in ${
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
    // Ensure loading state is true immediately
    this.loading.set(true);

    // Wait a moment to ensure loading is displayed before starting API calls
    // This solves the flickering issue by ensuring the loading state is visible first
    setTimeout(() => {
      // Check for buildId query parameter from subscription-success page
      // and handle pagination to find it if necessary
      this.route.queryParams
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          switchMap((params) => {
            if (params['buildId']) {
              const buildIdFromUrl = params['buildId'];
              // Store it so we can clear it later
              this.pendingBuildIdToSelect = buildIdFromUrl;

              // Try current page first
              return this.userBuildService
                .getUserBuilds({
                  page: this.currentPage(),
                  size: this.pageSize(),
                })
                .pipe(
                  switchMap(
                    (
                      response:
                        | ApiResponse<ExtendedUserBuild>
                        | ExtendedUserBuild[]
                    ) => {
                      if (
                        this.buildExistsInResponse(response, buildIdFromUrl)
                      ) {
                        // Build is on the current page, load normally
                        return of(null);
                      } else {
                        // Build isn't on the current page, we need to search for it
                        // Try to get single build to ensure it exists and to see its details
                        return this.userBuildService
                          .getUserBuildById(buildIdFromUrl)
                          .pipe(catchError(() => of(null)));
                      }
                    }
                  )
                );
            }
            return of(null);
          })
        )
        .subscribe((maybeBuild) => {
          if (maybeBuild && this.pendingBuildIdToSelect) {
            // We found the build but it's not on the current page.
            // Let's search through pages to find it.
            this.searchForBuildInPages(this.pendingBuildIdToSelect);
          } else {
            // Either we don't have a buildId or the build is on the current page
            // Just load normally
            this.loadBuilds();
          }
        });
    }, 10); // Small delay to ensure loading state is rendered first
  }

  // Helper to check if a build exists in the API response
  private buildExistsInResponse(
    response: ApiResponse<ExtendedUserBuild> | ExtendedUserBuild[] | null,
    buildId: string
  ): boolean {
    if (!response) return false;

    let builds: ExtendedUserBuild[] = [];
    if (Array.isArray(response)) {
      builds = response;
    } else if (response && 'content' in response) {
      builds = response.content;
    }

    return builds.some((b) => b.id === buildId);
  }

  // Search for a build by ID across pages
  private searchForBuildInPages(buildId: string, startPage: number = 0): void {
    this.loading.set(true);

    const searchNextPage = (currentPage: number) => {
      if (currentPage > 20) {
        // Reasonable limit to prevent infinite loops
        this.initialLoadingComplete.set(true); // Ensure initialLoadingComplete is set even if search fails
        this.loading.set(false);
        this.loadBuilds(); // Fall back to normal loading
        return;
      }

      this.userBuildService
        .getUserBuilds({
          page: currentPage,
          size: this.pageSize(),
        })
        .pipe(
          finalize(() => {
            if (this.loading()) {
              // Ensure initialLoadingComplete is set if loading ends unexpectedly
              this.initialLoadingComplete.set(true);
              this.loading.set(false);
            }
          })
        )
        .subscribe({
          next: (
            response: ApiResponse<ExtendedUserBuild> | ExtendedUserBuild[]
          ) => {
            if (this.buildExistsInResponse(response, buildId)) {
              // Found the build on this page
              this.currentPage.set(currentPage);
              this.loadBuilds(buildId);
              // Clear pending build ID after finding it
              this.pendingBuildIdToSelect = null;

              // Update URL without refreshing the page
              const extras: NavigationExtras = {
                queryParams: { buildId },
                queryParamsHandling: 'merge',
                replaceUrl: true,
              };
              this.router.navigate([], extras);
            } else {
              // Not found, try next page
              searchNextPage(currentPage + 1);
            }
          },
          error: () => {
            this.initialLoadingComplete.set(true); // Ensure initialLoadingComplete is set on error
            this.loading.set(false);
            this.loadBuilds(); // Fall back to normal loading on error
          },
        });
    };

    searchNextPage(startPage);
  }

  loadBuilds(buildIdToSelect: string | null = null): void {
    // Already set loading to true at initialization, just ensure it's still true
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
          // Process the response first before ending loading state
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

          // Wait a small delay to ensure state updates are processed before ending loading
          // This prevents flickering between loading and empty state
          setTimeout(() => {
            // Update all state values with builds data
            this.builds.set(buildsArr as BuildWithUIState[]);
            this.totalPages.set(totalPages);
            this.totalElements.set(totalElements);
            this.isFirstPage.set(isFirst);
            this.isLastPage.set(isLast);

            // Process build selection first
            if (this.pendingBuildIdToSelect) {
              this.pendingBuildIdToSelect = null;
            }

            // Select build based on priority
            if (
              buildIdToSelect &&
              buildsArr.some((b) => b.id === buildIdToSelect)
            ) {
              this.selectedBuildId.set(buildIdToSelect);
              console.log('Selected build with ID:', buildIdToSelect);
            } else {
              // Fall back to normal selection logic
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
            }

            // Set iframe loading and finalize by turning off the loading state
            this.iframeLoading.set(true);

            // Mark initial loading as complete - this prevents empty state flashing after first load
            this.initialLoadingComplete.set(true);

            // Only turn off loading once everything is ready to be displayed
            this.loading.set(false);

            // Schedule scrolling to the selected build after DOM updates
            setTimeout(() => {
              this.scrollToSelectedBuild();
            }, 100);
          }, 100); // Add small delay to ensure proper sequencing
        },
        error: (err) => {
          console.error('Error loading builds:', err);
          this.error.set('Failed to load your builds. Please try again.');
          // Still mark initial loading as complete since we have an error to show
          this.initialLoadingComplete.set(true);
          this.loading.set(false);
        },
      });
  }

  nextPage(): void {
    if (!this.isLastPage()) {
      this.currentPage.update((page) => page + 1);
      this.iframeLoading.set(true);
      this.loadBuilds();
    }
  }

  previousPage(): void {
    if (!this.isFirstPage()) {
      this.currentPage.update((page) => page - 1);
      this.iframeLoading.set(true);
      this.loadBuilds();
    }
  }

  /**
   * Select a build by ID
   */
  selectBuild(buildId: string): void {
    if (this.selectedBuildId() !== buildId) {
      this.selectedBuildId.set(buildId);
      this.iframeLoading.set(true);
      this.iframeReloadToken.set(Date.now());
      this.setIframeLoadFallback();
      this.scrollToSelectedBuild();
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

  getTemplateName(build: any): string {
    try {
      if (!build) return 'Unnamed Template';

      // First check for direct name property
      if (build.name) {
        return build.name;
      }

      // Then check userTemplate path
      if (build?.userTemplate?.name) {
        return build.userTemplate.name;
      }

      // Then check template nested path
      if (build?.userTemplate?.template?.name) {
        return build.userTemplate.template.name;
      }

      return 'Unnamed Template';
    } catch (err) {
      return 'Unnamed Template';
    }
  }

  getPlanType(build: any): string {
    try {
      if (!build) return 'standard';

      if (build?.templatePlan?.type) {
        // Always convert to lowercase for consistent plan usage
        return build.templatePlan.type.toLowerCase();
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
                  this.iframeLoading.set(true);
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
            this.iframeLoading.set(true);
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
    this.iframeLoading.set(true);
    this.iframeReloadToken.set(Date.now());
    this.setIframeLoadFallback();
    this.scrollToSelectedBuild();

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

  onIframeLoad(): void {
    if (this.iframeLoadTimeout) {
      clearTimeout(this.iframeLoadTimeout);
      this.iframeLoadTimeout = null;
    }
    setTimeout(() => {
      this.iframeLoading.set(false);
    }, 100);
  }

  setIframeLoadFallback(): void {
    if (this.iframeLoadTimeout) {
      clearTimeout(this.iframeLoadTimeout);
    }
    this.iframeLoadTimeout = setTimeout(() => {
      this.iframeLoading.set(false);
      this.iframeLoadTimeout = null;
    }, 5000); // 5 seconds fallback
  }

  private scrollToSelectedBuild(): void {
    setTimeout(() => {
      const selectedId = this.selectedBuildId();
      if (!selectedId || !this.buildItemRefs) return;
      const selectedEl = this.buildItemRefs.find(
        (ref) => ref.nativeElement?.dataset?.buildId === selectedId
      )?.nativeElement;
      const container = document.querySelector('.build-items');
      if (selectedEl && container) {
        const elRect = selectedEl.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (
          elRect.top < containerRect.top ||
          elRect.bottom > containerRect.bottom
        ) {
          selectedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
  }

  ngAfterViewInit(): void {
    // Scroll to selected build after view init
    this.scrollToSelectedBuild();
    // Watch for changes in selection using effect
    effect(() => {
      this.selectedBuildId();
      this.scrollToSelectedBuild();
    });
  }
}
