import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UserTemplateService } from '../../../../core/services/template/user-template.service';
import { SelectionStateService } from '../../../../core/services/selection/selection-state.service';
import { TemplateService } from '../../../../core/services/template/template.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { PlanBadgeComponent } from '../../../../shared/components/plan-badge/plan-badge.component';
import {
  finalize,
  catchError,
  map,
  Observable,
  BehaviorSubject,
  of,
  tap,
  switchMap,
  filter,
} from 'rxjs';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { SubscriptionService } from '../../../../core/services/subscription/subscription.service';
import { UserBuildService } from '../../../../core/services/build/user-build.service';
import { EMPTY } from 'rxjs';
import { ConfirmationService } from '../../../../core/services/shared/confirmation/confirmation.service';
import { SafeResourceUrlPipe } from '../../../../shared/pipes/safe-resource-url.pipe';
import { TemplateControlsComponent } from './components/template-controls/template-controls.component';
import { TemplateListComponent } from './components/template-list/template-list.component';
import { TemplateCardComponent } from './components/template-card/template-card.component';

// Define TemplateStatus enum
export enum TemplateStatus {
  Draft = 'DRAFT',
  Published = 'PUBLISHED',
  Stopped = 'STOPPED',
}

// Define the UserTemplate interface with enum status
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
}

// Define a type for the result of subscription flow
interface SubscriptionFlowResult {
  type: 'subscription-flow' | 'upgrade-flow' | 'direct-publish' | 'error';
  action?: string;
  selectedPlan?: any;
  build?: any;
  message?: string;
}

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
export class TemplatesComponent implements OnInit {
  // State observables
  private loadingSubject = new BehaviorSubject<boolean>(true);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private searchTermSubject = new BehaviorSubject<string>('');
  private filterSubject = new BehaviorSubject<string>('all');

  // Expose as observables
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  // Main data stream
  templates$: Observable<UserTemplate[]>;

  // Filtered templates based on search and filter
  filteredTemplates$: Observable<UserTemplate[]>;

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
  private subscriptionService = inject(SubscriptionService);
  private userBuildService = inject(UserBuildService);
  private confirmationService = inject(ConfirmationService);

  constructor() {
    this.templates$ = this.loadingSubject.pipe(
      filter((loading) => loading === true),
      switchMap(() => {
        return this.userTemplateService
          .searchUserTemplates(this.currentPage(), this.pageSize())
          .pipe(
            map((response) => {
              console.log('[TEMPLATES] Raw API response:', response);
              if (!response?.content || !Array.isArray(response.content)) {
                return [];
              }

              // Update pagination state
              this.totalPages.set(response.totalPages || 1);
              this.totalElements.set(response.totalElements || 0);
              this.isFirstPage.set(response.first !== false);
              this.isLastPage.set(response.last !== false);

              const mapped = response.content
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
                    template.template?.templatePlan?.type?.toLowerCase() ===
                    'premium'
                  ) {
                    plan = 'premium';
                  }
                  return {
                    id: template.id || 'unknown-id',
                    name: template.name || 'Untitled Template',
                    type: template.template?.templateType?.name || 'Unknown',
                    description:
                      template.template?.description ||
                      'A customizable website template',
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
                  };
                });
              console.log('[TEMPLATES] Mapped templates:', mapped);
              return mapped;
            }),
            catchError((error: HttpErrorResponse) => {
              this.errorSubject.next(
                'Failed to load templates. Please try again.'
              );
              return of([] as UserTemplate[]);
            }),
            finalize(() => {
              this.loadingSubject.next(false);
            })
          );
      })
    );

    // Setup filtered templates
    this.filteredTemplates$ = this.templates$.pipe(
      switchMap((templates) => {
        return this.searchTermSubject.pipe(
          switchMap((searchTerm) => {
            return this.filterSubject.pipe(
              map((filter) => {
                console.log(
                  '[TEMPLATES] Filtering. All templates count:',
                  templates.length,
                  'Search:',
                  searchTerm,
                  'Filter:',
                  filter
                );
                const filtered = this.applyFilters(
                  templates,
                  searchTerm,
                  filter
                );
                console.log(
                  '[TEMPLATES] Filtered templates count:',
                  filtered.length
                );
                return filtered;
              })
            );
          })
        );
      })
    );
  }

  ngOnInit(): void {
    this.loadTemplates();
  }

  /**
   * Load templates from the backend with pagination
   */
  loadTemplates(): void {
    this.loadingSubject.next(true);
  }

  /**
   * Navigate to the next page
   */
  nextPage(): void {
    if (!this.isLastPage()) {
      this.currentPage.update((page) => page + 1);
      this.loadTemplates();
    }
  }

  /**
   * Navigate to the previous page
   */
  previousPage(): void {
    if (!this.isFirstPage()) {
      this.currentPage.update((page) => page - 1);
      this.loadTemplates();
    }
  }

  /**
   * Helper to determine if a template is in active state
   */
  isLive(status: TemplateStatus): boolean {
    return status === TemplateStatus.Published;
  }

  /**
   * Helper to determine if a template is editable
   */
  isEditable(status: TemplateStatus): boolean {
    return status !== TemplateStatus.Stopped;
  }

  /**
   * Track templates by ID for efficient rendering
   */
  trackById(_index: number, template: UserTemplate): string {
    return template.id;
  }

  /**
   * Navigate to the template creation page
   */
  createTemplate(): void {
    this.router.navigate(['/preview'], {
      queryParams: { newTemplate: true },
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
   * Navigate to the template editing page
   */
  editTemplate(template: UserTemplate): void {
    // Show loading before navigation
    this.loadingSubject.next(true);

    // Navigate to the template editing page
    this.router.navigate(['/preview'], {
      queryParams: {
        templateId: template.id,
        mode: 'edit',
        step: '4', // Explicitly set the step to 4 for editing
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
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      this.loadingSubject.next(true);
      this.userTemplateService.deleteTemplate(template.id).subscribe({
        next: () => {
          this.loadTemplates();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error deleting template:', error);
          this.errorSubject.next(
            'Failed to delete template. Please try again.'
          );
          this.loadingSubject.next(false);
        },
      });
    }
  }

  /**
   * Publish a template
   */
  publishTemplate(template: UserTemplate): void {
    // Show loading state on the button
    const updatedTemplates = this.getUpdatedTemplateWithProperty(
      template,
      'isPublishing',
      true
    );

    // 1. Check authentication first
    if (!this.authService.isAuthenticated()) {
      this.getUpdatedTemplateWithProperty(template, 'isPublishing', false);
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    // 2. For new publications, redirect to subscription selection page
    this.router.navigate(['/subscription-selection'], {
      queryParams: {
        templateId: template.id,
        templateName: template.name,
        templatePlan: template.plan || 'standard',
      },
    });

    // Reset the loading state
    this.getUpdatedTemplateWithProperty(template, 'isPublishing', false);
  }

  /**
   * Helper method to update a template property and trigger a refresh
   * without modifying the original array
   */
  private getUpdatedTemplateWithProperty<K extends keyof UserTemplate>(
    template: UserTemplate,
    property: K,
    value: UserTemplate[K]
  ): UserTemplate {
    // Create a shallow copy of the template
    const updatedTemplate = { ...template, [property]: value };

    // Trigger a refresh without directly modifying the array
    // Note: In a real implementation with state management, this would
    // be handled by the state management library
    this.loadTemplates();

    return updatedTemplate;
  }

  /**
   * Apply both search and filter to templates
   */
  private applyFilters(
    templates: UserTemplate[],
    searchTerm: string,
    filter: string
  ): UserTemplate[] {
    let result = templates;

    // Filter by type if not "all"
    if (
      filter !== 'all' &&
      !['published', 'draft', 'stopped'].includes(filter)
    ) {
      result = result.filter(
        (template) => template.type?.toLowerCase() === filter.toLowerCase()
      );
    }

    // Filter by status if filter is a status
    if (['published', 'draft', 'stopped'].includes(filter)) {
      const statusMap: Record<string, TemplateStatus> = {
        published: TemplateStatus.Published,
        draft: TemplateStatus.Draft,
        stopped: TemplateStatus.Stopped,
      };
      result = result.filter(
        (template) => template.status === statusMap[filter]
      );
    }

    // Filter by search term if not empty
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (template) =>
          template.name?.toLowerCase().includes(searchLower) ||
          template.description?.toLowerCase().includes(searchLower) ||
          template.type?.toLowerCase().includes(searchLower)
      );
    }
    return result;
  }

  /**
   * Determine if a template is premium (by type or property)
   */
  isPremium(template: UserTemplate): boolean {
    // If backend adds a 'plan' or 'isPremium' property, use that instead
    // For now, treat as premium if type includes 'premium' (case-insensitive)
    return !!(
      (template.type &&
        typeof template.type === 'string' &&
        template.type.toLowerCase().includes('premium')) ||
      template.plan === 'premium'
    );
  }

  /**
   * Open template URL in a new tab (for iframe click)
   */
  openTemplateUrl(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
