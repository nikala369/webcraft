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
import { Customizations } from '../../preview.component';
import { SectionHoverWrapperComponent } from '../../components/section-hover-wrapper/section-hover-wrapper.component';
import { ThemeColorsService } from '../../../../core/services/theme/theme-colors.service';

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
  primaryColor = signal<string>('');

  // Computed signal for available sections based on business type
  availableSections = computed(() => {
    console.log(
      `Computing available sections for business type: ${this.businessType}`
    );

    // Define base sections for all business types
    const baseBusinessSections = {
      restaurant: ['hero', 'about', 'menu', 'contact'],
      salon: ['hero', 'about', 'services', 'contact'],
      portfolio: ['hero', 'about', 'projects', 'contact'],
      architecture: ['hero', 'about', 'projects', 'services', 'contact'],
    };

    // Check if we have predefined sections for this business type
    if (this.businessType && this.businessType in baseBusinessSections) {
      return baseBusinessSections[
        this.businessType as keyof typeof baseBusinessSections
      ];
    }

    // Default sections if business type is not defined or not recognized
    return ['hero', 'about', 'services', 'contact'];
  });

  ngOnInit(): void {
    // Set the appropriate color based on plan
    this.primaryColor.set(
      this.themeColorsService.getPrimaryColor(
        this.planType as 'standard' | 'premium'
      )
    );

    // Apply CSS variable for the primary color
    document.documentElement.style.setProperty(
      '--primary-accent-color',
      this.primaryColor()
    );

    // Set RGB version of primary color for rgba usage
    const hexToRgb = (hex: string) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
            result[3],
            16
          )}`
        : '74, 141, 255'; // Default RGB
    };

    document.documentElement.style.setProperty(
      '--primary-accent-color-rgb',
      hexToRgb(this.primaryColor())
    );
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
    // Ensure we have the full path
    if (data.path) {
      // If we already have a path, use it directly
      this.sectionSelected.emit(data.path);
    } else {
      // If no path, construct one based on the section key
      const fullPath = `pages.home.${data.key}`;
      this.sectionSelected.emit(fullPath);
    }
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
