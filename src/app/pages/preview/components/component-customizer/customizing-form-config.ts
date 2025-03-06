export const CustomizationFormConfig: Record<string, FieldConfig[]> = {
  header: [
    {
      key: 'backgroundColor',
      label: 'BACKGROUND',
      type: 'color',
      defaultValue: '#2876FF',
      required: true,
    },
    {
      key: 'textColor',
      label: 'TEXT COLOR',
      type: 'color',
      defaultValue: '#ffffff',
      required: true,
    },
    { key: 'logoUrl', label: 'Logo', type: 'file' },
    {
      key: 'menuItems',
      label: 'Menu Items',
      type: 'list',
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
      defaultValue: '#1a1a1a',
    },
    {
      key: 'textColor',
      label: 'Text Color',
      type: 'color',
      defaultValue: '#ffffff',
    },
    {
      key: 'copyrightText',
      label: 'Copyright Text',
      type: 'text',
      defaultValue: '© 2025 MyWebsite',
    },
  ],
  'pages.home.hero1': [
    {
      key: 'backgroundImage',
      label: 'Background Image (Recommended: 1920x1080px)',
      type: 'file',
      required: true,
    },
    {
      key: 'layout',
      label: 'Layout Style',
      type: 'select',
      defaultValue: 'center',
      required: false,
      options: [
        { value: 'center', label: 'Centered Content' },
        { value: 'left', label: 'Left-Aligned Content' },
        { value: 'right', label: 'Right-Aligned Content' },
      ],
    },
    {
      key: 'height',
      label: 'Section Height',
      type: 'select',
      defaultValue: 'medium',
      required: false,
      options: [
        { value: 'tall', label: 'Tall (Full Screen)' },
        { value: 'medium', label: 'Medium' },
        { value: 'compact', label: 'Compact' },
      ],
    },
    {
      key: 'showLogo',
      label: 'Show Business Logo',
      type: 'select',
      defaultValue: true,
      required: false,
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
    },
    {
      key: 'title',
      label: 'Main Headline',
      type: 'text',
      defaultValue: 'Grow Your Business With Us',
      required: true,
    },
    {
      key: 'titleColor',
      label: 'Headline Color',
      type: 'color',
      defaultValue: '#ffffff',
      required: false,
    },
    {
      key: 'subtitle',
      label: 'Supporting Tagline',
      type: 'text',
      defaultValue: 'Professional solutions tailored to your business needs',
      required: false,
    },
    {
      key: 'subtitleColor',
      label: 'Tagline Color',
      type: 'color',
      defaultValue: '#f0f0f0',
      required: false,
    },
    {
      key: 'textShadow',
      label: 'Text Shadow Effect',
      type: 'select',
      defaultValue: 'medium',
      required: false,
      options: [
        { value: 'none', label: 'None' },
        { value: 'light', label: 'Light' },
        { value: 'medium', label: 'Medium' },
        { value: 'heavy', label: 'Heavy' },
      ],
    },
    {
      key: 'showPrimaryButton',
      label: 'Show Primary Button',
      type: 'select',
      defaultValue: true,
      required: false,
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
    },
    {
      key: 'primaryButtonText',
      label: 'Primary Button Text',
      type: 'text',
      defaultValue: 'Get Started',
      required: false,
    },
    {
      key: 'primaryButtonColor',
      label: 'Primary Button Color',
      type: 'color',
      defaultValue: '#ff5722',
      required: false,
    },
    {
      key: 'primaryButtonTextColor',
      label: 'Primary Button Text Color',
      type: 'color',
      defaultValue: '#ffffff',
      required: false,
    },
    {
      key: 'primaryButtonLink',
      label: 'Primary Button Target',
      type: 'select',
      defaultValue: '/contact',
      required: false,
      options: [
        { value: '/about', label: 'About Us Page' },
        { value: '/services', label: 'Services Page' },
        { value: '/contact', label: 'Contact Page' },
      ],
    },
  ],
  'pages.home.hero2': [
    { key: 'backgroundImage', label: 'Background Image', type: 'file' },
    {
      key: 'title',
      label: 'Title',
      type: 'text',
      defaultValue: 'Hero 2 Title',
      required: false,
    },
    {
      key: 'subtitle',
      label: 'Subtitle',
      type: 'text',
      defaultValue: 'Hero 2 Subtitle',
      required: false,
    },
  ],
};

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'color' | 'file' | 'list' | 'select';
  defaultValue?: any;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}
