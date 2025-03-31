import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'tiktok';
  url: string;
}

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

  // Add HostBindings for direct style updates
  @HostBinding('style.background-color') get backgroundColor() {
    return this.customizations?.backgroundColor || '#1a1a1a';
  }

  @HostBinding('style.color') get textColor() {
    return this.customizations?.textColor || '#ffffff';
  }

  currentYear = new Date().getFullYear();

  // Default menu items if none are provided in customizations
  defaultMenuItems = [
    { id: 1, label: 'Home', link: '/' },
    { id: 2, label: 'About', link: '/about' },
    { id: 3, label: 'Services', link: '/services' },
    { id: 4, label: 'Contact', link: '/contact' },
  ];

  // Default social media URLs based on business type
  private defaultSocialUrls: Record<string, Record<string, string>> = {
    restaurant: {
      facebook: 'https://facebook.com/',
      instagram: 'https://instagram.com/',
      tiktok: 'https://tiktok.com/',
    },
    salon: {
      facebook: 'https://facebook.com/',
      instagram: 'https://instagram.com/',
      tiktok: 'https://tiktok.com/',
    },
    architecture: {
      facebook: 'https://facebook.com/',
      instagram: 'https://instagram.com/',
      tiktok: 'https://tiktok.com/',
    },
    portfolio: {
      facebook: 'https://facebook.com/',
      instagram: 'https://instagram.com/',
      tiktok: 'https://tiktok.com/',
    },
  };

  ngOnInit(): void {
    this.initializeFooterData();
  }

  /**
   * Initialize footer data with proper defaults
   */
  private initializeFooterData(): void {
    // If we don't have any menu items in customizations, use the defaults
    if (!this.customizations) {
      this.customizations = {};
    }

    // Set default menu items if not provided
    if (
      !this.customizations.menuItems ||
      this.customizations.menuItems.length === 0
    ) {
      this.customizations.menuItems = this.defaultMenuItems;
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
   * Get URL for a specific social media platform
   * @param platform The social media platform
   * @returns The URL for the platform
   */
  getSocialUrl(platform: string): string {
    // Always return the customized URL if it exists
    if (this.customizations?.socialUrls?.[platform]) {
      return this.customizations.socialUrls[platform];
    }

    // Otherwise return default for business type
    const businessDefaults =
      this.defaultSocialUrls[
        this.businessType as keyof typeof this.defaultSocialUrls
      ] || this.defaultSocialUrls['restaurant'];

    return businessDefaults[platform] || 'https://example.com/';
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
   * Get default address based on business type
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
        return 'Based in Creative District, Design City';
      default:
        return '123 Business Ave, City';
    }
  }

  /**
   * Get default phone based on business type
   */
  getDefaultPhone(): string {
    return '(555) 123-4567';
  }

  /**
   * Get default email based on business type
   */
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
   * Determine if address should be shown
   * Portfolio businesses typically don't need an address
   */
  shouldShowAddress(): boolean {
    // Always show if it's explicitly set in customizations
    if (this.customizations?.address) {
      return true;
    }

    // For portfolio business type, don't show address by default
    if (this.businessType === 'portfolio') {
      return false;
    }

    // For all other business types, show address
    return true;
  }
}
