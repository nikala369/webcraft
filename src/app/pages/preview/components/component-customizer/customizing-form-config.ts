export const CustomizationFormConfig: Record<string, FieldConfig[]> = {
  header: [
    {
      key: 'backgroundColor',
      label: 'BACKGROUND',
      type: 'color',
      defaultValue: '#2876FF',
      required: true
    },
    {
      key: 'textColor',
      label: 'TEXT COLOR',
      type: 'color',
      defaultValue: '#ffffff',
      required: true
    },
    { key: 'logoUrl', label: 'Logo', type: 'file' },
    {
      key: 'menuItems',
      label: 'Menu Items',
      type: 'list',
      defaultValue: [
        { id: 1, label: 'Home', link: '/' },
        { id: 2, label: 'About', link: '/about' },
        { id: 3, label: 'Contact', link: '/contact' }
      ]
    }
  ],
  hero: [
    { key: 'backgroundImage', label: 'Background Image', type: 'file' },
    { key: 'title', label: 'Title', type: 'text', defaultValue: '', required: false },
    { key: 'subtitle', label: 'Subtitle', type: 'text', defaultValue: '', required: false }
  ],
  footer: [
    { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#1a1a1a' },
    { key: 'textColor', label: 'Text Color', type: 'color', defaultValue: '#ffffff' },
    { key: 'copyrightText', label: 'Copyright Text', type: 'text', defaultValue: '© 2025 MyWebsite' }
  ]
};

export interface FieldConfig {
  key: string;            // e.g., 'backgroundColor'
  label: string;          // e.g., 'Background Color'
  type: 'text' | 'color' | 'file' | 'list'; // type of input
  defaultValue?: any;
  required?: boolean;
}
