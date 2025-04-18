import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UserTemplateService } from '../../../../core/services/template/user-template.service';
import { SelectionStateService } from '../../../../core/services/selection/selection-state.service';
import { TemplateService } from '../../../../core/services/template/template.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { finalize } from 'rxjs/operators';

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
}

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [CommonModule, IconComponent, DatePipe],
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
    this.router.navigate(['/preview'], {
      queryParams: {
        templateId: template.id,
        mode: 'edit',
      },
    });
  }

  /**
   * Navigate to the template view page
   */
  viewTemplate(template: UserTemplate): void {
    this.router.navigate(['/preview'], {
      queryParams: {
        templateId: template.id,
        mode: 'view',
      },
    });
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
    this.loading = true;

    // Toggle published state
    const action = template.published
      ? this.userTemplateService.unpublishTemplate(template.id)
      : this.userTemplateService.publishTemplate(template.id);

    action.subscribe({
      next: () => {
        this.loadTemplates();
      },
      error: (error: HttpErrorResponse) => {
        const action = template.published ? 'unpublish' : 'publish';
        console.error(`Error ${action}ing template:`, error);
        this.error = `Failed to ${action} template. Please try again.`;
        this.loading = false;
      },
    });
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
}
