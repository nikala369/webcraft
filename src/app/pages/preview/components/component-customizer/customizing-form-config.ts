/**
 * Configuration for Contact section
 */
export const contactSectionConfig: FieldConfig[] = [
  // Content settings
  {
    key: 'title',
    label: 'Section Title',
    type: 'text',
    category: 'content',
    defaultValue: 'Contact Us',
    description: 'Main title for the contact section',
  },
  {
    key: 'subtitle',
    label: 'Section Subtitle',
    type: 'text',
    category: 'content',
    defaultValue: "We'd love to hear from you",
    description: 'Subtitle or tagline for the contact section',
  },
  {
    key: 'address',
    label: 'Business Address',
    type: 'textarea',
    category: 'content',
    defaultValue: '123 Business Street\nAnytown, ST 12345',
    description:
      'Address displayed in the contact information (use line breaks for formatting)',
  },
  {
    key: 'email',
    label: 'Email Address',
    type: 'text',
    category: 'content',
    defaultValue: 'info@yourbusiness.com',
    description: 'Contact email address for form submissions and display',
  },
  // Form settings
  {
    key: 'formTitle',
    label: 'Form Title',
    type: 'text',
    category: 'content',
    defaultValue: 'Send a Message',
    description: 'Title displayed above the contact form',
  },
  {
    key: 'formButtonText',
    label: 'Submit Button Text',
    type: 'text',
    category: 'content',
    defaultValue: 'Send Message',
    description: 'Text displayed on the form submit button',
  },
  // Style settings
  {
    key: 'backgroundColor',
    label: 'Background Color',
    type: 'color',
    category: 'styling',
    defaultValue: '#f8f8f8',
    description: 'Background color of the contact section',
  },
  {
    key: 'textColor',
    label: 'Text Color',
    type: 'color',
    category: 'styling',
    defaultValue: '#333333',
    description: 'Main text color for the contact section',
  },
];

// Premium-only fields for contact section
export const contactSectionPremiumConfig: FieldConfig[] = [
  {
    key: 'showSocialLinks',
    label: 'Show Social Media Links',
    type: 'select',
    category: 'content',
    defaultValue: true,
    description: 'Display social media links in the contact section',
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' },
    ],
  },
  {
    key: 'showMap',
    label: 'Show Map',
    type: 'select',
    category: 'content',
    defaultValue: true,
    description: 'Display a map of your location',
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' },
    ],
  },
  {
    key: 'mapLocation',
    label: 'Map Location',
    type: 'text',
    category: 'content',
    defaultValue: '123 Main St, New York, NY 10001',
    description: 'Address for the map display',
  },
  {
    key: 'hours',
    label: 'Business Hours',
    type: 'textarea',
    category: 'content',
    defaultValue: 'Monday-Friday: 9am-5pm\nWeekends: Closed',
    description: 'Business hours displayed in contact information',
  },
];

/**
 * Configuration for About section
 */
export const aboutSectionConfig: FieldConfig[] = [
  // CONTENT category
  {
    key: 'title',
    label: 'Section Title',
    type: 'text',
    category: 'content',
    defaultValue: 'About Us',
    description: 'The main heading for the about section.',
  },
  {
    key: 'subtitle',
    label: 'Section Subtitle',
    type: 'text',
    category: 'content',
    defaultValue: 'Our Story',
    description: 'A brief subtitle or tagline for the about section.',
  },
  {
    key: 'imageUrl',
    label: 'About Image',
    type: 'file',
    category: 'content',
    description: 'An image representing your business or team.',
    acceptedFileTypes: 'image/*',
    fileUploadNote: 'Recommended size: 800x600px. JPG or PNG format.',
  },
  {
    key: 'storyTitle',
    label: 'Story Heading',
    type: 'text',
    category: 'content',
    defaultValue: 'Our Story',
    description: 'The heading for your business story section.',
  },
  {
    key: 'storyText',
    label: 'Story Content',
    type: 'textarea',
    category: 'content',
    defaultValue:
      'We are dedicated to providing exceptional service and quality. Our commitment to excellence has made us a trusted choice in the industry.',
    description: 'Tell the story of your business or personal journey.',
  },
  {
    key: 'missionTitle',
    label: 'Mission Heading',
    type: 'text',
    category: 'content',
    defaultValue: 'Our Mission',
    description: 'The heading for your mission statement section.',
  },
  {
    key: 'missionText',
    label: 'Mission Content',
    type: 'textarea',
    category: 'content',
    defaultValue:
      "Our mission is to provide high-quality services that exceed our clients' expectations. We believe in building long-lasting relationships based on trust, integrity, and results.",
    description: 'Describe your mission, values, or philosophy.',
  },

  // STYLING category
  {
    key: 'backgroundColor',
    label: 'Background Color',
    type: 'color',
    category: 'styling',
    defaultValue: '#ffffff',
    description: 'The background color of the about section.',
  },
  {
    key: 'textColor',
    label: 'Text Color',
    type: 'color',
    category: 'styling',
    defaultValue: '#333333',
    description: 'The color of the text in the about section.',
  },
];

/**
 * Configure premium-only fields for About section
 */
export const aboutSectionPremiumConfig: FieldConfig[] = [
  {
    key: 'valuesTitle',
    label: 'Values Heading',
    type: 'text',
    category: 'content',
    defaultValue: 'Our Values',
    description: 'The heading for your core values section.',
  },
  {
    key: 'values',
    label: 'Core Values',
    type: 'list',
    category: 'content',
    defaultValue: ['Quality', 'Integrity', 'Innovation', 'Customer Focus'],
    description: 'List your core business values.',
  },
];

/**
 * Configuration for Menu section (Restaurant)
 */
export const menuSectionConfig: FieldConfig[] = [
  // Content Settings
  {
    key: 'title',
    label: 'Section Title',
    type: 'text',
    category: 'content',
    defaultValue: 'Our Menu',
    description: 'Main title for the menu section',
  },
  {
    key: 'subtitle',
    label: 'Section Subtitle',
    type: 'text',
    category: 'content',
    defaultValue: 'Freshly Prepared Daily',
    description: 'Subtitle or tagline for the menu section',
  },
  // Menu Items (using specialized editor)
  {
    key: 'categories',
    label: 'Menu Categories & Items',
    type: 'specializedList', // Use a custom type to trigger the specialized editor
    category: 'content',
    defaultValue: [
      { id: 'cat1', name: 'Appetizers', items: [] },
      { id: 'cat2', name: 'Main Courses', items: [] },
    ], // Default with 2 categories for standard plan
    description: 'Manage menu categories and the items within them.',
  },
  // Styling Settings
  {
    key: 'backgroundColor',
    label: 'Section Background Color',
    type: 'color',
    category: 'styling',
    defaultValue: '#f9f9f9',
    description: 'Background color of the menu section',
  },
  {
    key: 'textColor',
    label: 'Text Color',
    type: 'color',
    category: 'styling',
    defaultValue: '#333333',
    description: 'Main text color for the menu section',
  },
  {
    key: 'cardBackgroundColor',
    label: 'Card Background Color',
    type: 'color',
    category: 'styling',
    defaultValue: '#ffffff',
    description: 'Background color for individual menu item cards',
  },
  {
    key: 'accentColor',
    label: 'Accent Color',
    type: 'color',
    category: 'styling',
    defaultValue: '#4a8dff',
    description: 'Accent color used for pricing and highlights',
  },
];

/**
 * Configuration for Services section
 */
export const servicesSectionConfig: FieldConfig[] = [
  // Content settings
  {
    key: 'title',
    label: 'Section Title',
    type: 'text',
    category: 'content',
    defaultValue: 'Our Services',
    description: 'Main title for the services section',
  },
  {
    key: 'subtitle',
    label: 'Section Subtitle',
    type: 'text',
    category: 'content',
    defaultValue: 'Professional services tailored to your needs',
    description: 'Subtitle or tagline for the services section',
  },
  // Services items (using specialized editor)
  {
    key: 'items',
    label: 'Services & Offerings',
    type: 'specializedList', // Use specialized editor
    category: 'content',
    description: 'Manage your service offerings with details and pricing',
  },
  // Styling settings
  {
    key: 'backgroundColor',
    label: 'Section Background Color',
    type: 'color',
    category: 'styling',
    defaultValue: '#f9f9f9',
    description: 'Background color of the services section',
  },
  {
    key: 'textColor',
    label: 'Text Color',
    type: 'color',
    category: 'styling',
    defaultValue: '#333333',
    description: 'Main text color for the services section',
  },
  {
    key: 'cardBackgroundColor',
    label: 'Card Background Color',
    type: 'color',
    category: 'styling',
    defaultValue: '#ffffff',
    description: 'Background color for individual service cards',
  },
  {
    key: 'accentColor',
    label: 'Accent Color',
    type: 'color',
    category: 'styling',
    defaultValue: '#4a8dff',
    description: 'Accent color used for pricing and highlights',
  },
];

/**
 * Premium-only fields for Services section
 */
export const servicesSectionPremiumConfig: FieldConfig[] = [
  {
    key: 'layout',
    label: 'Layout Style',
    type: 'select',
    category: 'styling',
    defaultValue: 'grid',
    description: 'Choose the layout style for displaying services',
    options: [
      { value: 'grid', label: 'Grid Layout' },
      { value: 'list', label: 'List Layout' },
      { value: 'carousel', label: 'Carousel' },
    ],
  },
  {
    key: 'showPricing',
    label: 'Show Pricing',
    type: 'select',
    category: 'content',
    defaultValue: true,
    description: 'Display service prices in the services section',
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' },
    ],
  },
  {
    key: 'showBooking',
    label: 'Show Booking Button',
    type: 'select',
    category: 'content',
    defaultValue: true,
    description: 'Display booking buttons for each service',
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' },
    ],
  },
  {
    key: 'bookingBtnText',
    label: 'Booking Button Text',
    type: 'text',
    category: 'content',
    defaultValue: 'Book Now',
    description: 'Text displayed on the booking button',
  },
];

export const CustomizationFormConfig: Record<string, FieldConfig[]> = {
  header: [
    // {
    //   key: 'stickyHeader',
    //   label: 'Header scroll option',
    //   type: 'select',
    //   category: 'general',
    //   defaultValue: 'relative',
    //   description: 'Controls how the header behaves when scrolling the page',
    //   options: [
    //     { value: 'relative', label: 'Standard (Scrolls Away)' },
    //     { value: 'sticky', label: 'Sticky (Follows Scroll)' },
    //     { value: 'fixed', label: 'Fixed (Always Visible)' },
    //   ],
    // },
    // Styling settings
    {
      key: 'backgroundColor',
      label: 'Background Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#2876FF',
      required: true,
    },
    {
      key: 'textColor',
      label: 'Text Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#ffffff',
      required: true,
    },
    // Content settings
    {
      key: 'logoUrl',
      label: 'Logo',
      type: 'file',
      category: 'content',
    },
    {
      key: 'menuItems',
      label: 'Menu Items',
      type: 'list',
      category: 'content',
      defaultValue: [
        { id: 1, label: 'Home', link: '/' },
        { id: 2, label: 'About', link: '/about' },
        { id: 3, label: 'Contact', link: '/contact' },
      ],
    },
  ],
  footer: [
    // Styling settings
    {
      key: 'backgroundColor',
      label: 'Background Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#1a1a1a',
      description: 'Background color of the footer section',
    },
    {
      key: 'textColor',
      label: 'Text Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#ffffff',
      description: 'Color of the text in the footer',
    },

    // Content settings
    {
      key: 'logoUrl',
      label: 'Footer Logo',
      type: 'file',
      category: 'content',
      description: 'Logo to display in the footer (optional)',
      acceptedFileTypes: 'image/*',
    },
    {
      key: 'tagline',
      label: 'Company Tagline',
      type: 'text',
      category: 'content',
      defaultValue: 'Professional solutions tailored to your needs',
      description: 'Short tagline describing your business',
    },
    {
      key: 'copyrightText',
      label: 'Copyright Text',
      type: 'text',
      category: 'content',
      defaultValue: `© ${new Date().getFullYear()} Your Company. All rights reserved.`,
      description: 'Text shown in the copyright section',
    },
    {
      key: 'address',
      label: 'Business Address',
      type: 'text',
      category: 'content',
      defaultValue: '123 Business Ave, City',
      description: 'Physical address of your business',
    },
    {
      key: 'phone',
      label: 'Phone Number',
      type: 'text',
      category: 'content',
      defaultValue: '(555) 123-4567',
      description: 'Contact phone number',
    },
    {
      key: 'email',
      label: 'Email Address',
      type: 'text',
      category: 'content',
      defaultValue: 'info@yourbusiness.com',
      description: 'Contact email address',
    },

    // Social media settings
    {
      key: 'showSocialLinks',
      label: 'Show Social Media Links',
      type: 'select',
      category: 'general',
      defaultValue: true,
      description: 'Display social media links in the footer',
      options: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
    },
    // Social media URLs
    {
      key: 'socialUrls.facebook',
      label: 'Facebook URL',
      type: 'text',
      category: 'content',
      defaultValue: 'https://facebook.com/',
      description: 'Your Facebook page URL',
    },
    {
      key: 'socialUrls.instagram',
      label: 'Instagram URL',
      type: 'text',
      category: 'content',
      defaultValue: 'https://instagram.com/',
      description: 'Your Instagram profile URL',
    },
    {
      key: 'socialUrls.tiktok',
      label: 'TikTok URL',
      type: 'text',
      category: 'content',
      defaultValue: 'https://tiktok.com/',
      description: 'Your TikTok profile URL',
    },
  ],
  'pages.home.hero1': [
    // CONTENT category
    {
      key: 'backgroundType',
      label: 'Background Type',
      type: 'select',
      category: 'content',
      defaultValue: 'image',
      description: 'Choose between image or video background',
      options: [
        { value: 'image', label: 'Image' },
        { value: 'video', label: 'Video' },
      ],
    },
    {
      key: 'backgroundImage',
      label: 'Background Image',
      type: 'file',
      category: 'content',
      required: true,
      description:
        'Recommended size: 1920x1080px. This image will appear behind your hero text.',
    },
    {
      key: 'backgroundVideo',
      label: 'Background Video',
      type: 'file',
      category: 'content',
      description:
        'Upload a short video for your hero background. Recommended MP4 format, max 10MB.',
    },
    {
      key: 'showContentText',
      label: 'Show Text Content',
      type: 'select',
      category: 'content',
      defaultValue: true,
      description: 'Show or hide the title and subtitle text',
      options: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
    },
    {
      key: 'title',
      label: 'Main Headline',
      type: 'text',
      category: 'content',
      defaultValue: 'Grow Your Business With Us',
      description: 'The primary headline that appears in the hero section.',
    },
    {
      key: 'subtitle',
      label: 'Supporting Tagline',
      type: 'text',
      category: 'content',
      defaultValue: 'Professional solutions tailored to your business needs',
      description:
        'A brief description or tagline that appears below the headline.',
    },

    // STYLING category
    {
      key: 'overlayOpacity',
      label: 'Background Overlay Opacity',
      type: 'select',
      category: 'styling',
      defaultValue: 'medium',
      description: 'Control the darkness of the overlay on your background',
      options: [
        { value: 'none', label: 'None' },
        { value: 'light', label: 'Light' },
        { value: 'medium', label: 'Medium' },
        { value: 'heavy', label: 'Heavy' },
      ],
    },
    {
      key: 'overlayColor',
      label: 'Overlay Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#000000',
      description: 'The color of the overlay on the background',
    },
    {
      key: 'titleColor',
      label: 'Headline Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#ffffff',
      description: 'The color of the main headline text.',
    },
    {
      key: 'subtitleColor',
      label: 'Tagline Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#f0f0f0',
      description: 'The color of the supporting tagline text.',
    },

    // GENERAL category
    {
      key: 'layout',
      label: 'Content Alignment',
      type: 'select',
      category: 'general',
      defaultValue: 'center',
      description:
        'Controls how the content is aligned within the hero section.',
      options: [
        { value: 'center', label: 'Centered' },
        { value: 'left', label: 'Left-Aligned' },
        { value: 'right', label: 'Right-Aligned' },
      ],
    },
    {
      key: 'showLogo',
      label: 'Show Logo',
      type: 'select',
      category: 'general',
      defaultValue: true,
      description: 'Show or hide the business logo in the hero section.',
      options: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
    },
    {
      key: 'textShadow',
      label: 'Text Shadow',
      type: 'select',
      category: 'general',
      defaultValue: 'medium',
      description:
        'Adds a shadow behind text to make it more readable over background images.',
      options: [
        { value: 'none', label: 'None' },
        { value: 'light', label: 'Light' },
        { value: 'medium', label: 'Medium' },
        { value: 'heavy', label: 'Heavy' },
      ],
    },
  ],
  // About section configuration for standard structure
  'pages.home.about': aboutSectionConfig,
  'pages.home.contact': contactSectionConfig,
  'pages.home.menu': menuSectionConfig,
  'pages.home.services': servicesSectionConfig,
};

/**
 * Field configuration for customization form
 */
export interface FieldConfig {
  key: string;
  label: string;
  type:
    | 'text'
    | 'textarea'
    | 'select'
    | 'color'
    | 'file'
    | 'list'
    | 'specializedList';
  category: 'general' | 'styling' | 'content' | 'advanced';
  defaultValue?: any;
  options?: Array<{ value: any; label: string }>;
  description?: string;
  required?: boolean;
  acceptedFileTypes?: string;
  fileUploadNote?: string;
  placeholder?: string;
}

/**
 * Add premium fields to the main configuration
 */
export function getPlanSpecificConfig(
  section: string,
  plan: 'standard' | 'premium'
): FieldConfig[] {
  const baseConfig = CustomizationFormConfig[section] || [];

  if (plan === 'premium') {
    // Add premium-specific fields based on section
    if (section === 'pages.home.about') {
      return [...baseConfig, ...aboutSectionPremiumConfig];
    }

    if (section === 'footer') {
      return [...baseConfig, ...footerPremiumConfig];
    }

    if (section === 'pages.home.contact') {
      return [...baseConfig, ...contactSectionPremiumConfig];
    }

    if (section === 'pages.home.services') {
      return [...baseConfig, ...servicesSectionPremiumConfig];
    }
  }

  return baseConfig;
}

/**
 * Configure premium-only fields for Footer section
 */
export const footerPremiumConfig: FieldConfig[] = [
  {
    key: 'socialLinks',
    label: 'Social Media Links',
    type: 'list',
    category: 'content',
    defaultValue: [
      { platform: 'facebook', url: 'https://facebook.com/' },
      { platform: 'instagram', url: 'https://instagram.com/' },
      { platform: 'twitter', url: 'https://twitter.com/' },
    ],
    description: 'Your social media profiles',
  },
  {
    key: 'showLegalLinks',
    label: 'Show Legal Links',
    type: 'select',
    category: 'general',
    defaultValue: true,
    description: 'Display Privacy Policy and Terms links',
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' },
    ],
  },
  {
    key: 'privacyPolicyUrl',
    label: 'Privacy Policy URL',
    type: 'text',
    category: 'content',
    defaultValue: '/privacy',
    description: 'Link to your privacy policy page',
  },
  {
    key: 'termsUrl',
    label: 'Terms of Service URL',
    type: 'text',
    category: 'content',
    defaultValue: '/terms',
    description: 'Link to your terms of service page',
  },
  {
    key: 'footerLayout',
    label: 'Footer Layout',
    type: 'select',
    category: 'styling',
    defaultValue: 'standard',
    description: 'Choose the footer layout style',
    options: [
      { value: 'standard', label: 'Standard (4 columns)' },
      { value: 'compact', label: 'Compact (3 columns)' },
      { value: 'minimal', label: 'Minimal (2 columns)' },
    ],
  },
  // Additional premium social media options
  {
    key: 'socialUrls.linkedin',
    label: 'LinkedIn URL',
    type: 'text',
    category: 'content',
    defaultValue: 'https://linkedin.com/',
    description: 'Your LinkedIn profile or company page URL',
  },
  {
    key: 'socialUrls.youtube',
    label: 'YouTube URL',
    type: 'text',
    category: 'content',
    defaultValue: 'https://youtube.com/',
    description: 'Your YouTube channel URL',
  },
];
