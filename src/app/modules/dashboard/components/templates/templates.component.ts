import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UserTemplateService } from '../../../../core/services/template/user-template.service';
import { SelectionStateService } from '../../../../core/services/selection/selection-state.service';
import { TemplateService } from '../../../../core/services/template/template.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { PlanBadgeComponent } from '../../../../shared/components/plan-badge/plan-badge.component';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { SubscriptionService } from '../../../../core/services/subscription/subscription.service';
import { UserBuildService } from '../../../../core/services/build/user-build.service';
import { switchMap, map, tap, EMPTY, of } from 'rxjs';
import { ConfirmationService } from '../../../../core/services/shared/confirmation/confirmation.service';

// Define the UserTemplate interface for our component
export interface UserTemplate {
  id: string;
  name: string;
  type: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  published?: boolean;
  thumbnailUrl?: string;
  plan?: 'standard' | 'premium';
  isPublishing?: boolean;
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
  imports: [CommonModule, IconComponent, DatePipe, PlanBadgeComponent],
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss'],
})
export class TemplatesComponent implements OnInit {
  templates: UserTemplate[] = [];
  filteredTemplates: UserTemplate[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  selectedFilter = 'all';

  // Inject services
  private userTemplateService = inject(UserTemplateService);
  private selectionStateService = inject(SelectionStateService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private subscriptionService = inject(SubscriptionService);
  private userBuildService = inject(UserBuildService);
  private confirmationService = inject(ConfirmationService);

  ngOnInit(): void {
    this.loadTemplates();
  }

  /**
   * Load user templates from the backend
   */
  loadTemplates(): void {
    this.loading = true;
    this.error = null;

    this.userTemplateService
      .searchUserTemplates()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (response) => {
          // Map backend response to our component's UserTemplate interface
          this.templates = response.content.map((template: any) => ({
            id: template.id,
            name: template.name || 'Untitled Template',
            type: template.template?.templateType?.name || 'Unknown',
            description: 'A customizable website template',
            createdAt: template.createdAt
              ? new Date(template.createdAt)
              : new Date(),
            updatedAt: template.updatedAt
              ? new Date(template.updatedAt)
              : new Date(),
            published: !!template.published,
            thumbnailUrl: template.thumbnailUrl,
            plan: template.plan || template.template?.plan || 'standard',
          }));
          this.applyFilters();
        },
        error: (error: HttpErrorResponse) => {
          this.error = 'Failed to load templates. Please try again.';
          console.error('Error loading templates:', error);
        },
      });
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
   * Navigate to the template editing page
   */
  editTemplate(template: UserTemplate): void {
    // Show loading before navigation
    this.loading = true;

    // Navigate to the template editing page
    this.router.navigate(['/preview'], {
      queryParams: {
        templateId: template.id,
        mode: 'edit',
        step: '4', // Explicitly set the step to 4 for editing
      },
    });

    // Note: We don't set loading = false here because we're navigating away
  }

  /**
   * Navigate to the template view page
   */
  viewTemplate(template: UserTemplate): void {
    // Show loading before navigation
    this.loading = true;

    this.router.navigate(['/preview'], {
      queryParams: {
        templateId: template.id,
        mode: 'view',
        step: '3', // View mode is step 3
      },
    });

    // Note: We don't set loading = false here because we're navigating away
  }

  /**
   * Delete a template after confirmation
   */
  deleteTemplate(template: UserTemplate): void {
    if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
      this.loading = true;
      this.userTemplateService.deleteTemplate(template.id).subscribe({
        next: () => {
          this.loadTemplates();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error deleting template:', error);
          this.error = 'Failed to delete template. Please try again.';
          this.loading = false;
        },
      });
    }
  }

  /**
   * Publish or unpublish a template
   */
  publishTemplate(template: UserTemplate): void {
    // Show loading state on the button
    template.isPublishing = true;

    // 1. Check authentication first
    if (!this.authService.isAuthenticated()) {
      template.isPublishing = false;
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    // 2. If the template is already published, unpublish it
    if (template.published) {
      // Use simple confirm dialog instead of the confirmation service
      if (
        confirm(
          'Are you sure you want to unpublish this template? The website will no longer be available online.'
        )
      ) {
        this.userTemplateService.unpublishTemplate(template.id).subscribe({
          next: () => {
            template.published = false;
            template.isPublishing = false;
            this.confirmationService.showConfirmation(
              'Template unpublished successfully.',
              'success',
              3000
            );
          },
          error: (error: HttpErrorResponse) => {
            console.error(`Error unpublishing template:`, error);
            template.isPublishing = false;
            this.confirmationService.showConfirmation(
              'Failed to unpublish template. Please try again.',
              'error',
              4000
            );
          },
        });
      } else {
        template.isPublishing = false;
      }
      return;
    }

    // 3. For new publications, redirect to subscription selection page
    this.router.navigate(['/subscription-selection'], {
      queryParams: {
        templateId: template.id,
        templateName: template.name,
        templatePlan: template.plan || 'standard',
      },
    });
    template.isPublishing = false;
  }

  /**
   * Show options menu for a template
   */
  showOptions(template: UserTemplate): void {
    // This will be implemented when we add a dropdown menu component
    console.log('Show options for template:', template.id);
  }

  /**
   * Handle search input changes
   */
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.applyFilters();
  }

  /**
   * Handle filter select changes
   */
  onFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedFilter = target.value;
    this.applyFilters();
  }

  /**
   * Apply both search and filter to templates
   */
  private applyFilters(): void {
    // First filter by type if not "all"
    let result = this.templates;

    if (this.selectedFilter !== 'all') {
      result = result.filter(
        (template) =>
          template.type?.toLowerCase() === this.selectedFilter.toLowerCase()
      );
    }

    // Then filter by search term if not empty
    if (this.searchTerm.trim() !== '') {
      const searchLower = this.searchTerm.toLowerCase();
      result = result.filter(
        (template) =>
          template.name?.toLowerCase().includes(searchLower) ||
          template.description?.toLowerCase().includes(searchLower) ||
          template.type?.toLowerCase().includes(searchLower)
      );
    }

    this.filteredTemplates = result;
  }

  /**
   * Determine if a template is premium (by type or property)
   */
  isPremium(template: UserTemplate): boolean {
    // If backend adds a 'plan' or 'isPremium' property, use that instead
    // For now, treat as premium if type includes 'premium' (case-insensitive)
    return !!(
      (
        template.type &&
        typeof template.type === 'string' &&
        template.type.toLowerCase().includes('premium')
      )
      // || template.plan === 'premium' // Uncomment if plan property exists
      // || template.isPremium // Uncomment if property exists
    );
  }
}
