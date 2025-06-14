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

    // Ensure social links are shown by default unless explicitly set to false
    if (this.customizations.showSocialLinks === undefined) {
      this.customizations.showSocialLinks = true;
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

  /**
   * Get SVG icon for social platform
   */
  getSocialIcon(platform: string): string {
    const icons: { [key: string]: string } = {
      facebook: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/>
      </svg>`,
      instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.181-.8.398-1.15.748-.35.35-.566.684-.747 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.04 0 2.67.01 2.986.058 4.04.045.976.207 1.505.344 1.858.181.466.398.8.748 1.15.35.35.683.566 1.15.747.352.137.881.3 1.857.344 1.054.048 1.37.058 4.04.058 2.67 0 2.986-.01 4.04-.058.976-.045 1.505-.207 1.858-.344.466-.181.8-.398 1.15-.748.35-.35.566-.683.747-1.15.137-.352.3-.881.344-1.857.048-1.054.058-1.37.058-4.04 0-2.67-.01-2.986-.058-4.04-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.747c-.352-.137-.881-.3-1.857-.344-1.054-.048-1.37-.058-4.04-.058zm0 3.063a5.135 5.135 0 1 1 0 10.27 5.135 5.135 0 0 1 0-10.27zm0 8.468a3.333 3.333 0 1 0 0-6.666 3.333 3.333 0 0 0 0 6.666zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z"/>
      </svg>`,
      tiktok: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>`,
      linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>`,
      youtube: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>`,
      twitter: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>`,
    };
    return icons[platform] || '';
  }
}
