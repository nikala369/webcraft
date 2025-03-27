import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHoverWrapperComponent } from '../../../../components/section-hover-wrapper/section-hover-wrapper.component';
import { ThemeColorsService } from '../../../../../../core/services/theme/theme-colors.service';

interface ServiceItem {
  title: string;
  description: string;
  price?: string;
  duration?: string;
  icon?: string;
  image?: string;
  featured?: boolean;
}

@Component({
  selector: 'app-services-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  templateUrl: './services-section.component.html',
  styleUrls: ['./services-section.component.scss'],
})
export class ServicesSectionComponent {
  @Input() customizations: any;
  @Input() isMobileLayout: boolean = false;
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'salon';
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  private themeColorsService = inject(ThemeColorsService);

  // Default service icons
  defaultIcons = [
    'assets/standard-services/service-icon1.svg',
    'assets/standard-services/service-icon2.svg',
    'assets/standard-services/service-icon3.svg',
  ];

  // Default services by business type
  private defaultSalonServices: ServiceItem[] = [
    {
      title: 'Hair Styling',
      description:
        'Professional hair styling services including cuts, coloring, and treatments.',
      price: 'From $45',
      duration: '30-60 min',
      icon: 'assets/standard-services/service-icon1.svg',
    },
    {
      title: 'Facial Treatments',
      description:
        'Rejuvenating facials customized to your skin type and concerns.',
      price: 'From $65',
      duration: '45 min',
      icon: 'assets/standard-services/service-icon2.svg',
    },
    {
      title: 'Manicure & Pedicure',
      description:
        'Complete nail care services including polish, gel, and nail art.',
      price: 'From $35',
      duration: '30-45 min',
      icon: 'assets/standard-services/service-icon3.svg',
    },
  ];

  private defaultArchitectureServices: ServiceItem[] = [
    {
      title: 'Residential Design',
      description:
        'Custom home designs that balance aesthetics, functionality, and sustainability.',
      icon: 'assets/standard-services/service-icon1.svg',
    },
    {
      title: 'Commercial Architecture',
      description:
        'Innovative commercial spaces that enhance productivity and user experience.',
      icon: 'assets/standard-services/service-icon2.svg',
    },
    {
      title: 'Renovation Planning',
      description:
        'Thoughtful renovation designs that respect existing structures while modernizing spaces.',
      icon: 'assets/standard-services/service-icon3.svg',
    },
  ];

  private defaultPortfolioServices: ServiceItem[] = [
    {
      title: 'UI/UX Design',
      description:
        'User-centered design solutions for web and mobile applications.',
      icon: 'assets/standard-services/service-icon1.svg',
    },
    {
      title: 'Brand Identity',
      description:
        'Comprehensive branding solutions including logos, style guides, and visual identity systems.',
      icon: 'assets/standard-services/service-icon2.svg',
    },
    {
      title: 'Web Development',
      description:
        'Custom website development with modern technologies and responsive design.',
      icon: 'assets/standard-services/service-icon3.svg',
    },
  ];

  /**
   * Get section title based on business type or customization
   */
  getSectionTitle(): string {
    if (this.customizations?.pages?.home?.services?.title) {
      return this.customizations.pages.home.services.title;
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
    if (this.customizations?.pages?.home?.services?.subtitle) {
      return this.customizations.pages.home.services.subtitle;
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
    if (this.customizations?.pages?.home?.services?.items) {
      return this.customizations.pages.home.services.items;
    }

    // Return appropriate default services based on business type
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
   * Check if service has pricing information
   */
  hasPrice(service: ServiceItem): boolean {
    return !!service.price;
  }

  /**
   * Check if service has duration information
   */
  hasDuration(service: ServiceItem): boolean {
    return !!service.duration;
  }

  /**
   * Check if service has an icon
   */
  hasIcon(service: ServiceItem): boolean {
    return !!service.icon;
  }

  /**
   * Check if service has an image (Premium feature)
   */
  hasImage(service: ServiceItem): boolean {
    return !!service.image && this.planType === 'premium';
  }

  /**
   * Get default icon if none is specified
   */
  getServiceIcon(service: ServiceItem, index: number): string {
    return service.icon || this.defaultIcons[index % this.defaultIcons.length];
  }

  /**
   * Calculate animation delay based on index
   */
  getAnimationDelay(index: number): object {
    const delay = 0.1 + index * 0.1;
    return {
      'animation-delay': `${delay}s`,
    };
  }
}
