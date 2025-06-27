/**
 * Core data models for website customization
 * Contains interfaces for all customizable elements in the website builder
 */

/**
 * Header customization data
 */
// Header, footer, fontConfig are common for all business types or packages!
export interface HeaderData {
  // Standard fields
  backgroundColor?: string;
  textColor?: string;
  logoUrl?: string;
  menuItems?: Array<{ id: number; label: string; link: string }>;
  // Premium fields
  headerBackgroundType?:
    | 'solid'
    | 'none' // deprecated, kept for backward compatibility
    | 'sunset'
    | 'ocean'
    | 'forest'
    | 'royal'
    | 'fire'
    | 'midnight'
    | 'custom';
  customGradientColor1?: string;
  customGradientColor2?: string;
  customGradientAngle?: number;
  sticky?: boolean; // Premium: sticky header
  transparent?: boolean; // Premium: transparent header
  shadow?: boolean; // Premium: header shadow
  // Social icons (future-proof, premium)
  socialIcons?: Array<{ platform: string; link: string }>;
  // For future extensibility
  [key: string]: any;
}

/**
 * Footer customization data
 */
export interface FooterData {
  // Standard fields
  backgroundColor?: string;
  textColor?: string;
  copyrightText?: string;
  logoUrl?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  // Social links (standard and premium)
  showSocialLinks?: boolean;
  socialUrls?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    linkedin?: string;
    youtube?: string;
    twitter?: string;
    [key: string]: string | undefined;
  };
  socialLinks?: Array<{ platform: string; url: string }>;
  // Legal links (premium)
  showLegalLinks?: boolean;
  privacyPolicyUrl?: string;
  termsUrl?: string;
  // Layout options (premium)
  footerLayout?: 'standard' | 'compact' | 'minimal';
  // Menu items (for navigation in footer)
  menuItems?: Array<{ id: number; label: string; link: string }>;
  // Custom widgets/sections (future)
  customSections?: Array<{ type: string; content: any }>;
  // For future extensibility
  [key: string]: any;
}

/**
 * Font configuration
 */
export interface FontConfig {
  fontId: number;
  family: string;
  fallback: string;
}

/**
 * Main customization interface with all website customizable elements
 */
// ------------------------------------------------------------
export interface Customizations {
  fontConfig?: FontConfig;
  header?: HeaderData;
  pages?: {
    home?: {
      hero1?: HeroData;
      about?: AboutData;
      services?: ServicesData;
      projects?: ProjectsData;
      menu?: MenuData;
      contact?: ContactData;
      [key: string]: any;
    };
    [key: string]: any;
  };
  footer?: FooterData;
}

/**
 * Hero section data model
 */
export interface HeroData {
  backgroundType?: 'image' | 'video';
  backgroundImage: string;
  backgroundVideo?: string;
  title: string;
  subtitle: string;
  overlayOpacity?: 'none' | 'light' | 'medium' | 'heavy';
  overlayColor?: string;
  showContentText?: boolean;
  layout?: 'center' | 'left' | 'right';
  titleColor?: string;
  subtitleColor?: string;
  textShadow?: 'none' | 'light' | 'medium' | 'heavy';
  // CTA Button fields
  showButton?: boolean;
  buttonText?: string; // Premium only - auto-generated for standard
  buttonLink?: string; // Premium only - auto-generated for standard
  buttonScrollTargetID?: string; // Auto-generated based on business type
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
}

/**
 * About section data model
 */
export interface AboutData {
  title?: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  storyTitle?: string;
  storyText?: string;
  missionTitle?: string;
  missionText?: string;
  values?: string[];
  valuesTitle?: string;
}

/**
 * Services section data model
 */
export interface ServicesData {
  title?: string;
  subtitle?: string;
  services?: Array<{
    id: number;
    title: string;
    description: string;
    icon?: string;
    price?: string;
  }>;
  backgroundColor?: string;
  textColor?: string;
}

/**
 * Menu section data model (for restaurant)
 */
export interface MenuData {
  title?: string;
  subtitle?: string;
  categories?: Array<{
    id: string;
    name: string;
    items: Array<{
      id: string;
      name: string;
      description: string;
      price: string;
      featured?: boolean;
    }>;
  }>;
  backgroundColor?: string;
  textColor?: string;
}

/**
 * Projects section data model (for portfolio/architecture)
 */
export interface ProjectsData {
  title?: string;
  subtitle?: string;
  projects?: Array<{
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    link?: string;
  }>;
  backgroundColor?: string;
  textColor?: string;
}

/**
 * Contact section data model
 */
export interface ContactData {
  title?: string;
  subtitle?: string;
  address?: string;
  phone?: string;
  email?: string;
  showMap?: boolean;
  mapLocation?: string;
  backgroundColor?: string;
  textColor?: string;
  // Form-related properties
  formTitle?: string;
  formButtonText?: string;
  formspreeId?: string;
  formSubject?: string;
  thankYouUrl?: string;
  // Premium features
  hours?: string;
  showSocialLinks?: boolean;
  socialUrls?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Premium customization interface with business-type specific pages
 */
// ------------------------------------------------------------
export interface PremiumCustomizations {
  fontConfig?: FontConfig;
  header?: HeaderData;
  pages?: {
    // Home page - common for all business types
    home?: {
      hero1?: HeroData;
      // Preview of main business content
      featuredPreview?: FeaturedPreviewData;
      aboutPreview?: AboutPreviewData;
      contactPreview?: ContactPreviewData;
      [key: string]: any;
    };

    // Business-specific main content pages
    // For restaurants
    menu?: {
      hero1?: HeroMenuData;
      menuCategories?: MenuCategoriesData;
      specialOffers?: SpecialOffersData;
      dietaryInfo?: DietaryInfoData;
      [key: string]: any;
    };

    // For salons
    // services?: {
    //   hero1?: HeroServicesData;
    //   serviceCategories?: ServiceCategoriesData;
    //   pricingPackages?: PricingPackagesData;
    //   staffSpecialties?: StaffSpecialtiesData;
    //   [key: string]: any;
    // };

    // For creative/portfolio
    // portfolio?: {
    //   hero1?: HeroPortfolioData;
    //   projectCategories?: ProjectCategoriesData;
    //   caseStudies?: CaseStudiesData;
    //   testimonials?: TestimonialsData;
    //   [key: string]: any;
    // };

    // For architecture
    // projects?: {
    //   hero1?: HeroProjectsData;
    //   projectCategories?: ArchProjectCategoriesData;
    //   caseStudies?: ArchCaseStudiesData;
    //   awards?: AwardsData;
    //   [key: string]: any;
    // };

    // Common pages for all business types
    // about?: {
    //   hero1?: HeroAboutData;
    //   story?: StoryData;
    //   team?: TeamData;
    //   values?: ValuesData;
    //   certifications?: CertificationsData;
    //   [key: string]: any;
    // };

    // contact?: {
    //   hero1?: HeroContactData;
    //   contactForm?: ContactFormData;
    //   location?: LocationData;
    //   hours?: HoursData;
    // For appointment-based businesses
    //   booking?: BookingData;
    //   [key: string]: any;
    // };

    [key: string]: any;
  };
  footer?: FooterData;
}

// Premium Home page data model
// ------------------------------------------------------------

export interface FeaturedPreviewData {
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface AboutPreviewData {
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface ContactPreviewData {
  title: string;
  subtitle: string;
  imageUrl: string;
}

// Premium Menu page data model
// ------------------------------------------------------------
export interface HeroMenuData {
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface MenuCategoriesData {
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface SpecialOffersData {
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface DietaryInfoData {
  title: string;
  subtitle: string;
  imageUrl: string;
}

/**
 * Theme data model for loading and saving themes
 */
export interface ThemeData {
  id: number;
  name: string;
  cssContent: string;
  businessType: string;
  customizations: Customizations;
}
