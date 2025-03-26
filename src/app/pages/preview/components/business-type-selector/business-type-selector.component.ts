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

@Component({
  selector: 'app-business-type-selector',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './business-type-selector.component.html',
  styleUrls: ['./business-type-selector.component.scss'],
})
export class BusinessTypeSelectorComponent implements OnInit {
  @Input() currentPlan: string = 'standard';
  @Input() selectedBusinessType: string | null = null;
  @Input() compactMode: boolean = false;
  @Output() businessTypeSelected = new EventEmitter<string>();

  private themeColorsService = inject(ThemeColorsService);
  businessTypes = BUSINESS_TYPES;
  dropdownOpen = false;
  accentColor = '';

  ngOnInit() {
    // Set accent color based on plan
    this.accentColor = this.themeColorsService.getPrimaryColor(
      this.currentPlan as 'standard' | 'premium'
    );

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

  selectBusinessType(type: string): void {
    this.businessTypeSelected.emit(type);
    this.dropdownOpen = false;
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
