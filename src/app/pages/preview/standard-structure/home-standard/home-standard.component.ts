import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Customizations,
  HeroData,
} from '../../../../core/models/website-customizations';
import { SectionHoverWrapperComponent } from '../../components/section-hover-wrapper/section-hover-wrapper.component';
import { ThemeColorsService } from '../../../../core/services/theme/theme-colors.service';
import { BusinessConfigService } from '../../../../core/services/business-config/business-config.service';

// Import all section components
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { AboutSectionComponent } from './components/about-section/about-section.component';
import { MenuSectionComponent } from './components/menu-section/menu-section.component';
import { ServicesSectionComponent } from './components/services-section/services-section.component';
import { ProjectsSectionComponent } from './components/projects-section/projects-section.component';
import { ContactSectionComponent } from './components/contact-section/contact-section.component';

@Component({
  selector: 'app-home-standard',
  standalone: true,
  imports: [
    CommonModule,
    SectionHoverWrapperComponent,
    HeroSectionComponent,
    AboutSectionComponent,
    MenuSectionComponent,
    ServicesSectionComponent,
    ProjectsSectionComponent,
    ContactSectionComponent,
  ],
  templateUrl: './home-standard.component.html',
  styleUrl: './home-standard.component.scss',
})
export class HomeStandardComponent implements OnInit {
  @Input() customizations: any;
  @Input() wholeData: any;
  @Input() isMobileLayout: boolean = false;
  @Input() isMobileView: any;
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'restaurant';
  @Output() sectionSelected = new EventEmitter<string>();

  private themeColorsService = inject(ThemeColorsService);
  private businessConfigService = inject(BusinessConfigService);
  primaryColor = signal<string>('');

  // Computed signal for available sections based on business type
  availableSections = computed(() => {
    console.log(
      `Computing available sections for business type: ${this.businessType}`
    );

    // Get sections from the business config service
    return this.businessConfigService.getAvailableSectionsForBusinessType(
      this.businessType,
      this.planType
    );
  });

  /**
   * Get hero section data from customizations with fallbacks
   */
  getHeroData(): Partial<HeroData> {
    // First check for direct hero1 property (for backward compatibility)
    if (this.customizations?.hero1) {
      console.log(
        'Returning direct hero1 property:',
        this.customizations.hero1
      );
      return this.customizations.hero1;
    }

    // Then check for the proper nested path
    if (this.wholeData()?.pages?.home?.hero1) {
      return this.wholeData().pages.home.hero1;
    }

    // Finally, if no data exists, return empty object (component has defaults)
    console.log('No hero data found, returning empty object');
    return {};
  }

  ngOnInit(): void {
    // Set the appropriate color based on plan
    this.primaryColor.set(
      this.themeColorsService.getPrimaryColor(
        this.planType as 'standard' | 'premium'
      )
    );

    // Apply CSS variable for the primary color to the root element for use by child components
    document.documentElement.style.setProperty(
      '--theme-primary-color',
      this.primaryColor()
    );

    // Set RGB version of primary color for rgba usage
    const rgbValue = this.hexToRgb(this.primaryColor());
    document.documentElement.style.setProperty(
      '--theme-primary-color-rgb',
      rgbValue
    );
  }

  /**
   * Convert hex color to RGB format for CSS variables
   */
  private hexToRgb(hex: string): string {
    // Default to a standard blue if invalid hex
    if (!hex || typeof hex !== 'string') {
      return '74, 141, 255'; // Default RGB
    }

    // Remove # if present
    hex = hex.replace('#', '');

    // Handle shorthand (3 chars) hex
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }

    // Parse RGB values with fallbacks for invalid values
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;

    return `${r}, ${g}, ${b}`;
  }

  /**
   * Check if a section is available for the current business type
   */
  isSectionAvailable(sectionId: string): boolean {
    return this.availableSections().includes(sectionId);
  }

  /**
   * Forward section selection to parent component
   */
  handleSectionSelection(data: { key: string; name: string; path?: string }) {
    console.log('Home component - section selected:', data);

    // Ensure we have the full path
    const fullPath = data.path || `pages.home.${data.key}`;
    console.log(
      `Home component - emitting sectionSelected with path: ${fullPath}`
    );

    // If this is the hero section, log the relevant data
    if (data.key === 'hero1' || fullPath.includes('hero1')) {
      console.log('Hero data being passed to customize:', this.getHeroData());
    }

    this.sectionSelected.emit(fullPath);
  }

  /**
   * Check if a section should be displayed based on business type and plan
   */
  shouldDisplaySection(sectionKey: string): boolean {
    // First check if the section is in the available sections for this business type
    if (!this.isSectionAvailable(sectionKey)) {
      return false;
    }

    // Business type specific sections
    const businessSpecificSections: Record<string, string[]> = {
      restaurant: ['menu'],
      salon: ['services'],
      architecture: ['projects'],
      portfolio: ['projects'],
    };

    // If it's a business-specific section, only show for the appropriate business type
    const isBusinessSpecific = Object.values(businessSpecificSections).some(
      (sections) => sections.includes(sectionKey)
    );

    if (isBusinessSpecific) {
      // Find business types that include this section
      const validBusinessTypes = Object.entries(businessSpecificSections)
        .filter(([_, sections]) => sections.includes(sectionKey))
        .map(([type, _]) => type);

      // Check if current business type is valid for this section
      return validBusinessTypes.includes(this.businessType);
    }

    // If we got here, the section is generally available for all business types
    return true;
  }
}
