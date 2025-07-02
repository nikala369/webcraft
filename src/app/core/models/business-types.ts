export interface BusinessType {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections?: string[];
}

export const BUSINESS_TYPES: BusinessType[] = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'For cafes, restaurants, and food businesses',
    icon: 'restaurant',
  },
  {
    id: 'salon',
    name: 'Salon & Beauty',
    description: 'For salons, spas, and beauty services',
    icon: 'salon',
  },
  {
    id: 'architecture',
    name: 'Architecture',
    description: 'For architects, interior designers, and construction firms',
    icon: 'architecture',
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'For freelancers, artists, and creative professionals',
    icon: 'portfolio',
  },
];

// Sections configuration by business type and plan
export const BUSINESS_TYPE_SECTIONS = {
  restaurant: {
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
  salon: {
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
  architecture: {
    standard: ['hero', 'about', 'projects', 'contact'],
    premium: [
      'hero',
      'about',
      'process',
      'projects',
      'team',
      'testimonials',
      'contact',
    ],
  },
  portfolio: {
    standard: ['hero', 'about', 'projects', 'contact'],
    premium: ['hero', 'about', 'skills', 'projects', 'testimonials', 'contact'],
  },
};

// Menu items configuration by business type and plan
export const BUSINESS_TYPE_MENU_ITEMS = {
  restaurant: {
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
  salon: {
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
  architecture: {
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
      { id: 4, label: 'Team', link: '/team' },
      { id: 5, label: 'Contact', link: '/contact' },
    ],
  },
  portfolio: {
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
