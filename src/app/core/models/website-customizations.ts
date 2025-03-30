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
  showPrimaryButton?: boolean;
  primaryButtonText?: string;
  primaryButtonColor?: string;
  primaryButtonTextColor?: string;
  primaryButtonLink?: string;
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
  showSocialLinks?: boolean;
  socialLinks?: Array<{
    platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin';
    url: string;
  }>;
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
    about?: any;
    contact?: any;
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
