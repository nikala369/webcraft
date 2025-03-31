/**
 * Core data models for website customization
 * Contains interfaces for all customizable elements in the website builder
 */

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
  showLogo?: boolean;
  titleColor?: string;
  subtitleColor?: string;
  textShadow?: 'none' | 'light' | 'medium' | 'heavy';
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
    id: number;
    name: string;
    items: Array<{
      id: number;
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
 * Header customization data
 */
export interface HeaderData {
  backgroundColor?: string;
  textColor?: string;
  logoUrl?: string;
  menuItems?: Array<{ id: number; label: string; link: string }>;
}

/**
 * Footer customization data
 */
export interface FooterData {
  backgroundColor: string;
  textColor: string;
  copyrightText: string;
  logoUrl?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  showSocialLinks?: boolean;
  menuItems?: Array<{ id: number; label: string; link: string }>;
  socialUrls?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    linkedin?: string;
    youtube?: string;
    [key: string]: string | undefined;
  };
  socialLinks?: Array<{
    platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'tiktok';
    url: string;
  }>;
  showLegalLinks?: boolean;
  privacyPolicyUrl?: string;
  termsUrl?: string;
  footerLayout?: 'standard' | 'compact' | 'minimal';
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
 * Theme data model for loading and saving themes
 */
export interface ThemeData {
  id: number;
  name: string;
  cssContent: string;
  businessType: string;
  customizations: Customizations;
}
