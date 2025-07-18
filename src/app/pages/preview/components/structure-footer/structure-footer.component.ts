import {
  Component,
  Input,
  OnInit,
  OnChanges,
  HostBinding,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BUSINESS_TYPE_MENU_ITEMS } from '../../../../core/models/business-types';
import { ReactiveImageComponent } from '../../../../shared/components/reactive-image/reactive-image.component';
import { ImageService } from '../../../../core/services/shared/image/image.service';

@Component({
  selector: 'app-structure-footer',
  standalone: true,
  imports: [CommonModule, ReactiveImageComponent],
  templateUrl: './structure-footer.component.html',
  styleUrls: ['./structure-footer.component.scss'],
})
export class StructureFooterComponent implements OnInit, OnChanges {
  @Input() customizations: any = {};
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = '';
  @Input() isMobileLayout: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private imageService: ImageService
  ) {}

  // Add HostBindings for direct style updates
  @HostBinding('style.background-color') get backgroundColor() {
    return this.customizations?.backgroundColor || '#1a1a1a';
  }

  @HostBinding('style.color') get textColor() {
    return this.customizations?.textColor || '#ffffff';
  }

  // Set the navigation underline color CSS variable (Premium only)
  @HostBinding('style.--nav-underline-color') get navUnderlineColor() {
    // Only set if we're in premium plan and have the field
    if (this.planType === 'premium') {
      return (
        this.customizations?.navUnderlineColor ||
        this.customizations?.textColor ||
        '#ffffff'
      );
    }
    // For standard plan, use text color as fallback (though navigation won't be visible)
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

  // Force change detection when customizations change
  ngOnChanges(changes: any): void {
    if (changes.customizations) {
      console.log('Footer customizations changed:', this.customizations);

      // Re-initialize footer data when customizations change
      this.initializeFooterData();

      // Force change detection to update template
      this.cdr.detectChanges();
    }

    // Handle other input changes
    if (changes.businessType || changes.planType) {
      console.log(
        'Footer business type or plan changed:',
        this.businessType,
        this.planType
      );
      this.cdr.detectChanges();
    }
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
        return 'info@yourrestaurant.com';
      case 'salon':
        return 'hello@yoursalon.com';
      case 'architecture':
        return 'contact@yourarchitecture.com';
      case 'portfolio':
        return 'hello@yourportfolio.com';
      default:
        return 'info@yourbusiness.com';
    }
  }

  /**
   * Get image URL using ImageService to handle object IDs and regular URLs
   */
  getImageUrl(imageValue: string | undefined): string {
    if (!imageValue) {
      return '/assets/standard-footer/default-logo.svg'; // Default footer logo
    }

    // Handle temporary blob URLs (during editing)
    if (imageValue.startsWith('temp:')) {
      return imageValue.substring(5); // Remove 'temp:' prefix
    }

    // Use ImageService to process object IDs and regular URLs
    return this.imageService.getImageUrl(imageValue);
  }
}
