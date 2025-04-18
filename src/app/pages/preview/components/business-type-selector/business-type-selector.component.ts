import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BUSINESS_TYPES,
  BusinessType,
} from '../../../../core/models/business-types';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ThemeColorsService } from '../../../../core/services/theme/theme-colors.service';
import {
  TemplateService,
  TemplateType,
} from '../../../../core/services/template/template.service';
import { SelectionStateService } from '../../../../core/services/selection/selection-state.service';
import { finalize, catchError } from 'rxjs/operators';
import { WebcraftLoadingComponent } from '../../../../shared/components/webcraft-loading/webcraft-loading.component';
import { of } from 'rxjs';

@Component({
  selector: 'app-business-type-selector',
  standalone: true,
  imports: [CommonModule, IconComponent, WebcraftLoadingComponent],
  templateUrl: './business-type-selector.component.html',
  styleUrls: ['./business-type-selector.component.scss'],
})
export class BusinessTypeSelectorComponent implements OnInit {
  @Input() currentPlan: string = 'standard';
  @Input() selectedBusinessType: string | null = null;
  @Input() compactMode: boolean = false;
  @Output() businessTypeSelected = new EventEmitter<string>();

  private themeColorsService = inject(ThemeColorsService);
  private templateService = inject(TemplateService);
  private selectionStateService = inject(SelectionStateService);

  // Template types from API
  templateTypes: TemplateType[] = [];
  // Fallback to local data if API fails
  businessTypes = BUSINESS_TYPES;

  dropdownOpen = false;
  accentColor = '';
  loading = false;
  error: string | null = null;

  ngOnInit() {
    // Set accent color based on plan
    this.accentColor = this.themeColorsService.getPrimaryColor(
      this.currentPlan as 'standard' | 'premium'
    );

    // Apply CSS variables
    this.applyThemeColors();

    // Load business types from API
    this.loadBusinessTypes();

    // Check for saved selection in the selection state service
    if (!this.selectedBusinessType) {
      const savedSelections = this.selectionStateService.getSelections();
      if (savedSelections.businessType) {
        this.selectedBusinessType = savedSelections.businessType;
        // Only emit if we weren't already given a selection
        this.businessTypeSelected.emit(this.selectedBusinessType);
      }
    }
  }

  /**
   * Apply theme colors as CSS variables
   */
  private applyThemeColors(): void {
    // Convert hex color to RGB for CSS variables
    const hexToRgb = (hex: string) => {
      // Remove # if present
      hex = hex.replace('#', '');

      // Parse hex values
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);

      return `${r}, ${g}, ${b}`;
    };

    // Apply CSS variables
    document.documentElement.style.setProperty(
      '--accent-color',
      this.accentColor
    );

    // Add RGB version for opacity control
    document.documentElement.style.setProperty(
      '--accent-color-rgb',
      hexToRgb(this.accentColor)
    );
  }

  /**
   * Load business types from the API
   */
  loadBusinessTypes(): void {
    this.loading = true;
    this.error = null;

    this.templateService
      .getAllTemplateTypes()
      .pipe(
        finalize(() => (this.loading = false)),
        catchError((error) => {
          console.error('Failed to load business types:', error);
          this.error = 'Failed to load business types. Using default values.';

          // Return default business types as fallback
          // This prevents the component from breaking when API fails
          return of(
            BUSINESS_TYPES.map((type) => ({
              id: type.id,
              name: type.name,
              key: type.id,
            }))
          );
        })
      )
      .subscribe({
        next: (types) => {
          this.templateTypes = types;
          // Map API types to business types for UI consistency
          this.mapTemplateTypesToBusinessTypes();
        },
      });
  }

  /**
   * Map template types from API to business types for UI
   */
  private mapTemplateTypesToBusinessTypes(): void {
    if (this.templateTypes.length === 0) return;

    // Keep the original business types if there's a match, or create new
    this.businessTypes = this.templateTypes.map((type) => {
      // Try to find a match in our local data for additional props like description
      const existingType = BUSINESS_TYPES.find((bt) => bt.id === type.key);

      if (existingType) {
        return {
          ...existingType,
          id: type.key,
          name: type.name,
        };
      }

      // No match, create new entry
      return {
        id: type.key,
        name: type.name,
        description: `Website templates for ${type.name} businesses`,
        icon: type.key.toLowerCase(),
      };
    });
  }

  selectBusinessType(type: string): void {
    this.selectedBusinessType = type;
    this.businessTypeSelected.emit(type);
    this.dropdownOpen = false;

    // Save selection to selection state service
    this.selectionStateService.saveSelections(type, this.currentPlan);
  }

  getBusinessTypeIcon(typeId: string): string {
    return typeId; // We'll use the type ID as the icon name
  }

  isSelected(typeId: string): boolean {
    return this.selectedBusinessType === typeId;
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  getSelectedBusinessTypeName(): string {
    const selected = this.businessTypes.find(
      (type) => type.id === this.selectedBusinessType
    );
    return selected ? selected.name : 'Select Type';
  }
}
