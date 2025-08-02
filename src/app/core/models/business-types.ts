export interface BusinessType {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections?: string[];
  enabled: boolean; // New property to control availability
  comingSoon?: boolean; // Flag for coming soon business types
}

export const BUSINESS_TYPES: BusinessType[] = [
  {
    id: 'RESTAURANT',
    name: 'Restaurant & Food',
    description: 'For cafes, restaurants, food trucks, and food businesses',
    icon: 'restaurant', // Keep lowercase for asset filename
    enabled: true,
  },
  {
    id: 'SALON',
    name: 'Salon & Beauty',
    description: 'For salons, spas, and beauty services',
    icon: 'salon', // Keep lowercase for asset filename
    enabled: false,
    comingSoon: true,
  },
  {
    id: 'PORTFOLIO',
    name: 'Portfolio & Creative',
    description: 'For freelancers, artists, and creative professionals',
    icon: 'portfolio', // Keep lowercase for asset filename
    enabled: false,
    comingSoon: true,
  },
  // Architecture completely removed as requested
];

// Sections configuration by business type and plan
// Only include restaurant since it's the only enabled type
export const BUSINESS_TYPE_SECTIONS = {
  RESTAURANT: {
    standard: ['hero', 'about', 'menu', 'contact'],
    premium: [
      'hero',
      'about',
      'menu',
      'testimonials',
      'reservations',
      'contact',
    ],
  },
  // Keep other configurations for future use but they won't be accessible
  SALON: {
    standard: ['hero', 'about', 'services', 'contact'],
    premium: [
      'hero',
      'about',
      'services',
      'stylists',
      'booking',
      'testimonials',
      'contact',
    ],
  },
  PORTFOLIO: {
    standard: ['hero', 'about', 'projects', 'contact'],
    premium: ['hero', 'about', 'skills', 'projects', 'testimonials', 'contact'],
  },
};

// Menu items configuration by business type and plan
// Only include restaurant since it's the only enabled type
export const BUSINESS_TYPE_MENU_ITEMS = {
  RESTAURANT: {
    standard: [
      { id: 1, label: 'Home', link: '#hero' },
      { id: 2, label: 'About', link: '#about' },
      { id: 3, label: 'Menu', link: '#menu' },
      { id: 4, label: 'Contact', link: '#contact' },
    ],
    premium: [
      { id: 1, label: 'Home', link: '/' },
      { id: 2, label: 'Menu', link: '/menu' },
      { id: 3, label: 'About', link: '/about' },
      { id: 4, label: 'Reservations', link: '/reservations' },
      { id: 5, label: 'Contact', link: '/contact' },
    ],
  },
  // Keep other configurations for future use but they won't be accessible
  SALON: {
    standard: [
      { id: 1, label: 'Home', link: '#hero' },
      { id: 2, label: 'About', link: '#about' },
      { id: 3, label: 'Services', link: '#services' },
      { id: 4, label: 'Contact', link: '#contact' },
    ],
    premium: [
      { id: 1, label: 'Home', link: '/' },
      { id: 2, label: 'Services', link: '/services' },
      { id: 3, label: 'About', link: '/about' },
      { id: 4, label: 'Stylists', link: '/stylists' },
      { id: 5, label: 'Contact', link: '/contact' },
    ],
  },
  PORTFOLIO: {
    standard: [
      { id: 1, label: 'Home', link: '#hero' },
      { id: 2, label: 'About', link: '#about' },
      { id: 3, label: 'Projects', link: '#projects' },
      { id: 4, label: 'Contact', link: '#contact' },
    ],
    premium: [
      { id: 1, label: 'Home', link: '/' },
      { id: 2, label: 'Projects', link: '/projects' },
      { id: 3, label: 'About', link: '/about' },
      { id: 4, label: 'Skills', link: '/skills' },
      { id: 5, label: 'Contact', link: '/contact' },
    ],
  },
};

// Helper function to get only enabled business types
export const getEnabledBusinessTypes = (): BusinessType[] => {
  return BUSINESS_TYPES.filter((type) => type.enabled);
};

// Helper function to get all business types (including coming soon)
export const getAllBusinessTypes = (): BusinessType[] => {
  return BUSINESS_TYPES;
};
