import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  OnInit,
  inject,
  OnChanges,
  SimpleChanges,
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
import { ComponentCustomizerComponent } from '../../components/component-customizer/component-customizer.component';

@Component({
  selector: 'app-home-standard',
  standalone: true,
  imports: [
    CommonModule,
    SectionHoverWrapperComponent,
    HeroSectionComponent,
    AboutSectionComponent,
    MenuSectionComponent,
    ProjectsSectionComponent,
    ServicesSectionComponent,
    ContactSectionComponent,
    ComponentCustomizerComponent,
  ],
  templateUrl: './home-standard.component.html',
  styleUrl: './home-standard.component.scss',
})
export class HomeStandardComponent implements OnInit, OnChanges {
  @Input() pagesHomeData: any;
  @Input() wholeData: any;
  @Input() isMobileLayout: boolean = false;
  @Input() isMobileView: any;
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'restaurant';
  @Output() sectionSelected = new EventEmitter<string>();

  private themeColorsService = inject(ThemeColorsService);
  private businessConfigService = inject(BusinessConfigService);
  primaryColor = signal<string>('');

  // Track data updates for debugging
  lastCustomizationsUpdate = signal<number>(Date.now());

  ngOnInit(): void {
    console.log(
      'HomeStandardComponent initialized with businessType:',
      this.businessType
    );
    console.log('Initial customizations:', this.pagesHomeData);
    console.log('Initial wholeData:', this.wholeData);

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

  ngOnChanges(changes: SimpleChanges): void {
    // Track when customizations or wholeData change to help debug updates
    if (changes['pagesHomeData'] || changes['wholeData']) {
      console.log(
        '[HomeStandard] Received changes:',
        changes['pagesHomeData'] ? 'pagesHomeData changed' : '',
        changes['wholeData'] ? 'wholeData changed' : ''
      );

      this.lastCustomizationsUpdate.set(Date.now());

      if (changes['pagesHomeData']) {
        console.log('[HomeStandard] New pagesHomeData:', this.pagesHomeData);
      }
      if (changes['wholeData']) {
        console.log('[HomeStandard] New wholeData:', this.wholeData);
      }
    }

    // Update business type if changed
    if (changes['businessType']) {
      console.log('BusinessType changed to:', this.businessType);
    }
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
   * Forward section selection to parent component
   */
  handleSectionSelection(data: { key: string; name: string; path?: string }) {
    console.log('Home component - section selected:', data);

    // Ensure we have the full path
    const fullPath = data.path || `pages.home.${data.key}`;
    console.log(
      `Home component - emitting sectionSelected with path: ${fullPath}`
    );

    this.sectionSelected.emit(fullPath);
  }

  /**
   * Get hero section data from customizations with fallbacks
   */
  getHeroData(): Partial<HeroData> {
    // First check for direct hero1 property (for backward compatibility)
    if (this.pagesHomeData?.hero1) {
      return this.pagesHomeData.hero1;
    }

    // Then check for the proper nested path
    if (this.wholeData?.pages?.home?.hero1) {
      return this.wholeData.pages.home.hero1;
    }

    // Finally, if no data exists, return empty object (component has defaults)
    console.log('No hero data found, returning empty object');
    return {};
  }

  /**
   * Get sections based on business type
   */
  getBusinessTypeSections(): string[] {
    const commonSections = ['hero', 'about', 'contact'];

    if (this.businessType === 'restaurant') {
      return [...commonSections, 'menu'];
    } else if (this.businessType === 'salon') {
      return [...commonSections, 'services'];
    } else if (
      this.businessType === 'architecture' ||
      this.businessType === 'portfolio'
    ) {
      return [...commonSections, 'projects'];
    }

    return commonSections;
  }

  /**
   * Check if a section should be displayed based on business type
   */
  shouldDisplaySection(sectionKey: string): boolean {
    return this.getBusinessTypeSections().includes(sectionKey);
  }
}
