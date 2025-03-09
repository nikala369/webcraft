import { Customizations } from '../../../pages/preview/preview.component';

export interface ThemeStyleDto {
  id: number;
  themeName: string;
  cssContent: string;
  planType: string;
  customizations?: Customizations;
}

export interface ThemeStyleRequest {
  themeName: string;
  cssContent: string;
  planType: string;
  customizations?: Customizations;
}

// More specific interface for frontend use
export interface ThemeData {
  id: number;
  name: string;
  cssContent: string;
  customizations: Customizations;
}

// Types for theme filtering
export interface ThemeListItem {
  id: number;
  name: string;
  planType: 'standard' | 'premium';
}
