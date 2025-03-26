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
import { BUSINESS_TYPE_SECTIONS } from '../../../../core/models/business-types';
import { ThemeColorsService } from '../../../../core/services/theme/theme-colors.service';

@Component({
  selector: 'app-home-standard',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  templateUrl: './home-standard.component.html',
  styleUrl: './home-standard.component.scss',
})
export class HomeStandardComponent implements OnInit {
  @Input() customizations: any;
  @Input() wholeData: any;
  @Input() isMobileLayout: boolean = false;
  @Input() isMobileView: any;
  @Input() planType: string = 'standard';
  @Input() businessType: string = 'restaurant';
  @Output() sectionSelected = new EventEmitter<string>();

  private themeColorsService = inject(ThemeColorsService);
  primaryColor = signal<string>('');

  // Add default images aligned with small business needs
  defaultHeroImage = 'assets/images/placeholders/business-hero.jpg';
  defaultLogoImage = 'assets/header/webcraft-logo.svg';
  defaultServiceImages = [
    'assets/images/placeholders/service-1.jpg',
    'assets/images/placeholders/service-2.jpg',
    'assets/images/placeholders/service-3.jpg',
  ];
  defaultTeamImages = [
    'assets/images/placeholders/team-1.jpg',
    'assets/images/placeholders/team-2.jpg',
  ];
  defaultGalleryImages = [
    'assets/images/placeholders/gallery-1.jpg',
    'assets/images/placeholders/gallery-2.jpg',
    'assets/images/placeholders/gallery-3.jpg',
    'assets/images/placeholders/gallery-4.jpg',
  ];

  // For business-type specific content
  businessTypes = [
    'restaurant',
    'lawFirm',
    'architecture',
    'realEstate',
    'other',
  ];
  currentBusinessType = 'other';

  // Computed signal for available sections based on business type
  availableSections = computed(() => {
    console.log(
      `Computing available sections for business type: ${this.businessType}`
    );

    // Define base sections for all business types
    const baseBusinessSections = {
      restaurant: ['hero', 'about', 'menu', 'gallery', 'contact'],
      salon: ['hero', 'about', 'services', 'stylists', 'gallery', 'contact'],
      portfolio: ['hero', 'about', 'projects', 'skills', 'contact'],
      retail: ['hero', 'about', 'products', 'categories', 'offers', 'contact'],
      architecture: [
        'hero',
        'about',
        'projects',
        'team',
        'philosophy',
        'contact',
      ],
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

  // Add this method to check if user has premium plan
  isPremiumPlan(): boolean {
    return this.planType === 'premium';
  }

  ngOnInit(): void {
    console.log('Home standard component initialized');
    console.log('Business type:', this.businessType);
    console.log('Plan type:', this.planType);
    console.log('Available sections:', this.availableSections());
    this.currentBusinessType = this.customizations?.businessType || 'other';
    console.log(this.customizations, 'customizations loaded');

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

    // Add scroll effects for hero section
    setTimeout(() => {
      this.initHeroScrollEffects();
    }, 100);
  }

  // Initialize smooth parallax scroll effect for hero section
  initHeroScrollEffects() {
    if (typeof window !== 'undefined' && !this.isMobileView) {
      const heroSection = document.querySelector(
        '.hero-section'
      ) as HTMLElement;

      if (heroSection) {
        // Initial background position setup
        const bgStyle = getComputedStyle(heroSection).backgroundImage;
        if (bgStyle && bgStyle !== 'none') {
          // Store the original background position
          const originalBgPos =
            getComputedStyle(heroSection).backgroundPosition;

          // Add scroll listener
          window.addEventListener('scroll', () => {
            const scrollPosition = window.scrollY;
            const heroHeight = heroSection.offsetHeight;

            // Only apply effect when hero is in view
            if (scrollPosition <= heroHeight) {
              // Calculate parallax position
              const yPos = Math.round(scrollPosition * 0.4);

              // Split the original position into x and y
              const bgParts = originalBgPos.split(' ');
              // Keep x position, change only y position
              heroSection.style.backgroundPosition = `${bgParts[0]} calc(${bgParts[1]} + ${yPos}px)`;

              // Subtle opacity effect for content while scrolling
              const heroContent = heroSection.querySelector(
                '.hero-content'
              ) as HTMLElement;
              if (heroContent) {
                // Reduce opacity as user scrolls down
                const opacity = Math.max(
                  1 - scrollPosition / (heroHeight * 0.8),
                  0.2
                );
                heroContent.style.opacity = opacity.toString();
              }
            }
          });
        }
      }
    }
  }

  // Helper method to check if a section is available
  isSectionAvailable(sectionId: string): boolean {
    return this.availableSections().includes(sectionId);
  }

  // Dummy method to handle edit - just emits the section key.
  handleSectionEdit(sectionKey: string): void {
    console.log('Home component - section selected:', sectionKey);
    this.sectionSelected.emit(`pages.home.${sectionKey}`);
  }

  getImageUrl(
    section: string,
    imageKey: string,
    defaultIndex: number = 0
  ): string {
    // First check if we have a custom image configured
    const sectionData = this.customizations?.[section];
    if (sectionData?.[imageKey]) {
      return sectionData[imageKey];
    }

    // Extract base section type (e.g., 'hero1' -> 'hero')
    const baseSection = section.replace(/\d+$/, '');

    // Return appropriate default image based on section and key
    if (baseSection === 'hero' && imageKey === 'backgroundImage') {
      return this.defaultHeroImage;
    }

    if (imageKey === 'logo') {
      return this.defaultLogoImage;
    }

    if (baseSection === 'services') {
      return this.defaultServiceImages[
        defaultIndex % this.defaultServiceImages.length
      ];
    }

    if (baseSection === 'team') {
      return this.defaultTeamImages[
        defaultIndex % this.defaultTeamImages.length
      ];
    }

    if (baseSection === 'gallery') {
      return this.defaultGalleryImages[
        defaultIndex % this.defaultGalleryImages.length
      ];
    }

    // Return empty string if no default image applies
    return '';
  }

  // Helper to get styling for background images
  getBackgroundStyle(sectionKey: string): Record<string, string> {
    try {
      const bgImage = this.customizations()[sectionKey]?.backgroundImage;
      if (bgImage) {
        return {
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      }
    } catch (error) {
      console.error('Error getting background style', error);
    }
    return {};
  }

  // Get the layout for a section
  getLayout(sectionKey: string): string {
    return this.customizations()[sectionKey]?.layout || 'center';
  }

  // For contact info
  getContactInfo(field: string): string {
    const contactInfo = this.customizations?.contactInfo || {};
    const defaults: { [key: string]: string } = {
      phone: '(123) 456-7890',
      email: 'contact@yourbusiness.com',
      address: '123 Business St, City, State',
      hours: 'Mon-Fri: 9AM-5PM, Sat-Sun: Closed',
    };

    return contactInfo[field] || defaults[field] || '';
  }

  // Get social media links
  getSocialLink(platform: string): string {
    const social = this.customizations?.social || {};
    return social[platform] || '#';
  }

  // Animation helper
  getAnimationDelay(index: number): object {
    return {
      'animation-delay': `${0.1 * index}s`,
    };
  }

  // SECTION !!!
  // Helper method to get array of indexes based on number of services
  getServiceIndexArray(): number[] {
    const numberOfItems = parseInt(
      this.customizations?.services?.numberOfItems || '3'
    );
    return Array(numberOfItems)
      .fill(0)
      .map((_, i) => i);
  }

  // Custom methods for specific business sections
  hasBusinessTypeSection(sectionName: string): boolean {
    // Map business types to their sections
    const businessSections: Record<string, string[]> = {
      restaurant: ['menu', 'reservations', 'location'],
      salon: ['services', 'stylists', 'gallery'],
      portfolio: ['projects', 'skills', 'testimonials'],
      retail: ['products', 'categories', 'offers'],
      architecture: ['projects', 'team', 'philosophy'],
    };

    return businessSections[this.businessType]?.includes(sectionName) || false;
  }

  // Add a method to handle section selection from section-hover-wrapper
  handleSectionSelection(data: { key: string; name: string; path?: string }) {
    console.log('Section selected:', data);

    // Emit event to parent component with full path information
    this.sectionSelected.emit(data.path || data.key);
  }

  // Add or update the method to check if a section should be displayed
  shouldDisplaySection(sectionKey: string): boolean {
    // Direct mapping of business types to their sections
    const businessSections: Record<string, string[]> = {
      restaurant: ['hero1', 'about', 'menu', 'gallery', 'contact'],
      salon: ['hero1', 'about', 'services', 'stylists', 'gallery', 'contact'],
      portfolio: ['hero1', 'about', 'projects', 'skills', 'contact'],
      retail: ['hero1', 'about', 'products', 'categories', 'offers', 'contact'],
      architecture: [
        'hero1',
        'about',
        'projects',
        'team',
        'philosophy',
        'contact',
      ],
    };

    console.log(
      `Checking if section '${sectionKey}' should display for business type: ${this.businessType}`
    );

    // First check if we have a specific mapping for this business type
    if (this.businessType && businessSections[this.businessType]) {
      const shouldDisplay =
        businessSections[this.businessType].includes(sectionKey);
      console.log(
        `Section ${sectionKey} display for ${this.businessType}: ${shouldDisplay}`
      );
      return shouldDisplay;
    }

    // Fallback to default sections
    const defaultSections = ['hero1', 'about', 'services', 'contact'];
    return defaultSections.includes(sectionKey);
  }

  /**
   * Handle direct click on logo to edit it
   */
  handleLogoClick(event: MouseEvent): void {
    // Prevent event propagation
    event.preventDefault();
    event.stopPropagation();

    console.log('Logo clicked for editing');

    // Emit the logo selection event
    this.sectionSelected.emit('header.logoUrl');
  }
}
