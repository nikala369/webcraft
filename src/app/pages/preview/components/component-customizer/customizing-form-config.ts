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
    {
      key: 'backgroundColor',
      label: 'Background Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#1a1a1a',
    },
    {
      key: 'textColor',
      label: 'Text Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#ffffff',
    },
    {
      key: 'copyrightText',
      label: 'Copyright Text',
      type: 'text',
      category: 'general',
      defaultValue: '© 2025 MyWebsite',
    },
  ],
  'pages.home.hero1': [
    // CONTENT category
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
    {
      key: 'primaryButtonText',
      label: 'Button Text',
      type: 'text',
      category: 'content',
      defaultValue: 'Get Started',
      description:
        'The text that appears on the primary call-to-action button.',
    },

    // STYLING category
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
    {
      key: 'primaryButtonColor',
      label: 'Button Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#ff5722',
      description: 'The background color of the primary button.',
    },
    {
      key: 'primaryButtonTextColor',
      label: 'Button Text Color',
      type: 'color',
      category: 'styling',
      defaultValue: '#ffffff',
      description: 'The color of the text on the primary button.',
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
    {
      key: 'showPrimaryButton',
      label: 'Show Button',
      type: 'select',
      category: 'general',
      defaultValue: true,
      description: 'Show or hide the call-to-action button.',
      options: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
    },
    {
      key: 'primaryButtonLink',
      label: 'Button Target',
      type: 'select',
      category: 'general',
      defaultValue: '/contact',
      description:
        'The page that users will navigate to when clicking the button.',
      options: [
        { value: '/about', label: 'About Us Page' },
        { value: '/services', label: 'Services Page' },
        { value: '/contact', label: 'Contact Page' },
      ],
    },
  ],
};

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'color' | 'file' | 'list' | 'select';
  category: string;
  defaultValue?: any;
  required?: boolean;
  description?: string;
  options?: Array<{ value: any; label: string }>;
}
