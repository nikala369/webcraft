import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnInit,
  ElementRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHoverWrapperComponent } from '../../../../components/section-hover-wrapper/section-hover-wrapper.component';
import { ThemeColorsService } from '../../../../../../core/services/theme/theme-colors.service';

interface ServiceItem {
  title: string;
  description: string;
  price?: string;
  duration?: string;
  image?: string;
  featured?: boolean;
  bookingUrl?: string;
}

@Component({
  selector: 'app-services-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  templateUrl: './services-section.component.html',
  styleUrls: ['./services-section.component.scss'],
})
export class ServicesSectionComponent implements OnInit, OnChanges {
  @Input() customizations: any;
  @Input() wholeData: any;
  @Input() isMobileLayout: boolean = false;
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'salon';
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  private themeColorsService = inject(ThemeColorsService);
  private elementRef = inject(ElementRef);

  // Maximum number of services to display
  private readonly maxServices = 10;

  // Timestamp to track last update (for debugging)
  lastUpdateTime = new Date().toISOString();

  // Default salon services
  private defaultSalonServices: ServiceItem[] = [
    {
      title: 'Haircut & Styling',
      description:
        'Professional haircut and styling tailored to your preferences and face shape.',
      price: '$40',
      duration: '45 min',
      image:
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    },
    {
      title: 'Color & Highlights',
      description:
        'Full color or highlights performed with premium products for vibrant, long-lasting results.',
      price: '$85',
      duration: '90 min',
      image:
        'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    },
    {
      title: 'Manicure & Pedicure',
      description:
        'Relaxing nail treatment including cuticle care, nail shaping, and polish application.',
      price: '$55',
      duration: '60 min',
      image:
        'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    },
    {
      title: 'Facial Treatment',
      description:
        'Rejuvenating facial customized to your skin type to cleanse, exfoliate, and hydrate.',
      price: '$70',
      duration: '50 min',
      image:
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    },
  ];

  ngOnInit() {
    console.log('ServicesSectionComponent initialized for:', this.businessType);
    console.log('Initial whole data:', this.wholeData);
    console.log('Initial customizations:', this.customizations);

    // Check if this business type supports services
    if (!this.supportsBusinessType()) {
      console.warn(
        `Services section not supported for business type: ${this.businessType}`
      );
      return;
    }

    // Apply custom colors from configuration
    this.applyCustomColors();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Skip if this business type doesn't support services
    if (!this.supportsBusinessType()) {
      return;
    }

    // Track changes for debugging
    if (changes['customizations'] || changes['wholeData']) {
      this.lastUpdateTime = new Date().toISOString();
      console.log('Services section received update at:', this.lastUpdateTime);

      if (changes['customizations']) {
        console.log('New customizations:', this.customizations);
      }
      if (changes['wholeData']) {
        console.log('New wholeData:', this.wholeData);
      }
    }

    // Reapply styles when inputs change
    this.applyCustomColors();
  }

  /**
   * Apply custom colors from configuration
   */
  private applyCustomColors(): void {
    const host = this.elementRef.nativeElement;
    const data = this.getSectionData();

    console.log('Applying colors to services section:', data);

    // Apply primary accent color
    const primaryColor = this.themeColorsService.getPrimaryColor(this.planType);
    host.style.setProperty('--primary-accent-color', primaryColor);

    // Apply section background color
    if (data?.backgroundColor) {
      host.style.setProperty('--section-bg-color', data.backgroundColor);
    }

    // Apply text color
    if (data?.textColor) {
      host.style.setProperty('--text-color', data.textColor);
      host.style.setProperty('--heading-color', data.textColor);
    }

    // Apply card background color
    if (data?.cardBackgroundColor) {
      host.style.setProperty('--card-bg-color', data.cardBackgroundColor);
    }

    // Apply accent color (overrides primary if specified)
    if (data?.accentColor) {
      host.style.setProperty('--primary-accent-color', data.accentColor);
    }
  }

  /**
   * Check if the current business type supports services section
   */
  supportsBusinessType(): boolean {
    // Services section is only for salon business type
    return this.businessType === 'salon';
  }

  /**
   * Get section title based on business type or customization
   */
  getSectionTitle(): string {
    // Check if there's customization data
    const data = this.getSectionData();
    if (data?.title) {
      return data.title;
    }

    const titles = {
      salon: 'Our Beauty Services',
      architecture: 'Our Architectural Services',
      portfolio: 'Services I Offer',
    };

    return titles[this.businessType as keyof typeof titles] || 'Our Services';
  }

  /**
   * Get section subtitle based on business type or customization
   */
  getSectionSubtitle(): string {
    // Check if there's customization data
    const data = this.getSectionData();
    if (data?.subtitle) {
      return data.subtitle;
    }

    const subtitles = {
      salon: 'Professional beauty treatments tailored to your needs',
      architecture: 'Comprehensive architectural solutions for every project',
      portfolio: 'Specialized creative services to help your business grow',
    };

    return (
      subtitles[this.businessType as keyof typeof subtitles] ||
      'Professional services tailored to your needs'
    );
  }

  /**
   * Get services list based on business type or customization
   */
  getServices(): ServiceItem[] {
    // Get data from customizations
    const data = this.getSectionData();

    // Check for services data using specific paths in priority order
    if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
      console.log(`Found custom ${data.items.length} services:`, data.items);
      // Limit to maximum number of services
      return data.items.slice(0, this.maxServices);
    }

    console.log('Using default services for business type:', this.businessType);

    // Return appropriate default services based on business type (already limited by definition)
    if (this.businessType === 'salon') {
      return this.defaultSalonServices;
    } else if (this.businessType === 'architecture') {
      return this.defaultArchitectureServices;
    } else if (this.businessType === 'portfolio') {
      return this.defaultPortfolioServices;
    }

    // Fallback to salon services if business type isn't recognized
    return this.defaultSalonServices;
  }

  /**
   * Get the services section data from customizations
   */
  private getSectionData(): any {
    // Look for data in different possible locations with detailed logging
    let data: any = null;
    console.log(
      'Searching for services data in:',
      this.wholeData,
      this.customizations
    );

    // First check in wholeData path (highest priority)
    if (this.wholeData?.pages?.home?.services) {
      console.log('Found services data in wholeData.pages.home.services');
      data = this.wholeData.pages.home.services;
    }
    // Then check in customizations
    else if (this.customizations?.pages?.home?.services) {
      console.log('Found services data in customizations.pages.home.services');
      data = this.customizations.pages.home.services;
    }
    // Fallback to top-level customizations
    else if (this.customizations) {
      console.log('Using top-level customizations data');
      data = this.customizations;
    }

    // Log what we found to help diagnose issues
    if (data?.items) {
      console.log(`Found ${data.items.length} services:`, data.items);
    } else {
      console.log('No services data found in customizations, using defaults');
    }

    return data;
  }

  /**
   * Handle section selection
   */
  handleSectionSelection() {
    this.sectionSelected.emit({
      key: 'services',
      name: 'Services Section',
      path: 'pages.home.services',
    });
  }

  /**
   * Check if a service has an image
   */
  hasImage(service: ServiceItem): boolean {
    return !!service.image;
  }

  /**
   * Check if a service is featured (premium only)
   */
  isFeatured(service: ServiceItem): boolean {
    return !!service.featured && this.planType === 'premium';
  }

  /**
   * Get animation delay based on index for staggered animations
   */
  getAnimationDelay(index: number): object {
    const delay = 0.1 + index * 0.1;
    return {
      'animation-delay': `${delay}s`,
    };
  }

  /**
   * Check if we're using premium plan
   */
  isPremium(): boolean {
    return this.planType === 'premium';
  }

  private defaultArchitectureServices: ServiceItem[] = [
    {
      title: 'Residential Design',
      description:
        'Custom home designs that balance aesthetics, functionality, and sustainability.',
      image:
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    },
    {
      title: 'Commercial Architecture',
      description:
        'Innovative commercial spaces that enhance productivity and user experience.',
      image:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    },
    {
      title: 'Renovation Planning',
      description:
        'Thoughtful renovation designs that respect existing structures while modernizing spaces.',
      image:
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    },
    {
      title: 'Architectural Consulting',
      description:
        'Expert advice on architectural decisions, materials, and sustainable building practices.',
      image:
        'https://images.unsplash.com/photo-1503174971373-b1f69c758416?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    },
  ];

  private defaultPortfolioServices: ServiceItem[] = [
    {
      title: 'UI/UX Design',
      description:
        'User-centered design solutions for web and mobile applications.',
      image:
        'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    },
    {
      title: 'Brand Identity',
      description:
        'Comprehensive branding solutions including logos, style guides, and visual identity systems.',
      image:
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    },
    {
      title: 'Web Development',
      description:
        'Custom website development with modern technologies and responsive design.',
      image:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    },
    {
      title: 'Content Creation',
      description:
        'Professional photography, copywriting, and visual content for your digital presence.',
      image:
        'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60',
    },
  ];
}
