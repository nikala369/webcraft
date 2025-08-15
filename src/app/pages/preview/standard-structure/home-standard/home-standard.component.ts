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
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Customizations,
  HeroData,
} from '../../../../core/models/website-customizations';
// SectionHoverWrapperComponent is used in child section components
import { ThemeColorsService } from '../../../../core/services/theme/theme-colors.service';
import { BusinessConfigService } from '../../../../core/services/business-config/business-config.service';
import { Router } from '@angular/router';

// Import enhanced hero section models
import {
  CTAClickEvent,
  ButtonActionType,
  EnhancedHeroData,
} from './components/hero-section/hero-section.model';

// Import all section components
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { AboutSectionComponent } from './components/about-section/about-section.component';
import { MenuSectionComponent } from './components/menu-section/menu-section.component';
import { ServicesSectionComponent } from './components/services-section/services-section.component';
import { ProjectsSectionComponent } from './components/projects-section/projects-section.component';
import { ContactSectionComponent } from './components/contact-section/contact-section.component';
// ComponentCustomizerComponent is handled at parent level

@Component({
  selector: 'app-home-standard',
  standalone: true,
  imports: [
    CommonModule,
    HeroSectionComponent,
    AboutSectionComponent,
    MenuSectionComponent,
    ProjectsSectionComponent,
    ServicesSectionComponent,
    ContactSectionComponent,
  ],
  templateUrl: './home-standard.component.html',
  styleUrl: './home-standard.component.scss',
})
export class HomeStandardComponent implements OnInit, OnChanges {
  @Input({ required: true }) pagesHomeData!: Signal<any>;
  @Input({ required: true }) wholeData!: Signal<Customizations | null>;
  @Input() isMobileLayout: boolean = false;
  @Input() isMobileView: string = 'view-desktop';
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'restaurant';
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  private themeColorsService = inject(ThemeColorsService);
  private businessConfigService = inject(BusinessConfigService);
  private router = inject(Router);
  primaryColor = signal<string>('');

  // Track data updates for debugging
  lastCustomizationsUpdate = signal<number>(Date.now());

  // Add computed signals for each section
  aboutDataSignal = computed(() => this.wholeData()?.pages?.home?.about || {});
  menuDataSignal = computed(() => {
    const wholeData = this.wholeData();
    const menuData = wholeData?.pages?.home?.menu || {};

    // Only return menu data if wholeData is properly loaded
    // This prevents race conditions during initialization
    if (!wholeData || !wholeData.pages || !wholeData.pages.home) {
      return {};
    }

    return menuData;
  });
  servicesDataSignal = computed(
    () => this.wholeData()?.pages?.home?.services || {}
  );
  projectsDataSignal = computed(
    () => this.wholeData()?.pages?.home?.projects || {}
  );
  contactDataSignal = computed(
    () => this.wholeData()?.pages?.home?.contact || {}
  );
  heroDataSignal = computed((): EnhancedHeroData => {
    const heroData = this.wholeData()?.pages?.home?.hero1 || ({} as any);

    // Ensure we have the required properties for EnhancedHeroData
    return {
      backgroundImage: heroData.backgroundImage || '',
      title: heroData.title || '',
      subtitle: heroData.subtitle || '',
      ...heroData,
    } as EnhancedHeroData;
  });

  ngOnInit(): void {
    // HomeStandardComponent initialized

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
    if (changes['pagesHomeData'] || changes['wholeData']) {
      // ngOnChanges detected changes
      this.lastCustomizationsUpdate.set(Date.now());
    }

    // Update business type if changed
    if (changes['businessType']) {
      // BusinessType changed
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
   * CRITICAL FIX: Emit proper object structure, not string
   */
  handleSectionSelection(data: { key: string; name: string; path?: string }) {
    console.log('[HomeStandard] Section selection received:', data);

    // Create properly structured event object
    const eventData = {
      key: data.key,
      name: data.name,
      path: data.path || `pages.home.${data.key}`,
    };

    console.log('[HomeStandard] Emitting structured event:', eventData);
    this.sectionSelected.emit(eventData);
  }

  // ======== ENHANCED HERO SECTION EVENT HANDLERS ========

  /**
   * Handle CTA button click with proper action routing
   */
  handleHeroCTAClick(event: CTAClickEvent): void {
    console.log('[SmartCTA] Hero CTA clicked:', event);

    if (!event.action) {
      console.warn('[SmartCTA] No action specified for CTA click');
      return;
    }

    switch (event.action) {
      case 'scroll':
        if (event.scrollTarget || event.target) {
          this.scrollToSection(event.scrollTarget || event.target || '');
        }
        break;
      case 'navigate':
        if (event.navigateTarget || event.target) {
          this.router.navigate([event.navigateTarget || event.target]);
        }
        break;
      case 'link':
        const link = event.link || event.target;
        if (link) {
          if (link.startsWith('http')) {
            window.open(link, '_blank');
          } else if (link.startsWith('tel:')) {
            window.location.href = link;
          } else if (link.startsWith('mailto:')) {
            window.location.href = link;
          } else {
            this.router.navigate([link]);
          }
        }
        break;
      case 'modal':
        // Handle modal action if needed in future
        console.log('[SmartCTA] Modal action not implemented yet');
        break;
      default:
        console.warn('[SmartCTA] Unknown action type:', event.action);
    }
  }

  /**
   * Handle business hours widget clicks from hero section
   */
  handleHeroBusinessHoursClick(): void {
    // Scroll to contact section which typically contains business hours
    this.scrollToSection('contact');
  }

  /**
   * Handle scroll indicator clicks from hero section
   */
  handleHeroScrollIndicatorClick(): void {
    // Scroll to the next section (typically about)
    this.scrollToNextSection();
  }

  // ======== SCROLL FUNCTIONALITY (Moved from Hero Section) ========

  /**
   * Smooth scroll to a section by ID
   */
  private scrollToSection(sectionId: string): void {
    // Wait a bit for DOM to be ready
    setTimeout(() => {
      // Find the target element using multiple strategies
      let targetElement = document.getElementById(sectionId);

      if (!targetElement) {
        // Try with section selector
        targetElement = document.querySelector(
          `section#${sectionId}`
        ) as HTMLElement;
      }

      if (!targetElement) {
        // Try within the structure container
        const structureContainer = document.querySelector(
          '.structure-container'
        );
        if (structureContainer) {
          targetElement = structureContainer.querySelector(
            `#${sectionId}`
          ) as HTMLElement;
        }
      }

      if (!targetElement) {
        // Try finding any element with the matching ID attribute
        targetElement = document.querySelector(
          `[id="${sectionId}"]`
        ) as HTMLElement;
      }

      if (targetElement) {
        // Simple scrollIntoView approach that works in all cases
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });

        // Scrolled to section using scrollIntoView
      } else {
        // Target section not found for scroll
      }
    }, 100); // Small delay to ensure DOM is ready
  }

  /**
   * Scroll to the next section after hero
   */
  private scrollToNextSection(): void {
    // Logic to determine the next section based on business type
    let nextSection = 'about'; // Default

    // Could be enhanced to be more intelligent about which section is next
    // based on the current scroll position or business type
    const businessTypeLower = this.businessType?.toLowerCase() || '';
    if (businessTypeLower === 'restaurant') {
      nextSection = 'about'; // or 'menu' if about is not prominent
    } else if (businessTypeLower === 'salon') {
      nextSection = 'about'; // or 'services' if about is not prominent
    } else if (
      businessTypeLower === 'architecture' ||
      businessTypeLower === 'portfolio'
    ) {
      nextSection = 'about'; // or 'projects' if about is not prominent
    }

    this.scrollToSection(nextSection);
  }

  /**
   * Get sections based on business type
   */
  getBusinessTypeSections(): string[] {
    const commonSections = ['hero', 'about', 'contact'];

    const businessTypeLower = this.businessType?.toLowerCase() || '';
    if (businessTypeLower === 'restaurant') {
      return [...commonSections, 'menu'];
    } else if (businessTypeLower === 'salon') {
      return [...commonSections, 'services'];
    } else if (
      businessTypeLower === 'architecture' ||
      businessTypeLower === 'portfolio'
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

  /**
   * Check if current business type should show restaurant-style menu section
   * FIXED: Handle both uppercase and lowercase business types for robust matching
   */
  isRestaurantType(): boolean {
    const businessTypeLower = this.businessType?.toLowerCase() || '';
    return ['restaurant', 'cafe', 'bar'].includes(businessTypeLower);
  }

  /**
   * Check if current business type should show services section
   * FIXED: Handle both uppercase and lowercase business types for robust matching
   */
  isServiceType(): boolean {
    const businessTypeLower = this.businessType?.toLowerCase() || '';
    return ['salon', 'spa', 'beauty', 'fitness', 'gym'].includes(
      businessTypeLower
    );
  }
}
