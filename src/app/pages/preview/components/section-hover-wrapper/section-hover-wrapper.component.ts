import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollService } from '../../../../core/services/shared/scroll/scroll.service';
import { ThemeColorsService } from '../../../../core/services/theme/theme-colors.service';

@Component({
  selector: 'app-section-hover-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-hover-wrapper.component.html',
  styleUrls: ['./section-hover-wrapper.component.scss'],
})
export class SectionHoverWrapperComponent implements OnInit, OnChanges {
  // Legacy inputs for backward compatibility
  @Input() sectionId: string = '';
  @Input() editable: boolean = true;
  @Input() currentPlan: string = 'standard';
  @Input() isMobileView: string = 'view-desktop';

  @Output() editSection = new EventEmitter<string>();

  // Component state
  isHovered = false;

  // Inject services
  private scrollService = inject(ScrollService);
  private themeColorsService = inject(ThemeColorsService);
  isViewOnlyStateService = inject(ScrollService);

  ngOnInit(): void {
    this.updateColors();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Update colors when plan changes
    if (changes['currentPlan']) {
      this.updateColors();
    }

    // Reset hover state when switching to mobile view
    if (changes['isMobileView'] && this.isMobileView === 'view-mobile') {
      this.isHovered = false;
    }
  }

  private updateColors(): void {
    // Set CSS variable for hover accent color based on plan
    const color = this.currentPlan === 'premium' ? '#9e6aff' : '#2876ff';

    // Force update on document root
    document.documentElement.style.setProperty('--hover-accent-color', color);

    // Also set RGB version for rgba usage in shadows
    const rgb = this.hexToRgb(color);
    document.documentElement.style.setProperty('--hover-accent-color-rgb', rgb);

    // Force immediate style recalculation
    document.documentElement.offsetHeight;
  }

  /**
   * Convert hex color to RGB values
   */
  private hexToRgb(hex: string): string {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `${r}, ${g}, ${b}`;
  }

  onEditClick(): void {
    if (this.sectionId) {
      this.editSection.emit(this.sectionId);
    }
  }
}
