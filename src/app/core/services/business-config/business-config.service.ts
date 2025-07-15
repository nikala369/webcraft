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

export interface BusinessTypeConfig {
  displayName: string;
  color: string;
  sections: string[];
  // CTA Button configuration for hero1
  ctaButton?: {
    text: string;
    scrollTargetID: string;
    description: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class BusinessConfigService {
  // Business configs will come from backend template data
  // This is now just a fallback for development
  private businessConfigs: Record<string, BusinessTypeConfig> = {};

  /**
   * Set business config from backend template data
   * This should be called when template is loaded from API
   */
  setBusinessConfigFromTemplate(
    businessType: string,
    templateConfig: any
  ): void {
    this.businessConfigs[businessType] = {
      displayName: templateConfig.displayName || businessType,
      color: templateConfig.brandColor || '#666666',
      sections: templateConfig.sections || ['hero1', 'about', 'contact'],
      ctaButton: templateConfig.ctaButton || {
        text: 'Get Started',
        scrollTargetID: 'contact',
        description: 'Default CTA button',
      },
    };
  }

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
      architecture: ['hero', 'about', 'projects', 'contact'],
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
   * Get smart CTA button defaults based on business type
   */
  private getSmartCTADefaults(businessType: string): {
    buttonText: string;
    buttonScrollTargetID: string;
  } {
    switch (businessType) {
      case 'restaurant':
      case 'cafe':
      case 'bar':
        return {
          buttonText: 'View Menu',
          buttonScrollTargetID: 'menu',
        };

      case 'salon':
      case 'spa':
      case 'beauty':
        return {
          buttonText: 'Book Appointment',
          buttonScrollTargetID: 'services',
        };

      case 'fitness':
      case 'gym':
        return {
          buttonText: 'Join Now',
          buttonScrollTargetID: 'services',
        };

      case 'architecture':
      case 'portfolio':
      case 'creative':
        return {
          buttonText: 'View Portfolio',
          buttonScrollTargetID: 'projects',
        };

      case 'consulting':
      case 'business':
      case 'professional':
        return {
          buttonText: 'Get Consultation',
          buttonScrollTargetID: 'contact',
        };

      default:
        console.log(
          `[BusinessConfigService] Using default CTA for unknown business type: ${businessType}`
        );
        return {
          buttonText: 'Get Started',
          buttonScrollTargetID: 'contact',
        };
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

    // Smart CTA button defaults based on business type
    const ctaDefaults = this.getSmartCTADefaults(businessType);

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
      titleColor: '#ffffff',
      subtitleColor: '#f0f0f0',
      textShadow: 'medium',
      // CTA Button defaults - smart defaults based on business type
      showButton: true,
      buttonText: ctaDefaults.buttonText,
      buttonScrollTargetID: ctaDefaults.buttonScrollTargetID,
      buttonBackgroundColor: '#2876ff',
      buttonTextColor: '#ffffff',
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
      tagline: this.getDefaultTagline(businessType),
      address: this.getDefaultAddress(businessType),
      phone: this.getDefaultPhone(),
      email: this.getDefaultEmail(businessType),
      showSocialLinks: true,
      socialUrls: this.getDefaultSocialUrls(businessType),
    };
  }

  /**
   * Get default about section data based on business type
   */
  getDefaultAboutData(businessType: string): AboutData {
    const baseData = {
      backgroundColor: '#ffffff',
      textColor: '#333333',
    };

    // Business-specific data
    switch (businessType) {
      case 'restaurant':
        return {
          ...baseData,
          title: 'About Our Restaurant',
          subtitle: 'Our Culinary Story',
          storyTitle: 'Our Culinary Journey',
          storyText:
            'Founded in 2015, our restaurant brings together the finest ingredients and culinary expertise. Our chefs are dedicated to creating memorable dining experiences with innovative flavors and traditional techniques.',
          missionTitle: 'Our Food Philosophy',
          missionText:
            'We believe in sustainable, locally-sourced ingredients that support our community while delivering exceptional flavor. Every dish is crafted with care, creating a dining experience that honors culinary traditions while embracing innovation.',
          imageUrl: 'assets/standard-hero1/background-image2.jpg',
          values: ['Quality', 'Sustainability', 'Tradition', 'Innovation'],
          textColor: '#333333',
        };
      case 'salon':
        return {
          ...baseData,
          title: 'About Our Salon',
          subtitle: 'Excellence in Beauty',
          storyTitle: 'Our Beginnings',
          storyText:
            "Established in 2010, our salon was born from a passion for beauty and self-expression. We've assembled a team of experienced stylists who are committed to helping our clients look and feel their best.",
          missionTitle: 'Our Approach',
          missionText:
            'We use only premium products and stay current with the latest techniques to ensure our clients receive the highest quality service. Our commitment to ongoing education and client satisfaction sets us apart.',
          imageUrl: 'assets/standard-hero1/background-image3.jpg',
          values: ['Expertise', 'Quality', 'Innovation', 'Individuality'],
          textColor: '#333333',
        };
      case 'architecture':
        return {
          ...baseData,
          title: 'About Our Firm',
          subtitle: 'Creating Spaces That Inspire',
          storyTitle: 'Our Design Philosophy',
          storyText:
            'With over a decade of experience, our architectural firm specializes in blending functionality with aesthetic excellence. We approach each project with a fresh perspective, focusing on sustainable design and client satisfaction.',
          missionTitle: 'Our Commitment',
          missionText:
            "We are dedicated to creating spaces that inspire, function flawlessly, and exceed our clients' expectations. Our collaborative approach ensures that each project reflects the unique vision and requirements of our clients.",
          imageUrl: 'assets/standard-hero1/background-image1.jpg',
          values: [
            'Innovation',
            'Sustainability',
            'Functionality',
            'Client-Focused',
          ],
          textColor: '#333333',
        };
      case 'portfolio':
        return {
          ...baseData,
          title: 'About Me',
          subtitle: 'My Creative Journey',
          storyTitle: 'My Background',
          storyText:
            "With a background in design and digital media, I've spent the last 8 years honing my craft. My approach combines technical expertise with creative problem-solving to deliver exceptional results for clients across various industries.",
          missionTitle: 'My Approach',
          missionText:
            'I believe in a collaborative process that puts client needs first. My work blends creativity with functionality, ensuring that each project not only looks great but also achieves its strategic objectives.',
          imageUrl: 'assets/standard-hero1/background-image3.jpg',
          values: ['Creativity', 'Precision', 'Communication', 'Results'],
          textColor: '#333333',
        };
      default:
        return {
          ...baseData,
          title: 'About Us',
          subtitle: 'Our Story',
          storyTitle: 'Our Story',
          storyText:
            'We are a dedicated team of professionals committed to delivering exceptional value to our clients. With years of experience in the industry, we understand what it takes to help your business succeed.',
          missionTitle: 'Our Mission',
          missionText:
            "Our mission is to provide high-quality services that exceed our clients' expectations. We believe in building long-lasting relationships based on trust, integrity, and results.",
          imageUrl: 'assets/standard-hero1/background-image1.jpg',
          values: ['Quality', 'Integrity', 'Innovation', 'Customer Focus'],
          textColor: '#333333',
        };
    }
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
   * Get default menu data for restaurant business types
   */
  getDefaultMenuData(): any {
    return {
      title: 'Our Menu',
      subtitle:
        'Enjoy our carefully crafted dishes made with the finest ingredients',
      backgroundColor: '#f9f9f9',
      textColor: '#333333',
      cardBackgroundColor: '#ffffff',
      categories: [
        {
          id: 'cat1',
          name: 'Appetizers',
          description: 'Perfect starters to begin your culinary journey.',
          items: [
            {
              id: 'item1',
              name: 'Bruschetta',
              description:
                'Toasted bread topped with ripe tomatoes, fresh basil, and extra virgin olive oil.',
              price: '$8.99',
              tags: ['vegetarian'],
            },
            {
              id: 'item2',
              name: 'Calamari Fritti',
              description:
                'Crispy fried calamari served with lemon and marinara sauce.',
              price: '$12.99',
            },
          ],
        },
        {
          id: 'cat2',
          name: 'Main Courses',
          description: 'Signature dishes crafted with finest ingredients.',
          items: [
            {
              id: 'item3',
              name: 'Grilled Salmon',
              description:
                'Fresh salmon fillet grilled to perfection, served with seasonal vegetables and lemon butter sauce.',
              price: '$24.99',
              featured: true,
            },
            {
              id: 'item4',
              name: 'Pasta Carbonara',
              description:
                'Classic Italian pasta with pancetta, egg, black pepper, and Parmesan cheese.',
              price: '$18.99',
            },
          ],
        },
      ],
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
    // Business-specific titles and subtitles
    const titles = {
      restaurant: 'Reserve a Table',
      salon: 'Book an Appointment',
      architecture: 'Start Your Project',
      portfolio: 'Get in Touch',
    };

    const subtitles = {
      restaurant: 'Make a reservation or get in touch with our team',
      salon: 'Book an appointment or reach out with questions',
      architecture: "Let's discuss your project requirements",
      portfolio: 'Get in touch for collaboration opportunities',
    };

    const formTitles = {
      restaurant: 'Make a Reservation',
      salon: 'Book an Appointment',
      architecture: 'Request a Consultation',
      portfolio: 'Send a Message',
    };

    const buttonTexts = {
      restaurant: 'Reserve Now',
      salon: 'Book Now',
      architecture: 'Request Consultation',
      portfolio: 'Send Message',
    };

    return {
      title: titles[businessType as keyof typeof titles] || 'Contact Us',
      subtitle:
        subtitles[businessType as keyof typeof subtitles] ||
        "We'd love to hear from you",
      address: this.getDefaultAddress(businessType),
      phone: this.getDefaultPhone(),
      email: this.getDefaultEmail(businessType),
      showMap: true,
      backgroundColor: '#f8f8f8',
      textColor: '#333333',
      formTitle:
        formTitles[businessType as keyof typeof formTitles] ||
        'Send us a Message',
      formButtonText:
        buttonTexts[businessType as keyof typeof buttonTexts] || 'Send Message',
      formSubject: `New message from your ${businessType} website`,
      // Important note: formspreeId must be set by the user for email to work
      formspreeId: 'your-formspree-id',
    };
  }

  /**
   * Create a complete customization structure with appropriate defaults for a business type
   */
  generateDefaultCustomizations(
    businessType: string,
    plan: 'standard' | 'premium'
  ): Customizations {
    const standardCustomizations: Customizations = {
      fontConfig: {
        fontId: 1,
        family: 'Roboto',
        fallback: 'sans-serif',
      },
      header: this.getDefaultHeaderData(businessType, 'standard'),
      pages: {
        home: {
          hero1: this.getDefaultHeroData(businessType),
          about: this.getDefaultAboutData(businessType),
          contact: this.getDefaultContactData(businessType),
          ...(businessType === 'restaurant'
            ? { menu: this.getDefaultMenuData() }
            : {}),
          ...(businessType === 'salon'
            ? { services: this.getDefaultServicesData(businessType) }
            : {}),
          ...(businessType === 'architecture' || businessType === 'portfolio'
            ? { projects: this.getDefaultProjectsData(businessType) }
            : {}),
        },
      },
      footer: this.getDefaultFooterData(businessType),
    };

    if (plan === 'premium') {
      // Safely access pages.home with proper null checking
      const standardHome = standardCustomizations.pages?.home || {};

      const premiumHome = {
        ...standardHome,
        aboutPreview: this.getPremiumAboutPreviewData(businessType),
        featuredPreview: this.getPremiumFeaturedPreviewData(businessType),
        ctaSection: this.getPremiumCtaSectionData(businessType),
      };

      const premiumPages = {
        ...(standardCustomizations.pages || {}),
        home: premiumHome,
        about: this.getPremiumAboutPageData(businessType),
        contact: this.getPremiumContactPageData(businessType),
        menu:
          businessType === 'restaurant'
            ? this.getPremiumMenuPageData(businessType)
            : undefined,
        services:
          businessType === 'salon'
            ? this.getPremiumServicesPageData(businessType)
            : undefined,
      };

      return {
        ...standardCustomizations,
        header: this.getDefaultHeaderData(businessType, 'premium'),
        pages: premiumPages,
      };
    }

    return standardCustomizations;
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

  /**
   * Get default tagline for a business type
   */
  private getDefaultTagline(businessType: string): string {
    switch (businessType) {
      case 'restaurant':
        return 'Exceptional cuisine and dining experience';
      case 'salon':
        return 'Where beauty meets expertise';
      case 'architecture':
        return 'Creating spaces that inspire';
      case 'portfolio':
        return 'Crafting visual stories';
      default:
        return 'Professional solutions tailored to your needs';
    }
  }

  /**
   * Get default address for a business type
   */
  private getDefaultAddress(businessType: string): string {
    switch (businessType) {
      case 'restaurant':
        return '123 Culinary Ave, Gourmet City';
      case 'salon':
        return '456 Style Street, Beauty Town';
      case 'architecture':
        return '789 Design Blvd, Creative City';
      case 'portfolio':
        return 'Based in Creative District, Design City';
      default:
        return '123 Business Ave, City';
    }
  }

  /**
   * Get default phone number
   */
  private getDefaultPhone(): string {
    return '(555) 123-4567';
  }

  /**
   * Get default email for a business type
   */
  private getDefaultEmail(businessType: string): string {
    switch (businessType) {
      case 'restaurant':
        return 'info@finedining.com';
      case 'salon':
        return 'hello@beautystudio.com';
      case 'architecture':
        return 'projects@designworks.com';
      case 'portfolio':
        return 'contact@creativeportfolio.com';
      default:
        return 'info@yourbusiness.com';
    }
  }

  /**
   * Get default social media URLs for a business type
   */
  private getDefaultSocialUrls(businessType: string): Record<string, string> {
    // Return default placeholder URLs for common social platforms
    // Users can update these with their actual social media profiles
    const baseUrls = {
      facebook: 'https://facebook.com/yourbusiness',
      instagram: 'https://instagram.com/yourbusiness',
      tiktok: 'https://tiktok.com/@yourbusiness',
      linkedin: 'https://linkedin.com/company/yourbusiness',
      youtube: 'https://youtube.com/@yourbusiness',
      twitter: 'https://twitter.com/yourbusiness',
    };

    // Customize based on business type
    switch (businessType) {
      case 'restaurant':
        return {
          facebook: 'https://facebook.com/yourrestaurant',
          instagram: 'https://instagram.com/yourrestaurant',
          tiktok: 'https://tiktok.com/@yourrestaurant',
          linkedin: '',
          youtube: '',
          twitter: '',
        };
      case 'salon':
        return {
          facebook: 'https://facebook.com/yoursalon',
          instagram: 'https://instagram.com/yoursalon',
          tiktok: 'https://tiktok.com/@yoursalon',
          linkedin: '',
          youtube: '',
          twitter: '',
        };
      case 'architecture':
        return {
          facebook: 'https://facebook.com/yourfirm',
          instagram: 'https://instagram.com/yourfirm',
          tiktok: '',
          linkedin: 'https://linkedin.com/company/yourfirm',
          youtube: '',
          twitter: '',
        };
      case 'portfolio':
        return {
          facebook: '',
          instagram: 'https://instagram.com/yourportfolio',
          tiktok: '',
          linkedin: 'https://linkedin.com/in/yourname',
          youtube: '',
          twitter: 'https://twitter.com/yourname',
        };
      default:
        return {
          facebook: 'https://facebook.com/yourbusiness',
          instagram: 'https://instagram.com/yourbusiness',
          tiktok: '',
          linkedin: '',
          youtube: '',
          twitter: '',
        };
    }
  }

  getBusinessTypeConfig(businessType: string): BusinessTypeConfig | null {
    return this.businessConfigs[businessType] || null;
  }

  getAllBusinessTypes(): Record<string, BusinessTypeConfig> {
    return { ...this.businessConfigs };
  }

  getBusinessTypeDisplayName(businessType: string): string {
    const config = this.getBusinessTypeConfig(businessType);
    return config?.displayName || businessType;
  }

  getBusinessTypeColor(businessType: string): string {
    const config = this.getBusinessTypeConfig(businessType);
    return config?.color || '#666666';
  }

  getBusinessTypeSections(businessType: string): string[] {
    const config = this.getBusinessTypeConfig(businessType);
    return config?.sections || ['hero1', 'about', 'services', 'contact'];
  }

  /**
   * Get CTA button configuration for a specific business type
   */
  getCtaButtonConfig(
    businessType: string
  ): { text: string; scrollTargetID: string; description: string } | null {
    const config = this.getBusinessTypeConfig(businessType);
    return config?.ctaButton || null;
  }

  /**
   * Generate default hero1 data with business-type-specific CTA button
   */
  getDefaultHero1Data(businessType: string): any {
    // Use smart CTA defaults
    const ctaDefaults = this.getSmartCTADefaults(businessType);

    return {
      backgroundImage: '',
      title: 'Grow Your Business With Us',
      subtitle: 'Professional solutions tailored to your business needs',
      overlayOpacity: 'medium',
      overlayColor: '#000000',
      showContentText: true,
      layout: 'center',
      titleColor: '#ffffff',
      subtitleColor: '#f0f0f0',
      textShadow: 'medium',
      // CTA Button defaults - smart defaults based on business type
      showButton: true,
      buttonText: ctaDefaults.buttonText,
      buttonScrollTargetID: ctaDefaults.buttonScrollTargetID,
      buttonBackgroundColor: '#2876ff',
      buttonTextColor: '#ffffff',
    };
  }

  // ========================================
  // PREMIUM DATA CONFIGURATION METHODS
  // ========================================

  /**
   * Get premium about preview section data for home page
   */
  private getPremiumAboutPreviewData(businessType: string): any {
    const businessSpecific = {
      restaurant: {
        title: 'Our Culinary Journey',
        subtitle:
          'Discover the passion and tradition behind every dish we create.',
      },
      salon: {
        title: 'Beauty & Expertise Combined',
        subtitle:
          'Experience our commitment to making you look and feel amazing.',
      },
      architecture: {
        title: 'Design Philosophy',
        subtitle:
          'Explore our approach to creating spaces that inspire and endure.',
      },
      portfolio: {
        title: 'Creative Vision',
        subtitle: 'Discover the story behind my work and creative process.',
      },
    };

    const config = businessSpecific[
      businessType as keyof typeof businessSpecific
    ] || {
      title: 'About Our Company',
      subtitle: 'Learn more about our values, mission, and what drives us.',
    };

    return {
      title: config.title,
      subtitle: config.subtitle,
      storyTitle: this.getStoryTitle(businessType),
      storyDescription: this.getStoryDescription(businessType),
      linkText: this.getLinkText(businessType),
      backgroundColor: '#f8f9fa',
      textColor: '#333333',
      accentColor: '#9e6aff',
      showStats: true,
      showFeatures: true,
      stats: this.getBusinessStats(businessType),
      features: this.getKeyFeatures(businessType),
    };
  }

  /**
   * Get premium featured preview section data for home page
   */
  private getPremiumFeaturedPreviewData(businessType: string): any {
    const businessSpecific = {
      restaurant: {
        title: 'Signature Dishes',
        subtitle:
          'Taste our most celebrated creations and seasonal specialties.',
      },
      salon: {
        title: 'Popular Services',
        subtitle:
          'Discover our most requested treatments and styling services.',
      },
      architecture: {
        title: 'Featured Projects',
        subtitle:
          'Explore our award-winning designs and architectural achievements.',
      },
      portfolio: {
        title: 'Latest Work',
        subtitle: 'Browse my most recent projects and creative collaborations.',
      },
    };

    const config = businessSpecific[
      businessType as keyof typeof businessSpecific
    ] || {
      title: 'Featured Highlights',
      subtitle: 'Explore our best offerings and most popular services.',
    };

    return {
      title: config.title,
      subtitle: config.subtitle,
      backgroundColor: '#ffffff',
      textColor: '#333333',
      accentColor: '#9e6aff',
    };
  }

  /**
   * Get premium CTA section data for home page
   */
  private getPremiumCtaSectionData(businessType: string): any {
    const businessSpecific = {
      restaurant: {
        title: 'Ready for an Unforgettable Dining Experience?',
        subtitle: 'Reserve your table today and taste the difference.',
        primaryButtonText: 'Make Reservation',
        secondaryButtonText: 'View Menu',
      },
      salon: {
        title: 'Ready to Transform Your Look?',
        subtitle: 'Book your appointment and let our experts take care of you.',
        primaryButtonText: 'Book Appointment',
        secondaryButtonText: 'View Services',
      },
      architecture: {
        title: 'Ready to Bring Your Vision to Life?',
        subtitle:
          "Let's discuss your project and create something extraordinary.",
        primaryButtonText: 'Start Project',
        secondaryButtonText: 'View Portfolio',
      },
      portfolio: {
        title: 'Ready to Collaborate?',
        subtitle:
          "Let's work together to bring your creative vision to reality.",
        primaryButtonText: 'Start Project',
        secondaryButtonText: 'View Work',
      },
    };

    const config = businessSpecific[
      businessType as keyof typeof businessSpecific
    ] || {
      title: 'Ready to Get Started?',
      subtitle: 'Join us today and experience the difference.',
      primaryButtonText: 'Get Started',
      secondaryButtonText: 'Learn More',
    };

    return {
      title: config.title,
      subtitle: config.subtitle,
      primaryButtonText: config.primaryButtonText,
      secondaryButtonText: config.secondaryButtonText,
      backgroundColor: '#9e6aff',
      textColor: '#ffffff',
      buttonStyle: 'premium',
    };
  }

  /**
   * Get premium about page data with comprehensive sections
   */
  private getPremiumAboutPageData(businessType: string): any {
    const businessSpecific = {
      restaurant: {
        hero: {
          title: 'Our Culinary Story',
          subtitle: 'Where tradition meets innovation in every dish',
          description:
            'From farm-to-table ingredients to time-honored techniques, discover the passion that drives our kitchen.',
        },
        story: {
          title: 'Our Journey',
          content:
            'Founded with a vision to create memorable dining experiences, our restaurant has been serving the community with exceptional cuisine and warm hospitality. Every dish tells a story of tradition, innovation, and our commitment to culinary excellence.',
          highlights: [
            'Farm-to-table philosophy',
            'Award-winning chef team',
            'Locally sourced ingredients',
            'Sustainable practices',
          ],
        },
        team: {
          title: 'Meet Our Team',
          subtitle: 'The passionate people behind your dining experience',
          members: [
            {
              id: 1,
              name: 'Chef Maria Rodriguez',
              role: 'Executive Chef',
              bio: 'With over 15 years of culinary experience, Chef Maria brings creativity and passion to every dish.',
              image: '/assets/team/chef-maria.jpg',
              specialties: ['Mediterranean Cuisine', 'Pastry Arts'],
            },
            {
              id: 2,
              name: 'James Thompson',
              role: 'Sous Chef',
              bio: 'James specializes in innovative flavor combinations and seasonal menu development.',
              image: '/assets/team/chef-james.jpg',
              specialties: ['Seasonal Menus', 'Sauce Mastery'],
            },
          ],
        },
        values: {
          title: 'Our Values',
          subtitle: 'The principles that guide our kitchen',
          items: [
            {
              icon: '🌱',
              title: 'Sustainability',
              description:
                'We source responsibly and minimize our environmental impact.',
            },
            {
              icon: '🥇',
              title: 'Quality',
              description: 'Only the finest ingredients make it to your plate.',
            },
            {
              icon: '❤️',
              title: 'Hospitality',
              description: 'Every guest is treated like family.',
            },
            {
              icon: '🎨',
              title: 'Creativity',
              description: 'We constantly innovate while respecting tradition.',
            },
          ],
        },
      },
      salon: {
        hero: {
          title: 'Beauty & Wellness Excellence',
          subtitle: 'Where expertise meets personalized care',
          description:
            'Discover a sanctuary dedicated to enhancing your natural beauty with professional treatments and personalized service.',
        },
        story: {
          title: 'Our Story',
          content:
            'Our salon was born from a passion for helping people look and feel their absolute best. With years of experience and continuous education, we stay at the forefront of beauty trends and techniques to provide you with exceptional service.',
          highlights: [
            'Certified professionals',
            'Premium product lines',
            'Personalized consultations',
            'Relaxing atmosphere',
          ],
        },
        team: {
          title: 'Our Expert Team',
          subtitle: 'Skilled professionals dedicated to your beauty',
          members: [
            {
              id: 1,
              name: 'Sarah Johnson',
              role: 'Master Stylist',
              bio: 'Sarah has over 10 years of experience in hair styling and color techniques.',
              image: '/assets/team/sarah-johnson.jpg',
              specialties: ['Color Correction', 'Balayage', 'Bridal Styling'],
            },
            {
              id: 2,
              name: 'Lisa Chen',
              role: 'Esthetician',
              bio: 'Lisa specializes in advanced skincare treatments and facial therapies.',
              image: '/assets/team/lisa-chen.jpg',
              specialties: [
                'Anti-Aging Treatments',
                'Acne Solutions',
                'Chemical Peels',
              ],
            },
          ],
        },
        values: {
          title: 'Our Commitment',
          subtitle: 'What drives our passion for beauty',
          items: [
            {
              icon: '✨',
              title: 'Excellence',
              description:
                'We strive for perfection in every service we provide.',
            },
            {
              icon: '🤝',
              title: 'Trust',
              description:
                'Building lasting relationships through honest consultation.',
            },
            {
              icon: '🌿',
              title: 'Wellness',
              description: 'Promoting health and well-being inside and out.',
            },
            {
              icon: '💎',
              title: 'Luxury',
              description: 'Creating an indulgent experience for every client.',
            },
          ],
        },
      },
      architecture: {
        hero: {
          title: 'Architectural Innovation',
          subtitle: 'Designing spaces that inspire and endure',
          description:
            'From concept to completion, we create architectural solutions that blend functionality with aesthetic excellence.',
        },
        story: {
          title: 'Our Design Philosophy',
          content:
            'We believe that great architecture has the power to transform lives and communities. Our approach combines innovative design with sustainable practices, creating spaces that are both beautiful and environmentally responsible.',
          highlights: [
            'Sustainable design practices',
            'Award-winning projects',
            'Collaborative approach',
            'Innovative solutions',
          ],
        },
        team: {
          title: 'Design Team',
          subtitle: 'Architects and designers shaping the future',
          members: [
            {
              id: 1,
              name: 'Michael Anderson',
              role: 'Principal Architect',
              bio: 'Michael leads our design team with over 20 years of architectural experience.',
              image: '/assets/team/michael-anderson.jpg',
              specialties: [
                'Sustainable Design',
                'Commercial Projects',
                'Urban Planning',
              ],
            },
            {
              id: 2,
              name: 'Elena Vasquez',
              role: 'Senior Designer',
              bio: 'Elena specializes in residential design and interior space planning.',
              image: '/assets/team/elena-vasquez.jpg',
              specialties: [
                'Residential Design',
                'Interior Architecture',
                'Space Planning',
              ],
            },
          ],
        },
        values: {
          title: 'Design Principles',
          subtitle: 'The foundation of our architectural practice',
          items: [
            {
              icon: '🏗️',
              title: 'Innovation',
              description:
                'Pushing boundaries with cutting-edge design solutions.',
            },
            {
              icon: '🌍',
              title: 'Sustainability',
              description: 'Creating environmentally responsible architecture.',
            },
            {
              icon: '🎯',
              title: 'Functionality',
              description:
                'Designing spaces that work beautifully for their users.',
            },
            {
              icon: '🏆',
              title: 'Excellence',
              description: 'Delivering exceptional quality in every project.',
            },
          ],
        },
      },
      portfolio: {
        hero: {
          title: 'Creative Portfolio',
          subtitle: 'Bringing ideas to life through design',
          description:
            'Explore my journey as a creative professional and the diverse projects that showcase my passion for design.',
        },
        story: {
          title: 'My Creative Journey',
          content:
            "As a creative professional, I've had the privilege of working on diverse projects that challenge and inspire me. My approach combines strategic thinking with creative execution to deliver impactful results for my clients.",
          highlights: [
            'Multi-disciplinary expertise',
            'Client-focused approach',
            'Award-winning work',
            'Continuous learning',
          ],
        },
        team: {
          title: 'Collaboration Network',
          subtitle: 'Working with talented professionals',
          members: [
            {
              id: 1,
              name: 'Alex Morgan',
              role: 'Creative Director',
              bio: 'Leading creative vision and strategic direction for client projects.',
              image: '/assets/team/alex-morgan.jpg',
              specialties: [
                'Brand Strategy',
                'Visual Identity',
                'Creative Direction',
              ],
            },
          ],
        },
        values: {
          title: 'Creative Values',
          subtitle: 'What drives my creative process',
          items: [
            {
              icon: '💡',
              title: 'Innovation',
              description:
                'Constantly exploring new ideas and creative solutions.',
            },
            {
              icon: '🎨',
              title: 'Artistry',
              description: 'Bringing aesthetic excellence to every project.',
            },
            {
              icon: '🤝',
              title: 'Collaboration',
              description:
                'Working closely with clients to achieve their vision.',
            },
            {
              icon: '📈',
              title: 'Results',
              description:
                'Delivering measurable impact through creative work.',
            },
          ],
        },
      },
    };

    const config =
      businessSpecific[businessType as keyof typeof businessSpecific] ||
      businessSpecific.portfolio;

    return {
      hero: {
        title: config.hero.title,
        subtitle: config.hero.subtitle,
        description: config.hero.description,
        backgroundColor: '#f8f9fa',
        textColor: '#333333',
        heroImage: '/assets/about/hero-image.jpg',
      },
      story: {
        title: config.story.title,
        content: config.story.content,
        highlights: config.story.highlights,
        storyImage: '/assets/about/story-image.jpg',
        backgroundColor: '#ffffff',
        textColor: '#333333',
      },
      team: {
        title: config.team.title,
        subtitle: config.team.subtitle,
        members: config.team.members,
        backgroundColor: '#f8f9fa',
        textColor: '#333333',
      },
      values: {
        title: config.values.title,
        subtitle: config.values.subtitle,
        items: config.values.items,
        backgroundColor: '#ffffff',
        textColor: '#333333',
      },
      testimonials: {
        title: 'What Our Clients Say',
        subtitle: 'Real feedback from real customers',
        testimonials: this.getDefaultTestimonials(businessType),
        backgroundColor: '#f8f9fa',
        textColor: '#333333',
      },
      cta: {
        title: 'Ready to Work With Us?',
        subtitle: "Let's start your journey to success together",
        primaryButtonText: 'Get Started',
        secondaryButtonText: 'Contact Us',
        backgroundColor: '#9e6aff',
        textColor: '#ffffff',
      },
    };
  }

  /**
   * Get premium contact page data
   */
  private getPremiumContactPageData(businessType: string): any {
    const businessSpecific = {
      restaurant: {
        hero: {
          title: 'Visit Us Today',
          subtitle: 'Experience exceptional dining in a welcoming atmosphere',
        },
        form: {
          title: 'Make a Reservation',
          subtitle: 'Book your table for an unforgettable dining experience',
          buttonText: 'Reserve Table',
        },
        location: {
          title: 'Find Us',
          subtitle: 'Located in the heart of the city',
        },
        hours: {
          title: 'Hours of Operation',
          schedule: {
            'Monday - Thursday': '5:00 PM - 10:00 PM',
            'Friday - Saturday': '5:00 PM - 11:00 PM',
            Sunday: '4:00 PM - 9:00 PM',
          },
        },
      },
      salon: {
        hero: {
          title: 'Book Your Appointment',
          subtitle: 'Transform your look with our expert stylists',
        },
        form: {
          title: 'Schedule Your Visit',
          subtitle: 'Book an appointment or consultation today',
          buttonText: 'Book Appointment',
        },
        location: {
          title: 'Visit Our Salon',
          subtitle: 'Conveniently located for your beauty needs',
        },
        hours: {
          title: 'Salon Hours',
          schedule: {
            'Tuesday - Friday': '9:00 AM - 7:00 PM',
            Saturday: '8:00 AM - 6:00 PM',
            Sunday: '10:00 AM - 4:00 PM',
            Monday: 'Closed',
          },
        },
      },
      architecture: {
        hero: {
          title: 'Start Your Project',
          subtitle: "Let's bring your architectural vision to life",
        },
        form: {
          title: 'Project Consultation',
          subtitle: 'Tell us about your project and vision',
          buttonText: 'Request Consultation',
        },
        location: {
          title: 'Our Studio',
          subtitle: 'Visit our design studio for consultations',
        },
        hours: {
          title: 'Studio Hours',
          schedule: {
            'Monday - Friday': '9:00 AM - 6:00 PM',
            Saturday: '10:00 AM - 2:00 PM',
            Sunday: 'By Appointment',
          },
        },
      },
      portfolio: {
        hero: {
          title: "Let's Collaborate",
          subtitle: 'Ready to bring your creative vision to life?',
        },
        form: {
          title: 'Project Inquiry',
          subtitle: 'Tell me about your project and goals',
          buttonText: 'Send Message',
        },
        location: {
          title: 'Based In',
          subtitle: 'Available for projects worldwide',
        },
        hours: {
          title: 'Availability',
          schedule: {
            'Monday - Friday': '9:00 AM - 6:00 PM',
            Weekends: 'By Appointment',
          },
        },
      },
    };

    const config =
      businessSpecific[businessType as keyof typeof businessSpecific] ||
      businessSpecific.portfolio;

    return {
      hero: {
        title: config.hero.title,
        subtitle: config.hero.subtitle,
        backgroundColor: '#f8f9fa',
        textColor: '#333333',
        heroImage: '/assets/contact/hero-image.jpg',
      },
      contactForm: {
        title: config.form.title,
        subtitle: config.form.subtitle,
        buttonText: config.form.buttonText,
        backgroundColor: '#ffffff',
        textColor: '#333333',
        fields: [
          { name: 'name', label: 'Full Name', type: 'text', required: true },
          {
            name: 'email',
            label: 'Email Address',
            type: 'email',
            required: true,
          },
          {
            name: 'phone',
            label: 'Phone Number',
            type: 'tel',
            required: false,
          },
          { name: 'subject', label: 'Subject', type: 'text', required: true },
          {
            name: 'message',
            label: 'Message',
            type: 'textarea',
            required: true,
          },
        ],
      },
      location: {
        title: config.location.title,
        subtitle: config.location.subtitle,
        address: this.getDefaultAddress(businessType),
        phone: this.getDefaultPhone(),
        email: this.getDefaultEmail(businessType),
        showMap: true,
        mapLocation: this.getDefaultAddress(businessType),
        backgroundColor: '#f8f9fa',
        textColor: '#333333',
      },
      hours: {
        title: config.hours.title,
        schedule: config.hours.schedule,
        backgroundColor: '#ffffff',
        textColor: '#333333',
      },
    };
  }

  /**
   * Get premium menu page data for restaurants
   */
  private getPremiumMenuPageData(businessType: string): any {
    return {
      hero: {
        title: 'Our Menu',
        subtitle: 'Crafted with passion, served with pride',
        description:
          'Discover our carefully curated selection of dishes made with the finest ingredients.',
        backgroundColor: '#f8f9fa',
        textColor: '#333333',
        heroImage: '/assets/menu/hero-image.jpg',
      },
      menuCategories: {
        title: 'Menu Categories',
        subtitle: 'Explore our culinary offerings',
        categories: [
          {
            id: 'appetizers',
            name: 'Appetizers',
            description: 'Start your meal with our delicious starters',
            image: '/assets/menu/appetizers.jpg',
            items: [
              {
                id: 'bruschetta',
                name: 'Artisan Bruschetta',
                description:
                  'Toasted sourdough with heirloom tomatoes, fresh basil, and aged balsamic',
                price: '$12',
                dietary: ['vegetarian'],
                featured: true,
              },
              {
                id: 'calamari',
                name: 'Crispy Calamari',
                description:
                  'Fresh squid rings with spicy marinara and lemon aioli',
                price: '$14',
                dietary: [],
                featured: false,
              },
            ],
          },
          {
            id: 'mains',
            name: 'Main Courses',
            description: 'Our signature dishes and chef specialties',
            image: '/assets/menu/mains.jpg',
            items: [
              {
                id: 'salmon',
                name: 'Pan-Seared Salmon',
                description:
                  'Atlantic salmon with roasted vegetables and herb butter',
                price: '$28',
                dietary: ['gluten-free'],
                featured: true,
              },
              {
                id: 'ribeye',
                name: 'Prime Ribeye',
                description:
                  '12oz dry-aged ribeye with truffle mashed potatoes',
                price: '$42',
                dietary: [],
                featured: true,
              },
            ],
          },
        ],
        backgroundColor: '#ffffff',
        textColor: '#333333',
      },
      specialOffers: {
        title: 'Special Offers',
        subtitle: 'Limited time seasonal specials',
        offers: [
          {
            id: 'happy-hour',
            title: 'Happy Hour',
            description: 'Half price appetizers and cocktails',
            time: 'Monday - Friday, 3-6 PM',
            image: '/assets/menu/happy-hour.jpg',
          },
          {
            id: 'wine-wednesday',
            title: 'Wine Wednesday',
            description: '50% off all wine bottles',
            time: 'Every Wednesday',
            image: '/assets/menu/wine-wednesday.jpg',
          },
        ],
        backgroundColor: '#f8f9fa',
        textColor: '#333333',
      },
      dietaryInfo: {
        title: 'Dietary Information',
        subtitle: 'We cater to all dietary preferences',
        options: [
          {
            icon: '🌱',
            label: 'Vegetarian',
            description: 'Plant-based options available',
          },
          {
            icon: '🌾',
            label: 'Gluten-Free',
            description: 'Certified gluten-free dishes',
          },
          {
            icon: '🥛',
            label: 'Dairy-Free',
            description: 'Lactose-free alternatives',
          },
          {
            icon: '🥗',
            label: 'Vegan',
            description: 'Completely plant-based meals',
          },
        ],
        backgroundColor: '#ffffff',
        textColor: '#333333',
      },
    };
  }

  /**
   * Get premium services page data for salons
   */
  private getPremiumServicesPageData(businessType: string): any {
    return {
      hero: {
        title: 'Our Services',
        subtitle: 'Professional beauty treatments tailored for you',
        description:
          'Discover our comprehensive range of beauty and wellness services.',
        backgroundColor: '#f8f9fa',
        textColor: '#333333',
        heroImage: '/assets/services/hero-image.jpg',
      },
      serviceCategories: {
        title: 'Service Categories',
        subtitle: 'Expert treatments for every beauty need',
        categories: [
          {
            id: 'hair',
            name: 'Hair Services',
            description: 'Cut, color, and styling by expert stylists',
            image: '/assets/services/hair.jpg',
            services: [
              {
                id: 'haircut',
                name: 'Precision Cut & Style',
                description: 'Professional haircut with personalized styling',
                price: 'From $65',
                duration: '60 minutes',
                featured: true,
              },
              {
                id: 'color',
                name: 'Color & Highlights',
                description:
                  'Full color service with professional consultation',
                price: 'From $120',
                duration: '2-3 hours',
                featured: true,
              },
            ],
          },
          {
            id: 'skincare',
            name: 'Skincare Treatments',
            description: 'Advanced facial treatments and skincare',
            image: '/assets/services/skincare.jpg',
            services: [
              {
                id: 'facial',
                name: 'Signature Facial',
                description: 'Customized facial treatment for your skin type',
                price: 'From $85',
                duration: '75 minutes',
                featured: true,
              },
              {
                id: 'chemical-peel',
                name: 'Chemical Peel',
                description: 'Professional exfoliation for renewed skin',
                price: 'From $150',
                duration: '45 minutes',
                featured: false,
              },
            ],
          },
        ],
        backgroundColor: '#ffffff',
        textColor: '#333333',
      },
      packages: {
        title: 'Service Packages',
        subtitle: 'Save with our curated service combinations',
        packages: [
          {
            id: 'bridal',
            name: 'Bridal Package',
            description: 'Complete bridal beauty preparation',
            services: [
              'Trial styling',
              'Wedding day hair & makeup',
              'Touch-up kit',
            ],
            price: '$350',
            savings: 'Save $50',
            image: '/assets/services/bridal.jpg',
          },
          {
            id: 'spa-day',
            name: 'Spa Day Experience',
            description: 'Full day of relaxation and beauty',
            services: [
              'Facial treatment',
              'Hair styling',
              'Manicure & pedicure',
            ],
            price: '$275',
            savings: 'Save $40',
            image: '/assets/services/spa-day.jpg',
          },
        ],
        backgroundColor: '#f8f9fa',
        textColor: '#333333',
      },
      booking: {
        title: 'Book Your Appointment',
        subtitle: 'Schedule your beauty transformation today',
        bookingOptions: [
          {
            method: 'online',
            label: 'Book Online',
            description: '24/7 online booking',
          },
          {
            method: 'phone',
            label: 'Call Us',
            description: 'Speak with our team',
          },
          {
            method: 'walk-in',
            label: 'Walk-In',
            description: 'Subject to availability',
          },
        ],
        backgroundColor: '#ffffff',
        textColor: '#333333',
      },
    };
  }

  /**
   * Get story title based on business type for about preview
   */
  private getStoryTitle(businessType: string): string {
    const titles: Record<string, string> = {
      restaurant: 'Culinary Excellence',
      cafe: 'Coffee Artistry',
      bar: 'Mixology Mastery',
      salon: 'Beauty Innovation',
      spa: 'Wellness Philosophy',
      fitness: 'Health Commitment',
      architecture: 'Design Vision',
      portfolio: 'Creative Process',
      consulting: 'Strategic Approach',
      default: 'Our Mission',
    };
    return titles[businessType] || titles['default'];
  }

  /**
   * Get story description based on business type for about preview
   */
  private getStoryDescription(businessType: string): string {
    const descriptions: Record<string, string> = {
      restaurant:
        'We believe great food brings people together. Every dish is crafted with passion, using the finest ingredients to create memorable dining experiences.',
      cafe: 'From bean to cup, we ensure every coffee experience is exceptional. Our commitment to quality and community creates the perfect atmosphere.',
      bar: 'Our skilled bartenders create unique cocktails that tell a story. We combine traditional techniques with innovative flavors.',
      salon:
        'We transform not just how you look, but how you feel. Our expert team stays ahead of trends to bring you the latest in beauty.',
      spa: 'Your well-being is our priority. We create a sanctuary where you can escape, relax, and rejuvenate your mind and body.',
      fitness:
        'We believe fitness is a journey, not a destination. Our expert trainers and state-of-the-art equipment help you achieve your goals.',
      architecture:
        'We design spaces that inspire and endure. Our innovative approach combines functionality with aesthetic excellence.',
      portfolio:
        'Every project is an opportunity to push creative boundaries. We bring ideas to life through thoughtful design and execution.',
      consulting:
        'We partner with businesses to unlock their potential. Our strategic insights drive growth and sustainable success.',
      default:
        'We are committed to excellence in everything we do, delivering exceptional value and service to our clients.',
    };
    return descriptions[businessType] || descriptions['default'];
  }

  /**
   * Get link text based on business type for about preview
   */
  private getLinkText(businessType: string): string {
    const linkTexts: Record<string, string> = {
      restaurant: 'Discover Our Story',
      cafe: 'Learn About Our Coffee',
      bar: 'Meet Our Mixologists',
      salon: 'Meet Our Team',
      spa: 'Explore Our Services',
      fitness: 'Join Our Community',
      architecture: 'View Our Portfolio',
      portfolio: 'View My Work',
      consulting: 'Learn Our Approach',
      default: 'Learn More About Us',
    };
    return linkTexts[businessType] || linkTexts['default'];
  }

  /**
   * Get business statistics based on business type for about preview
   */
  private getBusinessStats(
    businessType: string
  ): Array<{ number: string; label: string }> {
    const stats: Record<string, Array<{ number: string; label: string }>> = {
      restaurant: [
        { number: '500+', label: 'Happy Customers' },
        { number: '5★', label: 'Average Rating' },
        { number: '10+', label: 'Years Experience' },
      ],
      cafe: [
        { number: '1000+', label: 'Cups Served Daily' },
        { number: '15+', label: 'Coffee Varieties' },
        { number: '5★', label: 'Customer Rating' },
      ],
      salon: [
        { number: '200+', label: 'Satisfied Clients' },
        { number: '8+', label: 'Expert Stylists' },
        { number: '15+', label: 'Years Experience' },
      ],
      architecture: [
        { number: '100+', label: 'Projects Completed' },
        { number: '20+', label: 'Awards Won' },
        { number: '15+', label: 'Years Experience' },
      ],
      portfolio: [
        { number: '50+', label: 'Projects Completed' },
        { number: '25+', label: 'Happy Clients' },
        { number: '8+', label: 'Years Experience' },
      ],
      default: [
        { number: '100+', label: 'Happy Clients' },
        { number: '5★', label: 'Rating' },
        { number: '10+', label: 'Years Experience' },
      ],
    };
    return stats[businessType] || stats['default'];
  }

  /**
   * Get key features based on business type for about preview
   */
  private getKeyFeatures(
    businessType: string
  ): Array<{ icon: string; title: string; description: string }> {
    const features: Record<
      string,
      Array<{ icon: string; title: string; description: string }>
    > = {
      restaurant: [
        {
          icon: 'fas fa-award',
          title: 'Award-Winning',
          description: 'Recognized for culinary excellence',
        },
        {
          icon: 'fas fa-leaf',
          title: 'Fresh Ingredients',
          description: 'Locally sourced, premium quality',
        },
        {
          icon: 'fas fa-users',
          title: 'Expert Chefs',
          description: 'Passionate culinary professionals',
        },
      ],
      cafe: [
        {
          icon: 'fas fa-coffee',
          title: 'Premium Coffee',
          description: 'Ethically sourced, expertly roasted',
        },
        {
          icon: 'fas fa-heart',
          title: 'Community Focus',
          description: 'Building connections over coffee',
        },
        {
          icon: 'fas fa-clock',
          title: 'Fresh Daily',
          description: 'Baked goods made fresh every day',
        },
      ],
      salon: [
        {
          icon: 'fas fa-star',
          title: 'Expert Stylists',
          description: 'Trained in latest techniques',
        },
        {
          icon: 'fas fa-palette',
          title: 'Color Specialists',
          description: 'Custom color solutions',
        },
        {
          icon: 'fas fa-gem',
          title: 'Premium Products',
          description: 'High-quality professional brands',
        },
      ],
      architecture: [
        {
          icon: 'fas fa-drafting-compass',
          title: 'Innovation',
          description: 'Pushing boundaries with cutting-edge design',
        },
        {
          icon: 'fas fa-leaf',
          title: 'Sustainability',
          description: 'Creating environmentally responsible architecture',
        },
        {
          icon: 'fas fa-star',
          title: 'Excellence',
          description: 'Delivering exceptional quality in every project',
        },
      ],
      portfolio: [
        {
          icon: 'fas fa-lightbulb',
          title: 'Innovation',
          description: 'Constantly exploring new creative solutions',
        },
        {
          icon: 'fas fa-palette',
          title: 'Artistry',
          description: 'Bringing aesthetic excellence to every project',
        },
        {
          icon: 'fas fa-handshake',
          title: 'Collaboration',
          description: 'Working closely with clients to achieve their vision',
        },
      ],
      default: [
        {
          icon: 'fas fa-star',
          title: 'Excellence',
          description: 'Committed to the highest standards',
        },
        {
          icon: 'fas fa-users',
          title: 'Expert Team',
          description: 'Experienced professionals',
        },
        {
          icon: 'fas fa-heart',
          title: 'Customer Focus',
          description: 'Your satisfaction is our priority',
        },
      ],
    };
    return features[businessType] || features['default'];
  }

  /**
   * Get default testimonials for different business types
   */
  private getDefaultTestimonials(businessType: string): any[] {
    const testimonialsByType = {
      restaurant: [
        {
          id: 1,
          name: 'Sarah Johnson',
          rating: 5,
          text: 'Absolutely incredible dining experience! Every dish was perfectly prepared and the service was outstanding.',
          image: '/assets/testimonials/sarah-j.jpg',
          location: 'Local Food Lover',
        },
        {
          id: 2,
          name: 'Michael Chen',
          rating: 5,
          text: 'The best restaurant in the city! The atmosphere is perfect for special occasions and the food is exceptional.',
          image: '/assets/testimonials/michael-c.jpg',
          location: 'Regular Customer',
        },
      ],
      salon: [
        {
          id: 1,
          name: 'Emma Rodriguez',
          rating: 5,
          text: "I've never felt more beautiful! The stylists here really understand what works for each client.",
          image: '/assets/testimonials/emma-r.jpg',
          location: 'Loyal Client',
        },
        {
          id: 2,
          name: 'Jessica Taylor',
          rating: 5,
          text: "Professional, friendly, and incredibly talented. I won't go anywhere else for my beauty needs.",
          image: '/assets/testimonials/jessica-t.jpg',
          location: 'Happy Customer',
        },
      ],
      architecture: [
        {
          id: 1,
          name: 'David Wilson',
          rating: 5,
          text: 'They transformed our vision into reality. The design process was collaborative and the result exceeded our expectations.',
          image: '/assets/testimonials/david-w.jpg',
          location: 'Homeowner',
        },
        {
          id: 2,
          name: 'Lisa Martinez',
          rating: 5,
          text: 'Professional, creative, and detail-oriented. Our new office space is both functional and inspiring.',
          image: '/assets/testimonials/lisa-m.jpg',
          location: 'Business Owner',
        },
      ],
      portfolio: [
        {
          id: 1,
          name: 'Alex Thompson',
          rating: 5,
          text: 'Working with this creative professional was a game-changer for our brand. Highly recommended!',
          image: '/assets/testimonials/alex-t.jpg',
          location: 'Client',
        },
        {
          id: 2,
          name: 'Maria Garcia',
          rating: 5,
          text: 'Exceptional creativity and professionalism. The final result was exactly what we envisioned.',
          image: '/assets/testimonials/maria-g.jpg',
          location: 'Satisfied Client',
        },
      ],
    };

    return (
      testimonialsByType[businessType as keyof typeof testimonialsByType] ||
      testimonialsByType.portfolio
    );
  }
}
