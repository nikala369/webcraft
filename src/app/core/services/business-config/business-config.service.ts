import { Injectable } from '@angular/core';
import {
  BUSINESS_TYPE_MENU_ITEMS,
  BUSINESS_TYPES,
} from '../../models/business-types';
import {
  AboutData,
  ContactData,
  Customizations,
  FooterData,
  HeaderData,
  HeroData,
  MenuData,
  ProjectsData,
  ServicesData,
} from '../../models/website-customizations';

@Injectable({
  providedIn: 'root',
})
export class BusinessConfigService {
  /**
   * Get menu items for a specific business type and plan
   */
  getMenuItemsForBusinessType(
    businessType: string,
    plan: 'standard' | 'premium'
  ): Array<{ id: number; label: string; link: string }> {
    // Default menu items if no business type match is found
    const defaultMenuItems = [
      { id: 1, label: 'Home', link: '/' },
      { id: 2, label: 'About', link: '/about' },
      { id: 3, label: 'Contact', link: '/contact' },
    ];

    // Check if we have predefined menu items for this business type
    if (
      BUSINESS_TYPE_MENU_ITEMS[
        businessType as keyof typeof BUSINESS_TYPE_MENU_ITEMS
      ]?.[plan]
    ) {
      return BUSINESS_TYPE_MENU_ITEMS[
        businessType as keyof typeof BUSINESS_TYPE_MENU_ITEMS
      ][plan];
    }

    return defaultMenuItems;
  }

  /**
   * Get available sections for a specific business type and plan
   */
  getAvailableSectionsForBusinessType(
    businessType: string,
    plan: 'standard' | 'premium'
  ): string[] {
    // Define base sections for all business types if not found in configuration
    const defaultSections = {
      restaurant: ['hero', 'about', 'menu', 'contact'],
      salon: ['hero', 'about', 'services', 'contact'],
      portfolio: ['hero', 'about', 'projects', 'contact'],
      architecture: ['hero', 'about', 'projects', 'services', 'contact'],
    };

    // Check if business type exists in our predefined sections
    if (businessType && businessType in defaultSections) {
      return defaultSections[businessType as keyof typeof defaultSections];
    }

    // Default sections if business type is not recognized
    return ['hero', 'about', 'services', 'contact'];
  }

  /**
   * Generate a default business name based on type
   */
  generateBusinessName(businessType: string): string {
    switch (businessType) {
      case 'restaurant':
        return 'Fine Dining';
      case 'salon':
        return 'Beauty Studio';
      case 'architecture':
        return 'Design Works';
      case 'portfolio':
        return 'Creative Portfolio';
      default:
        return 'Your Business';
    }
  }

  /**
   * Generate appropriate default hero data based on business type
   */
  getDefaultHeroData(businessType: string): HeroData {
    const heroTitles = {
      restaurant: 'Exceptional Dining Experience',
      salon: 'Beauty & Style Redefined',
      architecture: 'Innovative Architectural Solutions',
      portfolio: 'Creative Work That Stands Out',
    };

    const heroSubtitles = {
      restaurant: 'Delicious cuisine in an unforgettable atmosphere',
      salon: 'Expert stylists dedicated to bringing out your natural beauty',
      architecture: 'Transforming spaces into exceptional experiences',
      portfolio: 'Showcasing creativity and skill in every project',
    };

    return {
      backgroundType: 'image',
      backgroundImage: 'assets/standard-hero1/background-image1.jpg',
      backgroundVideo: '',
      overlayOpacity: 'medium',
      overlayColor: '#000000',
      showContentText: true,
      title:
        heroTitles[businessType as keyof typeof heroTitles] ||
        'Grow Your Business With Us',
      subtitle:
        heroSubtitles[businessType as keyof typeof heroSubtitles] ||
        'Professional solutions tailored to your business needs',
      layout: 'center',
      showLogo: true,
      titleColor: '#ffffff',
      subtitleColor: '#f0f0f0',
      textShadow: 'medium',
      showPrimaryButton: true,
      primaryButtonText: 'GET STARTED',
      primaryButtonColor: '#ff5722',
      primaryButtonTextColor: '#ffffff',
      primaryButtonLink: '/contact',
    };
  }

  /**
   * Generate default header data
   */
  getDefaultHeaderData(
    businessType: string,
    plan: 'standard' | 'premium'
  ): HeaderData {
    return {
      backgroundColor: '#2876FF',
      textColor: '#ffffff',
      logoUrl: '',
      menuItems: this.getMenuItemsForBusinessType(businessType, plan),
    };
  }

  /**
   * Generate default footer data
   */
  getDefaultFooterData(businessType: string): FooterData {
    return {
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      copyrightText: `© ${new Date().getFullYear()} ${this.generateBusinessName(
        businessType
      )}`,
    };
  }

  /**
   * Generate default about section data based on business type
   */
  getDefaultAboutData(businessType: string): AboutData {
    const aboutContent = {
      restaurant:
        'We are a family-owned restaurant dedicated to providing exceptional dining experiences with locally-sourced ingredients and innovative recipes.',
      salon:
        'Our skilled team of stylists brings years of experience and a passion for beauty to every client, ensuring you look and feel your best.',
      architecture:
        'With a focus on sustainable design and functional elegance, our architectural studio transforms concepts into stunning spaces.',
      portfolio:
        'I am a creative professional specializing in delivering high-quality work that exceeds expectations and showcases innovation.',
    };

    return {
      title: 'About Us',
      subtitle: 'Our Story',
      content:
        aboutContent[businessType as keyof typeof aboutContent] ||
        'We are dedicated to delivering excellence in everything we do.',
      backgroundColor: '#ffffff',
      textColor: '#333333',
    };
  }

  /**
   * Generate section-specific default data based on business type
   */
  getDefaultSectionData(sectionType: string, businessType: string): any {
    switch (sectionType) {
      case 'services':
        return this.getDefaultServicesData(businessType);
      case 'menu':
        return this.getDefaultMenuData();
      case 'projects':
        return this.getDefaultProjectsData(businessType);
      case 'contact':
        return this.getDefaultContactData(businessType);
      default:
        return {};
    }
  }

  /**
   * Generate default services data based on business type
   */
  private getDefaultServicesData(businessType: string): ServicesData {
    const servicesByType: Record<
      string,
      Array<{ id: number; title: string; description: string; price?: string }>
    > = {
      salon: [
        {
          id: 1,
          title: 'Haircut & Styling',
          description:
            'Professional haircut and styling tailored to your preferences.',
          price: '$45+',
        },
        {
          id: 2,
          title: 'Color Treatment',
          description:
            'Full color, highlights, or balayage by expert colorists.',
          price: '$85+',
        },
        {
          id: 3,
          title: 'Spa Facial',
          description: 'Rejuvenating facial treatments for all skin types.',
          price: '$75+',
        },
      ],
      architecture: [
        {
          id: 1,
          title: 'Residential Design',
          description:
            'Custom home design focusing on functionality and aesthetics.',
        },
        {
          id: 2,
          title: 'Commercial Projects',
          description: 'Office and retail spaces optimized for business needs.',
        },
        {
          id: 3,
          title: 'Interior Design',
          description:
            'Transforming interiors with creative space planning and design.',
        },
      ],
    };

    return {
      title: 'Our Services',
      subtitle: 'What We Offer',
      services: servicesByType[businessType] || [
        {
          id: 1,
          title: 'Service 1',
          description: 'Description of your first service.',
          price: '$99',
        },
        {
          id: 2,
          title: 'Service 2',
          description: 'Description of your second service.',
          price: '$149',
        },
        {
          id: 3,
          title: 'Service 3',
          description: 'Description of your third service.',
          price: '$199',
        },
      ],
      backgroundColor: '#f9f9f9',
      textColor: '#333333',
    };
  }

  /**
   * Generate default menu data for restaurants
   */
  private getDefaultMenuData(): MenuData {
    return {
      title: 'Our Menu',
      subtitle: 'Fresh Ingredients, Exceptional Taste',
      categories: [
        {
          id: 1,
          name: 'Starters',
          items: [
            {
              id: 1,
              name: 'Bruschetta',
              description:
                'Toasted bread with fresh tomatoes, garlic, and basil.',
              price: '$8',
              featured: true,
            },
            {
              id: 2,
              name: 'Soup of the Day',
              description: 'Ask your server about our daily special.',
              price: '$7',
            },
          ],
        },
        {
          id: 2,
          name: 'Main Courses',
          items: [
            {
              id: 3,
              name: 'Grilled Salmon',
              description: 'Fresh salmon with seasonal vegetables.',
              price: '$22',
              featured: true,
            },
            {
              id: 4,
              name: 'Pasta Primavera',
              description:
                'Fresh pasta with seasonal vegetables in a light cream sauce.',
              price: '$18',
            },
          ],
        },
      ],
      backgroundColor: '#ffffff',
      textColor: '#333333',
    };
  }

  /**
   * Generate default projects data for portfolio/architecture
   */
  private getDefaultProjectsData(businessType: string): ProjectsData {
    return {
      title: businessType === 'architecture' ? 'Our Projects' : 'My Work',
      subtitle:
        businessType === 'architecture'
          ? 'Featured Architectural Designs'
          : 'Selected Portfolio Pieces',
      projects: [
        {
          id: 1,
          title: 'Project One',
          description: 'Brief description of this featured project.',
          imageUrl: 'assets/placeholder-project1.jpg',
        },
        {
          id: 2,
          title: 'Project Two',
          description: 'Brief description of this featured project.',
          imageUrl: 'assets/placeholder-project2.jpg',
        },
      ],
      backgroundColor: '#f9f9f9',
      textColor: '#333333',
    };
  }

  /**
   * Generate default contact data based on business type
   */
  private getDefaultContactData(businessType: string): ContactData {
    return {
      title: 'Contact Us',
      subtitle: 'Get in Touch',
      address: '123 Business St., City, State',
      phone: '(555) 123-4567',
      email: `info@${businessType.toLowerCase()}business.com`,
      showMap: true,
      backgroundColor: '#ffffff',
      textColor: '#333333',
    };
  }

  /**
   * Create a complete customization structure with appropriate defaults for a business type
   */
  generateDefaultCustomizations(
    businessType: string,
    plan: 'standard' | 'premium'
  ): Customizations {
    return {
      fontConfig: {
        fontId: 1,
        family: 'Roboto',
        fallback: 'sans-serif',
      },
      header: this.getDefaultHeaderData(businessType, plan),
      pages: {
        home: {
          hero1: this.getDefaultHeroData(businessType),
          about: this.getDefaultAboutData(businessType),
          // Add default data for relevant sections based on business type
          ...(businessType === 'restaurant'
            ? { menu: this.getDefaultMenuData() }
            : {}),
          ...(businessType === 'salon'
            ? { services: this.getDefaultServicesData(businessType) }
            : {}),
          ...(businessType === 'architecture' || businessType === 'portfolio'
            ? { projects: this.getDefaultProjectsData(businessType) }
            : {}),
          // Always include contact
          contact: this.getDefaultContactData(businessType),
        },
      },
      footer: this.getDefaultFooterData(businessType),
    };
  }

  /**
   * Ensure a customization structure has all required objects
   * This prevents "undefined" errors when accessing deeply nested properties
   */
  ensureCompleteCustomizationStructure(
    customizations: Customizations,
    businessType: string,
    plan: 'standard' | 'premium'
  ): Customizations {
    const updated = structuredClone(customizations);

    // Ensure pages object exists
    if (!updated.pages) {
      updated.pages = {};
    }

    // Ensure home object exists
    if (!updated.pages.home) {
      updated.pages.home = {};
    }

    // Ensure header exists with proper menu items for the business type
    if (!updated.header) {
      updated.header = this.getDefaultHeaderData(businessType, plan);
    } else if (
      !updated.header.menuItems ||
      updated.header.menuItems.length === 0
    ) {
      updated.header.menuItems = this.getMenuItemsForBusinessType(
        businessType,
        plan
      );
    }

    // Ensure hero1 object exists with default values if not set
    if (!updated.pages.home.hero1) {
      updated.pages.home.hero1 = this.getDefaultHeroData(businessType);
    } else {
      // If hero1 exists but missing some of the new properties, set defaults
      const hero1 = updated.pages.home.hero1;

      if (hero1.backgroundType === undefined) hero1.backgroundType = 'image';
      if (hero1.backgroundVideo === undefined) hero1.backgroundVideo = '';
      if (hero1.overlayOpacity === undefined) hero1.overlayOpacity = 'medium';
      if (hero1.overlayColor === undefined) hero1.overlayColor = '#000000';
      if (hero1.showContentText === undefined) hero1.showContentText = true;
    }

    // Ensure we have section data appropriate for the business type
    const sections = this.getAvailableSectionsForBusinessType(
      businessType,
      plan
    );
    sections.forEach((section) => {
      if (section !== 'hero' && !updated.pages?.home?.[section]) {
        if (!updated.pages!.home![section]) {
          updated.pages!.home![section] = this.getDefaultSectionData(
            section,
            businessType
          );
        }
      }
    });

    // Ensure we have a footer
    if (!updated.footer) {
      updated.footer = this.getDefaultFooterData(businessType);
    }

    return updated;
  }
}
