import { Customizations } from '../../../pages/preview/preview.component';

export interface ThemeStyleDto {
  id: number;
  themeName: string;
  cssContent: string;
  planType: string;
  businessType: string;
  businessTypes?: string[];
  isPremiumOnly?: boolean;
  customizations?: Customizations;
}

export interface ThemeStyleRequest {
  themeName: string;
  cssContent: string;
  planType: string;
  businessType: string;
  businessTypes?: string[];
  isPremiumOnly?: boolean;
  customizations?: Customizations;
}

// More specific interface for frontend use
export interface ThemeData {
  id: number;
  name: string;
  cssContent: string;
  businessType: string;
  businessTypes?: string[];
  isPremiumOnly?: boolean;
  customizations: Customizations;
}

// Types for theme filtering
export interface ThemeListItem {
  id: number;
  name: string;
  planType: 'standard' | 'premium';
  businessType: string;
  businessTypes?: string[];
  isPremiumOnly?: boolean;
}
