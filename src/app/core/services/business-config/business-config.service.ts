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
    const defaultUrls = {
      facebook: 'https://facebook.com/',
      instagram: 'https://instagram.com/',
      tiktok: 'https://tiktok.com/',
    };

    // Customize URLs based on business type
    switch (businessType) {
      case 'restaurant':
        return {
          ...defaultUrls,
          facebook: 'https://facebook.com/finedining',
          instagram: 'https://instagram.com/finedining',
        };
      case 'salon':
        return {
          ...defaultUrls,
          facebook: 'https://facebook.com/beautystudio',
          instagram: 'https://instagram.com/beautystudio',
        };
      case 'architecture':
        return {
          ...defaultUrls,
          facebook: 'https://facebook.com/designworks',
          instagram: 'https://instagram.com/designworks',
        };
      case 'portfolio':
        return {
          ...defaultUrls,
          facebook: 'https://facebook.com/creativeportfolio',
          instagram: 'https://instagram.com/creativeportfolio',
        };
      default:
        return defaultUrls;
    }
  }
}
