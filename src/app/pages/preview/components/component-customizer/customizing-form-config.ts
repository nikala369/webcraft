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
    label: 'Background Color',
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
    label: 'Pricing Color',
    type: 'color',
    category: 'styling',
    defaultValue: '#4a8dff',
    description: 'Pricing color used for pricing and highlights',
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
    label: 'Background Color',
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
    label: 'Pricing Color',
    type: 'color',
    category: 'styling',
    defaultValue: '#4a8dff',
    description: 'Pricing color used for pricing and highlights',
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

/**
 * Get smart CTA button defaults based on business type
 */
function getSmartCTADefaults(
  businessType: string,
  plan: 'standard' | 'premium'
) {
  const defaults = {
    buttonText: 'Get Started',
    buttonScrollTargetID: 'contact',
    buttonLink: '/contact',
  };

  switch (businessType) {
    case 'restaurant':
    case 'cafe':
    case 'bar':
      defaults.buttonText = 'View Menu';
      defaults.buttonScrollTargetID = 'menu';
      defaults.buttonLink = plan === 'premium' ? '/menu' : '#menu';
      break;

    case 'salon':
    case 'spa':
    case 'beauty':
      defaults.buttonText = 'Book Appointment';
      defaults.buttonScrollTargetID = 'services';
      defaults.buttonLink = plan === 'premium' ? '/services' : '#services';
      break;

    case 'fitness':
    case 'gym':
      defaults.buttonText = 'Join Now';
      defaults.buttonScrollTargetID = 'services';
      defaults.buttonLink = plan === 'premium' ? '/services' : '#services';
      break;

    case 'architecture':
    case 'portfolio':
    case 'creative':
      defaults.buttonText = 'View Portfolio';
      defaults.buttonScrollTargetID = 'projects';
      defaults.buttonLink = plan === 'premium' ? '/portfolio' : '#projects';
      break;

    case 'consulting':
    case 'business':
    case 'professional':
      defaults.buttonText = 'Get Consultation';
      defaults.buttonScrollTargetID = 'contact';
      defaults.buttonLink = '/contact';
      break;

    default:
      // Keep defaults for unknown business types
      break;
  }

  return defaults;
}

export const CustomizationFormConfig: Record<string, FieldConfig[]> = {
  header: [
    // Content settings
    {
      key: 'logoUrl',
      label: 'Logo',
      type: 'file',
      category: 'content',
      description: 'Upload your business logo (max 2MB)',
      acceptedFileTypes: 'image/*',
    },
    // Styling settings
    {
      key: 'backgroundColor',
      label: 'Background Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#2876FF',
      description: 'Background color of the header',
    },
    {
      key: 'textColor',
      label: 'Text Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#ffffff',
      description: 'Color of the text and menu items',
    },
    {
      key: 'headerBackgroundType',
      label: 'Background Style',
      type: 'select',
      category: 'styling',
      defaultValue: 'solid',
      description: 'Choose your header background style',
      options: [
        { value: 'solid', label: 'Solid Color' },
        { value: 'sunset', label: '🌅 Sunset Gradient' },
        { value: 'ocean', label: '🌊 Ocean Gradient' },
        { value: 'forest', label: '🌲 Forest Gradient' },
        { value: 'royal', label: '👑 Royal Gradient' },
        { value: 'fire', label: '🔥 Fire Gradient' },
        { value: 'midnight', label: '🌙 Midnight Gradient' },
        { value: 'custom', label: '🎨 Custom Gradient' },
      ],
    },
    {
      key: 'customGradientColor1',
      label: 'Gradient Start Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#667eea',
      description: 'Starting color for your custom gradient',
    },
    {
      key: 'customGradientColor2',
      label: 'Gradient End Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#764ba2',
      description: 'Ending color for your custom gradient',
    },
    {
      key: 'customGradientAngle',
      label: 'Gradient Direction',
      type: 'select',
      category: 'styling',
      defaultValue: 45,
      description: 'Direction of your custom gradient',
      options: [
        { value: 45, label: '45° (Diagonal)' },
        { value: 90, label: '90° (Left to Right)' },
        { value: 135, label: '135°' },
        { value: 180, label: '180° (Top to Bottom)' },
        { value: 225, label: '225°' },
        { value: 270, label: '270° (Right to Left)' },
        { value: 315, label: '315°' },
        { value: 360, label: '360° (Bottom to Top)' },
      ],
    },
  ],
  footer: [
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
      key: 'title',
      label: 'Company Name',
      type: 'text',
      category: 'content',
      defaultValue: 'Your Business',
      description: 'Your company or business name',
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
    {
      key: 'copyrightText',
      label: 'Copyright Text',
      type: 'text',
      category: 'content',
      defaultValue: `© ${new Date().getFullYear()} Your Company. All rights reserved.`,
      description: 'Text shown in the copyright section',
    },

    // Social media settings - Standard social media URLs (3 main platforms)
    {
      key: 'socialUrls.facebook',
      label: 'Facebook URL',
      type: 'text',
      category: 'content',
      defaultValue: '',
      placeholder: 'https://facebook.com/yourpage',
      description: 'Your Facebook page URL',
    },
    {
      key: 'socialUrls.instagram',
      label: 'Instagram URL',
      type: 'text',
      category: 'content',
      defaultValue: '',
      placeholder: 'https://instagram.com/yourusername',
      description: 'Your Instagram profile URL',
    },
    {
      key: 'socialUrls.tiktok',
      label: 'TikTok URL',
      type: 'text',
      category: 'content',
      defaultValue: '',
      placeholder: 'https://tiktok.com/@yourusername',
      description: 'Your TikTok profile URL',
    },

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
      label: 'Title Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#ffffff',
      description: 'The color of the main title text.',
    },
    {
      key: 'subtitleColor',
      label: 'Subtitle Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#f0f0f0',
      description: 'The color of the subtitle text.',
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

  // Premium home page sections
  'pages.home.aboutPreview': [
    // Content category
    {
      key: 'title',
      label: 'Section Title',
      type: 'text',
      category: 'content',
      defaultValue: 'About Us',
      description: 'Main title for the about preview section',
    },
    {
      key: 'subtitle',
      label: 'Section Subtitle',
      type: 'text',
      category: 'content',
      defaultValue: 'Discover what makes us unique',
      description: 'Subtitle for the about preview section',
    },
    {
      key: 'storyTitle',
      label: 'Story Title',
      type: 'text',
      category: 'content',
      defaultValue: 'Our Mission',
      description: 'Title for the story/mission section',
    },
    {
      key: 'storyDescription',
      label: 'Story Description',
      type: 'textarea',
      category: 'content',
      defaultValue:
        'We are committed to excellence in everything we do, delivering exceptional value and service to our clients.',
      description: 'Description text for the story/mission section',
    },
    {
      key: 'linkText',
      label: 'Link Text',
      type: 'text',
      category: 'content',
      defaultValue: 'Learn More About Us',
      description: 'Text for the link to the full about page',
    },
    {
      key: 'showStats',
      label: 'Show Statistics',
      type: 'select',
      category: 'content',
      defaultValue: true,
      description: 'Display business statistics section',
      options: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
    },
    {
      key: 'showFeatures',
      label: 'Show Features',
      type: 'select',
      category: 'content',
      defaultValue: true,
      description: 'Display key features section',
      options: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
    },
    // Styling category
    {
      key: 'backgroundColor',
      label: 'Background Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#f8f9fa',
      description: 'Background color of the about preview section',
    },
    {
      key: 'textColor',
      label: 'Text Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#333333',
      description: 'Text color of the about preview section',
    },
    {
      key: 'accentColor',
      label: 'Accent Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#9e6aff',
      description: 'Accent color for highlights and decorative elements',
    },
  ],

  'pages.home.featuredPreview': [
    {
      key: 'title',
      label: 'Section Title',
      type: 'text',
      category: 'content',
      defaultValue: 'Featured',
      description: 'Main title for the featured preview section',
    },
    {
      key: 'subtitle',
      label: 'Section Subtitle',
      type: 'text',
      category: 'content',
      defaultValue: 'Explore our best offerings',
      description: 'Subtitle for the featured preview section',
    },
    {
      key: 'backgroundColor',
      label: 'Background Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#ffffff',
      description: 'Background color of the featured preview section',
    },
  ],

  'pages.home.ctaSection': [
    {
      key: 'title',
      label: 'CTA Title',
      type: 'text',
      category: 'content',
      defaultValue: 'Ready to Get Started?',
      description: 'Main title for the call-to-action section',
    },
    {
      key: 'subtitle',
      label: 'CTA Subtitle',
      type: 'text',
      category: 'content',
      defaultValue: 'Join us today and experience the difference',
      description: 'Subtitle for the call-to-action section',
    },
    {
      key: 'primaryButtonText',
      label: 'Primary Button Text',
      type: 'text',
      category: 'content',
      defaultValue: 'Get Started',
      description: 'Text for the primary call-to-action button',
    },
    {
      key: 'secondaryButtonText',
      label: 'Secondary Button Text',
      type: 'text',
      category: 'content',
      defaultValue: 'Learn More',
      description: 'Text for the secondary call-to-action button',
    },
    {
      key: 'backgroundColor',
      label: 'Background Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#4a8dff',
      description: 'Background color of the CTA section',
    },
  ],

  // Premium About Page sections
  'pages.about.hero': [
    {
      key: 'title',
      label: 'Hero Title',
      type: 'text',
      category: 'content',
      defaultValue: 'About Our Company',
      description: 'Main title for the about hero section',
    },
    {
      key: 'subtitle',
      label: 'Hero Subtitle',
      type: 'text',
      category: 'content',
      defaultValue: 'Building excellence through dedication and innovation',
      description: 'Subtitle for the about hero section',
    },
    {
      key: 'heroImage',
      label: 'Hero Image',
      type: 'file',
      category: 'content',
      description: 'Main hero image for the about page',
      acceptedFileTypes: 'image/*',
    },
    {
      key: 'backgroundColor',
      label: 'Background Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#f8f9fa',
      description: 'Background color of the hero section',
    },
  ],

  'pages.about.story': [
    {
      key: 'title',
      label: 'Story Title',
      type: 'text',
      category: 'content',
      defaultValue: 'Our Story',
      description: 'Title for the story section',
    },
    {
      key: 'text',
      label: 'Story Content',
      type: 'textarea',
      category: 'content',
      defaultValue:
        'Our company was founded on the principles of excellence...',
      description: 'Main story content',
    },
    {
      key: 'storyImage',
      label: 'Story Image',
      type: 'file',
      category: 'content',
      description: 'Image for the story section',
      acceptedFileTypes: 'image/*',
    },
  ],

  'pages.about.team': [
    {
      key: 'title',
      label: 'Section Title',
      type: 'text',
      category: 'content',
      defaultValue: 'Meet Our Team',
      description: 'Title for the team section',
    },
    {
      key: 'subtitle',
      label: 'Section Subtitle',
      type: 'text',
      category: 'content',
      defaultValue: 'The passionate people behind our success',
      description: 'Subtitle for the team section',
    },
  ],

  'pages.about.values': [
    {
      key: 'title',
      label: 'Section Title',
      type: 'text',
      category: 'content',
      defaultValue: 'Our Values',
      description: 'Title for the values section',
    },
    {
      key: 'subtitle',
      label: 'Section Subtitle',
      type: 'text',
      category: 'content',
      defaultValue: 'The principles that guide everything we do',
      description: 'Subtitle for the values section',
    },
  ],

  'pages.about.testimonials': [
    {
      key: 'title',
      label: 'Section Title',
      type: 'text',
      category: 'content',
      defaultValue: 'What Our Clients Say',
      description: 'Title for the testimonials section',
    },
    {
      key: 'subtitle',
      label: 'Section Subtitle',
      type: 'text',
      category: 'content',
      defaultValue: 'Real feedback from real customers',
      description: 'Subtitle for the testimonials section',
    },
  ],

  'pages.about.cta': [
    {
      key: 'title',
      label: 'CTA Title',
      type: 'text',
      category: 'content',
      defaultValue: 'Ready to Work With Us?',
      description: 'Title for the call-to-action section',
    },
    {
      key: 'subtitle',
      label: 'CTA Subtitle',
      type: 'text',
      category: 'content',
      defaultValue: "Let's start your journey to success together",
      description: 'Subtitle for the call-to-action section',
    },
  ],
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
    | 'specializedList'
    | 'boolean';
  category: 'general' | 'styling' | 'content' | 'advanced';
  defaultValue?: any;
  options?: Array<{ value: any; label: string; icon?: string }>;
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
  plan: 'standard' | 'premium',
  businessType?: string
): FieldConfig[] {
  const baseConfig = CustomizationFormConfig[section] || [];

  if (section === 'header') {
    if (plan === 'standard') {
      // For standard plan, only show solid color option
      return baseConfig
        .map((field) => {
          if (field.key === 'headerBackgroundType') {
            return {
              ...field,
              options: [{ value: 'solid', label: 'Solid Color' }],
            };
          }
          return field;
        })
        .filter((field) => {
          // Hide custom gradient fields for standard plan
          return ![
            'customGradientColor1',
            'customGradientColor2',
            'customGradientAngle',
          ].includes(field.key);
        });
    } else {
      // For premium plan, return full config with all gradient options
      return baseConfig;
    }
  }

  if (section === 'pages.home.hero1') {
    // Get smart CTA button defaults based on business type
    const ctaDefaults = businessType
      ? getSmartCTADefaults(businessType, plan)
      : {
          buttonText: 'Get Started',
          buttonScrollTargetID: 'contact',
          buttonLink: '/contact',
        };

    if (plan === 'standard') {
      // Standard plan: Remove video options, add smart CTA button controls
      return baseConfig
        .filter((field) => {
          // Remove video-related fields
          return !['backgroundType', 'backgroundVideo'].includes(field.key);
        })
        .map((field) => {
          // Make backgroundImage always required for standard
          if (field.key === 'backgroundImage') {
            return {
              ...field,
              description:
                'Required: Upload your hero background image (1920x1080px recommended)',
            };
          }
          return field;
        })
        .concat([
          // Add smart CTA button configuration for standard plan
          {
            key: 'showButton',
            label: 'Show Call-to-Action Button',
            type: 'select',
            category: 'content',
            defaultValue: true,
            description: 'Show or hide the call-to-action button',
            options: [
              { value: true, label: 'Yes' },
              { value: false, label: 'No' },
            ],
          },
          // Note: buttonText and buttonScrollTargetID are auto-generated based on business type for standard plan
          {
            key: 'buttonBackgroundColor',
            label: 'Button Background Color',
            type: 'color',
            category: 'styling',
            defaultValue: '#2876ff',
            description: 'Background color of the call-to-action button',
          },
          {
            key: 'buttonTextColor',
            label: 'Button Text Color',
            type: 'color',
            category: 'styling',
            defaultValue: '#ffffff',
            description: 'Text color of the call-to-action button',
          },
        ]);
    } else {
      // Premium plan: Full config with video support but smart CTA (no custom text/link)
      return baseConfig.concat([
        // Premium CTA options (smart defaults like standard, but with premium styling)
        {
          key: 'showButton',
          label: 'Show Call-to-Action Button',
          type: 'select',
          category: 'content',
          defaultValue: true,
          description: 'Show or hide the call-to-action button',
          options: [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ],
        },
        // Note: buttonText and buttonScrollTargetID are auto-generated based on business type for premium plan too
        {
          key: 'buttonBackgroundColor',
          label: 'Button Background Color',
          type: 'color',
          category: 'styling',
          defaultValue: '#9e6aff',
          description: 'Background color of the call-to-action button',
        },
        {
          key: 'buttonTextColor',
          label: 'Button Text Color',
          type: 'color',
          category: 'styling',
          defaultValue: '#ffffff',
          description: 'Text color of the call-to-action button',
        },
      ]);
    }
  }

  if (plan === 'premium') {
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
  // Additional premium social media platforms
  {
    key: 'socialUrls.linkedin',
    label: 'LinkedIn URL',
    type: 'text',
    category: 'content',
    defaultValue: '',
    placeholder: 'https://linkedin.com/in/yourprofile',
    description: 'Your LinkedIn profile or company page URL',
  },
  {
    key: 'socialUrls.youtube',
    label: 'YouTube URL',
    type: 'text',
    category: 'content',
    defaultValue: '',
    placeholder: 'https://youtube.com/@yourchannel',
    description: 'Your YouTube channel URL',
  },
  {
    key: 'socialUrls.twitter',
    label: 'Twitter URL',
    type: 'text',
    category: 'content',
    defaultValue: '',
    placeholder: 'https://twitter.com/yourusername',
    description: 'Your Twitter profile URL',
  },
  {
    key: 'navUnderlineColor',
    label: 'Navigation Underline Color',
    type: 'color',
    category: 'styling',
    defaultValue: '#ffffff',
    description:
      'Color of the navigation underline for active items (Premium only)',
  },
];
