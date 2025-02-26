export const CustomizationFormConfig: Record<string, FieldConfig[]> = {
  header: [
    { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#2876FF' },
    { key: 'logoUrl', label: 'Logo', type: 'file' },
    { key: 'menuItems', label: 'Menu Items', type: 'list' }
  ],
  hero: [
    { key: 'backgroundImage', label: 'Background Image', type: 'file' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'subtitle', label: 'Subtitle', type: 'text' }
  ],
  footer: [
    { key: 'backgroundColor', label: 'Background Color', type: 'color', defaultValue: '#1a1a1a' },
    { key: 'textColor', label: 'Text Color', type: 'color', defaultValue: '#ffffff' },
    { key: 'copyrightText', label: 'Copyright Text', type: 'text' }
  ]
};

export interface FieldConfig {
  key: string;            // e.g., 'backgroundColor'
  label: string;          // e.g., 'Background Color'
  type: 'text' | 'color' | 'file' | 'list'; // type of input
  defaultValue?: any;
}
