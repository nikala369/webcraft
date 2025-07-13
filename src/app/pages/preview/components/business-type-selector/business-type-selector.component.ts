/**
 * BusinessTypeSelectorComponent
 *
 * This component allows users to select a business type for their website template.
 * It has two display modes:
 * 1. Full view with grid of business type cards (used in initial selection)
 * 2. Compact dropdown mode (used in fullscreen editor header)
 *
 * The component fetches business types from the API and falls back to predefined types if needed.
 * It emits the selected business type ID when a selection is made.
 */
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
  getAllBusinessTypes,
  getEnabledBusinessTypes,
} from '../../../../core/models/business-types';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ThemeColorsService } from '../../../../core/services/theme/theme-colors.service';
import {
  TemplateService,
  TemplateType,
} from '../../../../core/services/template/template.service';
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
  @Input() isDisabled: boolean = false;
  @Output() businessTypeSelected = new EventEmitter<string>();
  @Output() isLoadingChange = new EventEmitter<boolean>();

  private themeColorsService = inject(ThemeColorsService);
  private templateService = inject(TemplateService);

  // Template types from API
  templateTypes: TemplateType[] = [];
  // Use all business types (including coming soon ones) for display
  businessTypes = getAllBusinessTypes();

  dropdownOpen = false;
  accentColor = '';
  loading = false;
  error: string | null = null;

  // For better UX with minimum loading time
  private loadingStartTime = 0;
  private minimumLoadingTime = 1000; // 1 second minimum loading time

  ngOnInit() {
    // Set accent color based on plan
    this.accentColor = this.themeColorsService.getPrimaryColor(
      this.currentPlan as 'standard' | 'premium'
    );

    // Apply CSS variables
    this.applyThemeColors();

    // Only load business types if we're not in compact mode or if no business type is selected
    if (!this.compactMode || !this.selectedBusinessType) {
      this.loadBusinessTypes();
    } else {
      // For compact mode with a selected type, just ensure we have the business types data
      if (this.businessTypes.length === 0) {
        // Use a minimal loading approach without UI feedback
        this.loadBusinessTypesQuietly();
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
   * Load business types from the API with minimum loading time
   */
  loadBusinessTypes(): void {
    this.loading = true;
    this.loadingStartTime = Date.now();
    this.isLoadingChange.emit(true);
    this.error = null;

    this.templateService
      .getAllTemplateTypes()
      .pipe(
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

          // Ensure minimum loading time
          const elapsed = Date.now() - this.loadingStartTime;
          const remainingTime = this.minimumLoadingTime - elapsed;

          if (remainingTime > 0) {
            // If less than minimum time has passed, wait for the remainder
            setTimeout(() => {
              this.loading = false;
              this.isLoadingChange.emit(false);
            }, remainingTime);
          } else {
            // If minimum time has already elapsed, stop loading immediately
            this.loading = false;
            this.isLoadingChange.emit(false);
          }
        },
        error: () => {
          // Ensure minimum loading time
          const elapsed = Date.now() - this.loadingStartTime;
          const remainingTime = this.minimumLoadingTime - elapsed;

          if (remainingTime > 0) {
            setTimeout(() => {
              this.loading = false;
              this.isLoadingChange.emit(false);
            }, remainingTime);
          } else {
            this.loading = false;
            this.isLoadingChange.emit(false);
          }
        },
      });
  }

  /**
   * Map template types from API to business types for UI
   */
  private mapTemplateTypesToBusinessTypes(): void {
    if (this.templateTypes.length === 0) return;

    // Keep the original business types with their enabled/disabled states
    // Only update the ones that exist in both API and local data
    this.businessTypes = getAllBusinessTypes().map((localType) => {
      // Try to find a match in API data
      const apiType = this.templateTypes.find((at) => at.key === localType.id);

      if (apiType) {
        return {
          ...localType,
          name: apiType.name,
        };
      }

      // No API match, keep the local type as-is
      return localType;
    });
  }

  /**
   * Handle business type selection
   */
  selectBusinessType(type: string): void {
    if (this.isDisabled) return;

    // Find the business type to check if it's enabled
    const businessType = this.businessTypes.find((bt) => bt.id === type);

    if (!businessType) {
      console.warn(`Business type ${type} not found`);
      return;
    }

    // Prevent selection of disabled/coming soon types
    if (!businessType.enabled || businessType.comingSoon) {
      // Show a subtle notification or just return early
      console.log(`Business type ${businessType.name} is coming soon`);
      // You could emit a notification event here if needed
      return;
    }

    this.selectedBusinessType = type;
    this.businessTypeSelected.emit(type);
    this.dropdownOpen = false;
  }

  /**
   * Check if a business type is currently selected
   */
  isSelected(typeId: string): boolean {
    return this.selectedBusinessType === typeId;
  }

  /**
   * Toggle the dropdown in compact mode
   */
  toggleDropdown(): void {
    if (this.isDisabled) return;
    this.dropdownOpen = !this.dropdownOpen;
  }

  /**
   * Get the display name of the currently selected business type
   */
  getSelectedBusinessTypeName(): string {
    const selected = this.businessTypes.find(
      (type) => type.id === this.selectedBusinessType
    );
    return selected ? selected.name : 'Select Type';
  }

  /**
   * Load business types quietly without UI updates for background updates
   */
  private loadBusinessTypesQuietly(): void {
    this.templateService
      .getAllTemplateTypes()
      .pipe(
        catchError((error) => {
          console.error('Failed to load business types quietly:', error);
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
          this.mapTemplateTypesToBusinessTypes();
        },
      });
  }
}
