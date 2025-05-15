import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  signal,
  computed,
  DestroyRef,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  BehaviorSubject,
  Observable,
  of,
  switchMap,
  combineLatest,
  tap,
  catchError,
  map,
  filter,
  EMPTY,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserTemplateService } from '../../../../core/services/template/user-template.service';
import { SelectionStateService } from '../../../../core/services/selection/selection-state.service';
import {
  TemplateService,
  PageResponse,
} from '../../../../core/services/template/template.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { PlanBadgeComponent } from '../../../../shared/components/plan-badge/plan-badge.component';
import { SafeResourceUrlPipe } from '../../../../shared/pipes/safe-resource-url.pipe';
import { TemplateControlsComponent } from './components/template-controls/template-controls.component';
import { TemplateListComponent } from './components/template-list/template-list.component';
import { TemplateCardComponent } from './components/template-card/template-card.component';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { UserBuildService } from '../../../../core/services/build/user-build.service';
import { ConfirmationService } from '../../../../core/services/shared/confirmation/confirmation.service';

// Define TemplateStatus enum
export enum TemplateStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
  Stopped = 'STOPPED',
}

// Define our extended UserTemplate interface
export interface UserTemplate {
  id: string;
  name: string;
  type: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  thumbnailUrl?: string;
  plan?: 'standard' | 'premium';
  isPublishing?: boolean;
  userBuild?: {
    id: string;
    status: 'PUBLISHED' | 'STOPPED';
    address?: string;
    subscriptionId?: string;
  } | null;
  status: TemplateStatus;
  url?: string;
  // Optional template property for backward compatibility with the API interfaces
  template?: {
    id: string;
    name: string;
    description?: string;
    templateType?: {
      id: string;
      name: string;
      key: string;
    };
    templatePlan?: {
      id: string;
      type: string;
      priceCents?: number;
    };
  };
}

// Type alias for service response mapping
type ServiceUserTemplate = any; // Use any temporarily to avoid conflicts

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    DatePipe,
    PlanBadgeComponent,
    SafeResourceUrlPipe,
    TemplateControlsComponent,
    TemplateListComponent,
    TemplateCardComponent,
  ],
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplatesComponent implements OnInit, OnDestroy {
  // State observables
  private loadingSubject = new BehaviorSubject<boolean>(true);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private searchTermSubject = new BehaviorSubject<string>('');
  private filterSubject = new BehaviorSubject<string>('all');
  private templatesSubject = new BehaviorSubject<UserTemplate[]>([]);
  private currentRequest: Subscription | null = null;
  private destroyRef = inject(DestroyRef);

  // Expose as observables
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  // Main data stream with more reliable error handling
  templates$ = combineLatest([
    this.templatesSubject.asObservable(),
    this.errorSubject.asObservable(),
  ]).pipe(
    map(([templates, error]) => {
      // Only return templates if there is no error
      return error ? [] : templates;
    }),
    takeUntilDestroyed(this.destroyRef)
  );

  // Filtered templates - combine templates with search and filter
  filteredTemplates$ = combineLatest([
    this.templates$,
    this.searchTermSubject,
    this.filterSubject,
  ]).pipe(
    map(([templates, searchTerm, filter]) => {
      return this.applyFilters(templates, searchTerm, filter);
    }),
    takeUntilDestroyed(this.destroyRef)
  );

  // Pagination state
  currentPage = signal(0);
  pageSize = signal(10);
  totalPages = signal(1);
  totalElements = signal(0);
  isFirstPage = signal(true);
  isLastPage = signal(true);

  // Inject services
  private userTemplateService = inject(UserTemplateService);
  private selectionStateService = inject(SelectionStateService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private userBuildService = inject(UserBuildService);
  private confirmationService = inject(ConfirmationService);

  constructor() {
    console.log('[TEMPLATES] Constructor: Initializing templates component.');
  }

  ngOnInit(): void {
    console.log('[TEMPLATES] ngOnInit: Initializing component');
    this.loadTemplates();
  }

  /**
   * Navigates to the previous page
   */
  previousPage(): void {
    if (this.isFirstPage()) return;

    // Cancel any pending request before changing page
    this.cancelCurrentRequest();

    // Show loading during page change
    this.loadingSubject.next(true);

    // Reset any errors
    this.errorSubject.next(null);

    // Update page number
    this.currentPage.set(this.currentPage() - 1);

    // Load templates with the new page
    this.loadTemplates();
  }

  /**
   * Navigates to the next page
   */
  nextPage(): void {
    if (this.isLastPage()) return;

    // Cancel any pending request before changing page
    this.cancelCurrentRequest();

    // Show loading during page change
    this.loadingSubject.next(true);

    // Reset any errors
    this.errorSubject.next(null);

    // Update page number
    this.currentPage.set(this.currentPage() + 1);

    // Load templates with the new page
    this.loadTemplates();
  }

  /**
   * Apply search and type filters to template list
   */
  private applyFilters(
    templates: UserTemplate[],
    searchTerm: string,
    filter: string
  ): UserTemplate[] {
    if (!templates || templates.length === 0) return [];

    let filteredTemplates = [...templates];

    // Apply search filter if provided
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      filteredTemplates = filteredTemplates.filter(
        (template) =>
          (template.name && template.name.toLowerCase().includes(term)) ||
          (template.description &&
            template.description.toLowerCase().includes(term)) ||
          (template.type && template.type.toLowerCase().includes(term))
      );
    }

    // Check if this is a status filter (draft, published, stopped)
    if (filter === 'draft') {
      filteredTemplates = filteredTemplates.filter(
        (template) => template.status === TemplateStatus.Draft
      );
    } else if (filter === 'published') {
      filteredTemplates = filteredTemplates.filter(
        (template) => template.status === TemplateStatus.Published
      );
    } else if (filter === 'stopped') {
      filteredTemplates = filteredTemplates.filter(
        (template) => template.status === TemplateStatus.Stopped
      );
    }
    // Apply type filter if not 'all' and not a status filter
    else if (filter && filter !== 'all') {
      filteredTemplates = filteredTemplates.filter(
        (template) =>
          template.type &&
          template.type.toLowerCase().includes(filter.toLowerCase())
      );
    }

    return filteredTemplates;
  }

  /**
   * Load templates from the API
   */
  loadTemplates(): void {
    // Guard against multiple concurrent requests
    this.cancelCurrentRequest();

    // Start loading
    this.loadingSubject.next(true);

    // Clear error state
    this.errorSubject.next(null);

    // Get current pagination parameters
    const page = this.currentPage();
    const size = this.pageSize();

    // Start the API request
    console.log(`[TEMPLATES] Loading templates (page: ${page}, size: ${size})`);

    this.currentRequest = this.userTemplateService
      .searchUserTemplates(page, size)
      .pipe(
        // Add a timeout to prevent hanging requests
        finalize(() => {
          this.loadingSubject.next(false);
          this.currentRequest = null;
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response && 'content' in response) {
            console.log('[TEMPLATES] Received API response:', response);

            // Update pagination state
            this.updatePaginationState(response);

            // Map and update templates
            const mappedTemplates = this.mapTemplatesFromResponse(response);
            this.templatesSubject.next(mappedTemplates);

            // Clear error state
            this.errorSubject.next(null);

            // Always hide loading when complete
            this.loadingSubject.next(false);
          } else {
            // Handle empty response
            this.templatesSubject.next([]);
            this.errorSubject.next(null);
            this.loadingSubject.next(false);
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('[Templates] Error loading templates:', error);
          this.templatesSubject.next([]);
          this.errorSubject.next(
            `Failed to load templates. ${
              error.status ? `(${error.status})` : ''
            } ${error.message || 'Please try again later.'}`
          );
          this.loadingSubject.next(false);
        },
      });
  }

  /**
   * Cancel the current API request if one is in progress
   */
  private cancelCurrentRequest(): void {
    if (this.currentRequest) {
      console.log('[TEMPLATES] Canceling current request');
      this.currentRequest.unsubscribe();
      this.currentRequest = null;
    }
  }

  /**
   * Update pagination state based on API response
   */
  private updatePaginationState(response: PageResponse<any>): void {
    this.totalPages.set(response.totalPages || 1);
    this.totalElements.set(response.totalElements || 0);
    this.isFirstPage.set(response.first || this.currentPage() === 0);
    this.isLastPage.set(
      response.last || this.currentPage() >= (response.totalPages || 1) - 1
    );

    console.log(
      `[TEMPLATES] Pagination: Page ${
        this.currentPage() + 1
      }/${this.totalPages()}, Total: ${this.totalElements()}, First: ${this.isFirstPage()}, Last: ${this.isLastPage()}`
    );
  }

  /**
   * Map API response to UserTemplate objects
   */
  private mapTemplatesFromResponse(
    response: PageResponse<any>
  ): UserTemplate[] {
    if (!response.content || !Array.isArray(response.content)) {
      console.warn('[TEMPLATES] API response has no content array');
      return [];
    }

    return response.content
      .filter((template: any) => !!template)
      .map((template: any): UserTemplate => {
        const userBuild = template.userBuild;
        let status: TemplateStatus = TemplateStatus.Draft;
        let url: string | undefined = undefined;

        if (userBuild) {
          status =
            userBuild.status === 'STOPPED'
              ? TemplateStatus.Stopped
              : TemplateStatus.Published;
          url = userBuild.address || undefined;
        }

        let plan: 'standard' | 'premium' = 'standard';
        if (
          template.template?.templatePlan?.type?.toLowerCase() === 'premium'
        ) {
          plan = 'premium';
        }

        return {
          id: template.id || 'unknown-id',
          name: template.name || 'Untitled Template',
          type: template.template?.templateType?.name || 'Unknown',
          description:
            template.template?.description || 'A customizable website template',
          createdAt: template.createdAt
            ? new Date(template.createdAt)
            : new Date(),
          updatedAt: template.updatedAt
            ? new Date(template.updatedAt)
            : new Date(),
          thumbnailUrl: template.thumbnailUrl,
          plan,
          isPublishing: false,
          userBuild,
          status,
          url,
          template: template.template, // Preserve the original template for compatibility
        };
      });
  }

  /**
   * Handle search input changes from template-controls
   */
  onSearchChange(searchTerm: string): void {
    this.searchTermSubject.next(searchTerm);
  }

  /**
   * Handle filter select changes from template-controls
   */
  onFilterChange(filter: string): void {
    this.filterSubject.next(filter);
  }

  /**
   * Navigate to create a new template
   */
  createTemplate(): void {
    // Check authentication first
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/dashboard/templates' },
      });
      return;
    }

    // Navigate to the preview page with new template mode
    this.router.navigate(['/preview'], {
      queryParams: {
        newTemplate: 'true',
      },
    });
  }

  /**
   * Navigate to edit an existing template
   */
  editTemplate(template: UserTemplate): void {
    // Check authentication first
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/dashboard/templates' },
      });
      return;
    }

    // Store template ID in selection state service
    this.selectionStateService.saveSelections(
      undefined, // No business type
      undefined, // No plan type
      template.id // Template ID
    );

    // Navigate to the preview page with edit mode
    this.router.navigate(['/preview'], {
      queryParams: {
        templateId: template.id,
        mode: 'edit',
        step: '4', // Skip to customization step
      },
    });
  }

  /**
   * Navigate to the template view page
   */
  viewTemplate(template: UserTemplate): void {
    // Show loading before navigation
    this.loadingSubject.next(true);

    this.router.navigate(['/preview'], {
      queryParams: {
        templateId: template.id,
        mode: 'view',
        step: '3', // View mode is step 3
      },
    });
  }

  /**
   * Delete a template after confirmation
   */
  deleteTemplate(template: UserTemplate): void {
    // Check authentication first
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/dashboard/templates' },
      });
      return;
    }

    // Show confirmation dialog
    if (
      !confirm(
        `Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    // Show loading state
    this.loadingSubject.next(true);

    // Delete template through service
    this.userTemplateService.deleteTemplate(template.id).subscribe({
      next: () => {
        console.log(`[TEMPLATES] Template deleted: ${template.id}`);

        // Refresh template list
        this.loadTemplates();

        // Show success message
        this.confirmationService.showConfirmation(
          'Template deleted successfully',
          'success',
          3000
        );
      },
      error: (error) => {
        console.error('[TEMPLATES] Error deleting template:', error);

        // Hide loading state
        this.loadingSubject.next(false);

        // Show error message
        this.confirmationService.showConfirmation(
          `Failed to delete template: ${error.message || 'Unknown error'}`,
          'error',
          5000
        );
      },
    });
  }

  /**
   * Publish a template
   */
  publishTemplate(template: UserTemplate): void {
    // Check authentication first
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/dashboard/templates' },
      });
      return;
    }

    // Check if template can be published
    if (
      template.status === TemplateStatus.Published ||
      template.status === TemplateStatus.Stopped ||
      template.isPublishing
    ) {
      return;
    }

    // FIXED: Redirect to subscription-selection page with required parameters
    // instead of checking for active subscription
    // This matches the behavior in PreviewComponent.publishTemplate
    this.router.navigate(['/subscription-selection'], {
      queryParams: {
        templateId: template.id,
        templateName: template.name || 'Website Template',
        templatePlan: template.plan || 'standard',
        templateType: template.type || 'business',
      },
    });

    // Previous code was incorrectly checking for subscriptions and redirecting to /subscription
    // which doesn't exist, causing 401 errors when trying to call the non-existent API endpoint
    /*
    // Check if user has an active subscription
    this.subscriptionService.getUserSubscriptions().subscribe({
      next: (subscriptions: any[]) => {
        // Find an active subscription
        const subscription = subscriptions.find(
          (sub) => sub.status === 'ACTIVE'
        );
        if (!subscription) {
          // Redirect to subscription page if no active subscription
          this.router.navigate(['/subscription']);
          return;
        }

        // Update template publishing state locally
        this.updateTemplatePublishingState(template.id, true);

        // Call the publish endpoint
        this.userBuildService
          .buildAndPublishTemplate(template.id, subscription.id)
          .subscribe({
            next: (response: any) => {
              console.log('[TEMPLATES] Publish response:', response);

              // Reset publishing state
              this.updateTemplatePublishingState(template.id, false);

              // Refresh template list to get updated build info
              this.loadTemplates();

              // Show success message
              this.confirmationService.showConfirmation(
                'Template published successfully! Your site is now live.',
                'success',
                5000
              );
            },
            error: (error: HttpErrorResponse) => {
              console.error('[TEMPLATES] Error publishing template:', error);

              // Reset publishing state
              this.updateTemplatePublishingState(template.id, false);

              // Show error message
              this.confirmationService.showConfirmation(
                `Failed to publish template: ${
                  error.error?.message || error.message || 'Unknown error'
                }`,
                'error',
                5000
              );
            },
          });
      },
      error: (error) => {
        console.error('[TEMPLATES] Error checking subscription status:', error);
        // Show error message
        this.confirmationService.showConfirmation(
          'Unable to verify subscription. Please try again later.',
          'error',
          5000
        );
      },
    });
    */
  }

  /**
   * Update the publishing state of a template in the local state
   * This is a utility method for visual feedback only
   */
  private updateTemplatePublishingState(
    templateId: string,
    isPublishing: boolean
  ): void {
    const currentTemplates = this.templatesSubject.getValue();
    const updatedTemplates = currentTemplates.map((t) =>
      t.id === templateId ? { ...t, isPublishing } : t
    );
    this.templatesSubject.next(updatedTemplates);
  }

  /**
   * Clean up on component destruction
   */
  ngOnDestroy(): void {
    // Cancel any pending requests
    this.cancelCurrentRequest();
  }
}
