import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BUSINESS_TYPE_MENU_ITEMS } from '../../../../core/models/business-types';

@Component({
  selector: 'app-structure-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './structure-footer.component.html',
  styleUrls: ['./structure-footer.component.scss'],
})
export class StructureFooterComponent implements OnInit {
  @Input() customizations: any = {};
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = '';
  @Input() isMobileLayout: boolean = false;

  // Add HostBindings for direct style updates
  @HostBinding('style.background-color') get backgroundColor() {
    return this.customizations?.backgroundColor || '#1a1a1a';
  }

  @HostBinding('style.color') get textColor() {
    return this.customizations?.textColor || '#ffffff';
  }

  currentYear = new Date().getFullYear();

  // Standard social platforms (3 main ones)
  standardSocialPlatforms = ['facebook', 'instagram', 'tiktok'];

  // Premium social platforms (6 total)
  premiumSocialPlatforms = [
    'facebook',
    'instagram',
    'tiktok',
    'linkedin',
    'youtube',
    'twitter',
  ];

  ngOnInit(): void {
    this.initializeFooterData();
  }

  /**
   * Initialize footer data with proper defaults
   */
  private initializeFooterData(): void {
    if (!this.customizations) {
      this.customizations = {};
    }

    // Initialize social media URLs as an empty object if not present
    if (!this.customizations.socialUrls) {
      this.customizations.socialUrls = {};
    }
  }

  /**
   * Get navigation items based on business type (Premium only)
   */
  getNavigationItems(): Array<{ id: number; label: string; link: string }> {
    if (this.planType !== 'premium') {
      return [];
    }

    // Get business-type specific navigation items
    if (
      this.businessType &&
      BUSINESS_TYPE_MENU_ITEMS[
        this.businessType as keyof typeof BUSINESS_TYPE_MENU_ITEMS
      ]
    ) {
      const businessMenuItems =
        BUSINESS_TYPE_MENU_ITEMS[
          this.businessType as keyof typeof BUSINESS_TYPE_MENU_ITEMS
        ];
      return businessMenuItems.premium || businessMenuItems.standard || [];
    }

    // Default premium navigation items
    return [
      { id: 1, label: 'Home', link: '/' },
      { id: 2, label: 'About', link: '/about' },
      { id: 3, label: 'Services', link: '/services' },
      { id: 4, label: 'Contact', link: '/contact' },
    ];
  }

  /**
   * Get available social platforms based on plan
   */
  getSocialPlatforms(): string[] {
    return this.planType === 'premium'
      ? this.premiumSocialPlatforms
      : this.standardSocialPlatforms;
  }

  /**
   * Get only the social platforms that have valid URLs (for dynamic display)
   */
  getActiveSocialPlatforms(): string[] {
    const availablePlatforms = this.getSocialPlatforms();
    return availablePlatforms.filter((platform) => this.hasSocialUrl(platform));
  }

  /**
   * Get URL for a specific social media platform
   */
  getSocialUrl(platform: string): string {
    // Check nested socialUrls object first
    if (this.customizations?.socialUrls?.[platform]) {
      return this.customizations.socialUrls[platform];
    }

    // Check flat structure (from customizer)
    const flatKey = `socialUrls.${platform}`;
    if (this.customizations?.[flatKey]) {
      return this.customizations[flatKey];
    }

    // Return empty string instead of '#' to show as disabled
    return '';
  }

  /**
   * Check if social platform has a valid URL
   */
  hasSocialUrl(platform: string): boolean {
    const url = this.getSocialUrl(platform);
    if (!url || url.trim() === '' || url === '#') {
      return false;
    }

    // Check if it's a default/placeholder URL (exact matches only)
    const defaultUrls = [
      'https://facebook.com/',
      'https://instagram.com/',
      'https://tiktok.com/',
      'https://linkedin.com/',
      'https://youtube.com/',
      'https://twitter.com/',
    ];

    // If it's an exact match to a default URL, consider it invalid
    if (defaultUrls.includes(url.trim())) {
      return false;
    }

    // If it contains the platform domain and has additional path, it's valid
    const platformDomains = {
      facebook: 'facebook.com',
      instagram: 'instagram.com',
      tiktok: 'tiktok.com',
      linkedin: 'linkedin.com',
      youtube: 'youtube.com',
      twitter: 'twitter.com',
    };

    const domain = platformDomains[platform as keyof typeof platformDomains];
    if (domain && url.includes(domain)) {
      return true;
    }

    // For any other URL format, consider it valid if it looks like a URL
    return url.startsWith('http://') || url.startsWith('https://');
  }

  /**
   * Generate a company name based on business type
   */
  getCompanyName(): string {
    switch (this.businessType) {
      case 'restaurant':
        return 'Fine Dining';
      case 'salon':
        return 'Beauty Studio';
      case 'architecture':
        return 'Design Works';
      case 'portfolio':
        return 'Creative Portfolio';
      default:
        return 'Your Business';
    }
  }

  /**
   * Get default tagline based on business type
   */
  getDefaultTagline(): string {
    switch (this.businessType) {
      case 'restaurant':
        return 'Exceptional cuisine and dining experience';
      case 'salon':
        return 'Where beauty meets expertise';
      case 'architecture':
        return 'Creating spaces that inspire';
      case 'portfolio':
        return 'Crafting visual stories';
      default:
        return 'Professional solutions tailored to your needs';
    }
  }

  /**
   * Get default contact info based on business type
   */
  getDefaultAddress(): string {
    switch (this.businessType) {
      case 'restaurant':
        return '123 Culinary Ave, Gourmet City';
      case 'salon':
        return '456 Style Street, Beauty Town';
      case 'architecture':
        return '789 Design Blvd, Creative City';
      case 'portfolio':
        return 'Based in Creative District';
      default:
        return '123 Business Ave, City';
    }
  }

  getDefaultPhone(): string {
    return '(555) 123-4567';
  }

  getDefaultEmail(): string {
    switch (this.businessType) {
      case 'restaurant':
        return 'info@finedining.com';
      case 'salon':
        return 'hello@beautystudio.com';
      case 'architecture':
        return 'projects@designworks.com';
      case 'portfolio':
        return 'contact@creativeportfolio.com';
      default:
        return 'info@yourbusiness.com';
    }
  }
}
