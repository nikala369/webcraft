import {
  Component,
  Input,
  OnInit,
  OnChanges,
  signal,
  Output,
  EventEmitter,
  OnDestroy,
  HostBinding,
  ElementRef,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BUSINESS_TYPE_MENU_ITEMS } from '../../../../core/models/business-types';
import { ReactiveImageComponent } from '../../../../shared/components/reactive-image/reactive-image.component';
import { ImageService } from '../../../../core/services/shared/image/image.service';

@Component({
  selector: 'app-structure-header',
  standalone: true,
  imports: [CommonModule, ReactiveImageComponent],
  templateUrl: './structure-header.component.html',
  styleUrls: ['./structure-header.component.scss'],
})
export class StructureHeaderComponent implements OnInit, OnChanges, OnDestroy {
  /**
   * Holds background color, text color, logoUrl, and menuItems
   * e.g. { backgroundColor, text, logoUrl, menuItems: [ { id, label, link } ] }
   */
  @Input() customizations: any = {};

  // Force change detection when customizations change
  ngOnChanges(changes: any): void {
    if (changes.customizations) {
      console.log('Header customizations changed:', this.customizations);

      // Re-initialize header data when customizations change
      this.initializeHeaderData();

      // Force change detection to update template
      this.cdr.detectChanges();

      // CRITICAL FIX: Force re-evaluation of header styles
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    }

    // Handle other input changes
    if (changes.businessType || changes.plan || changes.activeSection) {
      console.log(
        'Header business type, plan, or active section changed:',
        this.businessType,
        this.plan,
        this.activeSection
      );
      this.cdr.detectChanges();
    }
  }

  /**
   * Initialize header data when customizations change
   */
  private initializeHeaderData(): void {
    // Ensure standard plan has exactly 4 menu items when customizations change
    if (
      this.plan === 'standard' &&
      (!this.customizations?.menuItems ||
        this.customizations.menuItems.length !== 4)
    ) {
      // Apply default menu items if not set correctly
      if (!this.customizations) {
        this.customizations = {};
      }

      // Use business type menu items if available, otherwise use standard default
      if (
        this.businessType &&
        BUSINESS_TYPE_MENU_ITEMS[
          this.businessType as keyof typeof BUSINESS_TYPE_MENU_ITEMS
        ]?.standard
      ) {
        this.customizations.menuItems =
          BUSINESS_TYPE_MENU_ITEMS[
            this.businessType as keyof typeof BUSINESS_TYPE_MENU_ITEMS
          ].standard;
      } else {
        this.customizations.menuItems = this.standardMenuItems;
      }
    }
  }

  /**
   * Get image URL using ImageService to handle object IDs and regular URLs
   */
  getImageUrl(imageValue: string | undefined): string {
    if (!imageValue) {
      return '/assets/standard-header/default-logo.svg'; // Default logo
    }

    // Handle temporary blob URLs (during editing)
    if (imageValue.startsWith('temp:')) {
      return imageValue.substring(5); // Remove 'temp:' prefix
    }

    // Use ImageService to process object IDs and regular URLs
    return this.imageService.getImageUrl(imageValue);
  }

  /**
   * Determines if the layout should be displayed in mobile mode
   * (passed from the parent if the user toggles mobile view or if the device is small).
   */
  @Input() isMobileLayout = false;

  /**
   * The current page being displayed
   */
  @Input() currentPage: string = 'home';

  /**
   * The current plan - standard or premium
   */
  @Input() plan: string = 'standard';

  /**
   * The business type (restaurant, salon, etc.)
   */
  @Input() businessType: string = '';

  /**
   * The currently active section (for Standard plan)
   */
  @Input() activeSection: string = 'hero';

  /**
   * The user-selected font family, passed from the parent
   * (e.g. "Roboto, sans-serif"). If none is provided, fallback to a default.
   */
  @Input() fontFamily = 'Arial, sans-serif';

  /**
   * Event emitter for page navigation
   */
  @Output() pageChange = new EventEmitter<string>();

  /**
   * Event emitter for section navigation (for standard plan)
   */
  @Output() sectionScroll = new EventEmitter<string>();

  /** Signal for toggling the mobile menu overlay. */
  isMobileMenuOpen = signal(false);

  // Default standard menu items - now 4 items including About
  private standardMenuItems = [
    { id: 1, label: 'Home', link: '#hero' },
    { id: 2, label: 'About', link: '#about' },
    { id: 3, label: 'Services', link: '#services' },
    { id: 4, label: 'Contact', link: '#contact' },
  ];

  // Inject the Router and ActivatedRoute
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private elementRef: ElementRef,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private imageService: ImageService
  ) {}

  ngOnInit() {
    console.log('Header customizations:', this.customizations);
    console.log('Current page:', this.currentPage);
    console.log('Current plan:', this.plan);
    console.log('Business type:', this.businessType);
    console.log('Active section:', this.activeSection);

    // Initialize header data
    this.initializeHeaderData();
  }

  ngOnDestroy() {
    // Cleanup code if needed
  }

  // Get the currently displayed menu items
  getMenuItems() {
    // If business type is set, try to use predefined menu items for the plan
    if (this.businessType && this.plan) {
      try {
        const businessTypeMenuItems =
          BUSINESS_TYPE_MENU_ITEMS[
            this.businessType as keyof typeof BUSINESS_TYPE_MENU_ITEMS
          ]?.[this.plan as 'standard' | 'premium'];

        if (businessTypeMenuItems) {
          return businessTypeMenuItems;
        }
      } catch (error) {
        console.error('Error getting business type menu items:', error);
      }
    }

    // Fallback to standard logic
    if (this.plan === 'standard') {
      // Always ensure exactly 4 menu items for standard plan
      if (
        !this.customizations?.menuItems ||
        this.customizations.menuItems.length !== 4
      ) {
        return this.standardMenuItems;
      }

      // Map the menu items to ensure they use hash links
      return this.customizations.menuItems.map((item: any, index: number) => {
        // Extract label from existing item or use default
        const label = item.label || this.standardMenuItems[index % 4].label;

        // For standard plan, ensure links are hash-based for section scrolling
        const link = item.link || this.standardMenuItems[index % 4].link;

        return { id: item.id || index + 1, label, link };
      });
    }

    // For premium plan, return customizations or empty array
    return this.customizations?.menuItems || [];
  }

  // Handle navigation based on plan type
  navigateTo(path: string): void {
    console.log('Header navigateTo called with path:', path);

    // Close mobile menu if open
    if (this.isMobileMenuOpen()) {
      this.toggleMobileMenu();
    }

    if (this.plan === 'standard') {
      // For standard plan, handle section-based navigation
      if (path.startsWith('#')) {
        const sectionId = path.substring(1); // Remove the # character
        console.log('Emitting section scroll event for:', sectionId);
        this.sectionScroll.emit(sectionId);
      } else {
        // Handle any non-hash links (e.g., external links)
        if (path.startsWith('http')) {
          window.open(path, '_blank');
          return;
        }
      }
    } else {
      // For premium plan, handle page-based navigation
      let pageName = path === '/' ? 'home' : path.replace(/^\//, '');

      // Handle external links
      if (pageName.startsWith('http')) {
        window.open(pageName, '_blank');
        return;
      }

      console.log('Emitting page change event with pageName:', pageName);
      this.pageChange.emit(pageName);
    }
  }

  // Toggle mobile menu
  toggleMobileMenu() {
    this.isMobileMenuOpen.update((open) => !open);
    console.log('Mobile menu toggled:', this.isMobileMenuOpen());
  }

  /**
   * Handle clicks on the mobile menu backdrop
   */
  onMobileMenuClick(event: Event): void {
    // If clicking on the backdrop (not the menu content), close the menu
    if (event.target === event.currentTarget) {
      this.isMobileMenuOpen.set(false);
    }
  }

  // Check if a menu item is active
  isActive(link: string): boolean {
    if (this.plan === 'standard') {
      // For standard plan, check if the link corresponds to the active section
      if (link.startsWith('#')) {
        const sectionId = link.substring(1);
        return this.activeSection === sectionId;
      }
      return false;
    } else {
      // For premium plan, check current page
      const pageName = link === '/' ? 'home' : link.replace(/^\//, '');
      return this.currentPage === pageName;
    }
  }

  /**
   * Get mobile menu styles - inherit exact same colors as desktop header
   */
  getMobileMenuStyles(): any {
    const styles: any = {};

    // Get the exact same values as desktop header
    const backgroundColor = this.customizations?.backgroundColor || '#2876FF';
    const textColor = this.customizations?.textColor || '#ffffff';
    const backgroundType = this.customizations?.headerBackgroundType;

    // Handle background styling exactly like desktop
    if (
      backgroundType &&
      backgroundType !== 'solid' &&
      backgroundType !== 'none'
    ) {
      // Use gradient - same as desktop
      const gradientValue = this.getGradientValue(backgroundType);
      if (gradientValue) {
        styles.background = gradientValue;
      } else {
        styles.backgroundColor = backgroundColor;
      }
    } else {
      // Use solid background color - exact same as desktop
      styles.backgroundColor = backgroundColor;
    }

    // Use exact same text color as desktop
    styles.color = textColor;
    styles.fontFamily = this.fontFamily;

    // No backdrop blur to ensure color matches desktop

    // Ensure visibility
    styles.minHeight = '200px';
    styles.display = 'block';

    return styles;
  }

  /**
   * Get header styles including background colors and gradients
   * Also sets CSS variables for mobile menu inheritance
   */
  getHeaderStyles(): any {
    const styles: any = {};

    // Get the colors to use
    const backgroundColor = this.customizations?.backgroundColor || '#2876FF';
    const textColor = this.customizations?.textColor || '#ffffff';

    // Set CSS variables for mobile menu inheritance
    styles['--header-bg-color'] = backgroundColor;
    styles['--header-text-color'] = textColor;

    // Handle background styling
    const backgroundType = this.customizations?.headerBackgroundType;

    if (
      backgroundType &&
      backgroundType !== 'solid' &&
      backgroundType !== 'none'
    ) {
      // Use gradient
      const gradientValue = this.getGradientValue(backgroundType);
      if (gradientValue) {
        styles.background = gradientValue;
        // Also set the gradient as the CSS variable for mobile menu
        styles['--header-bg-color'] = gradientValue;
      }
    } else {
      // Use solid background color
      styles.backgroundColor = backgroundColor;
    }

    return styles;
  }

  /**
   * Get the CSS gradient value for preset gradients or custom gradients
   */
  private getGradientValue(gradientType: string): string | null {
    const gradientPresets: { [key: string]: string } = {
      sunset: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      ocean: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
      forest: 'linear-gradient(45deg, #11998e 0%, #38ef7d 100%)',
      royal: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
      fire: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
      midnight: 'linear-gradient(45deg, #0c3483 0%, #a2b6df 100%)',
    };

    if (gradientType === 'custom') {
      // Create custom gradient from color picker values and angle
      const color1 = this.customizations?.customGradientColor1 || '#667eea';
      const color2 = this.customizations?.customGradientColor2 || '#764ba2';
      const angle = this.customizations?.customGradientAngle || 45;
      return `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;
    }

    return gradientPresets[gradientType] || null;
  }

  getHamburgerIconColor(): string {
    // 1. Get background color from correct path
    const rawColor = this.customizations?.backgroundColor || '#ffffff';

    // 2. Parse to RGB with improved validation
    const rgb = this.parseColorToRgb(rawColor) || { r: 255, g: 255, b: 255 };

    // 3. Calculate contrast using WCAG formula
    const luminance = this.calculateRelativeLuminance(rgb);

    // 4. Return optimal contrast color
    return luminance > 0.179 ? '#000000' : '#ffffff';
  }

  private calculateRelativeLuminance(rgb: {
    r: number;
    g: number;
    b: number;
  }): number {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private parseColorToRgb(
    colorStr: string
  ): { r: number; g: number; b: number } | null {
    const color = colorStr.trim().toLowerCase();

    // Handle transparent backgrounds
    if (color === 'transparent') return null;

    // CSS named colors (extended list)
    const namedColors: { [key: string]: string } = {
      white: '#ffffff',
      black: '#000000',
      red: '#ff0000',
      // Add other common named colors
    };

    // Check for named color first
    if (namedColors[color]) {
      colorStr = namedColors[color];
    }

    // Handle rgb(a) format
    const rgbMatch = color.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/
    );
    if (rgbMatch) {
      return {
        r: Math.min(255, parseInt(rgbMatch[1], 10)),
        g: Math.min(255, parseInt(rgbMatch[2], 10)),
        b: Math.min(255, parseInt(rgbMatch[3], 10)),
      };
    }

    // Handle hex format
    const hexMatch = color.match(/^#?([a-f\d]{3,8})$/i);
    if (hexMatch) {
      let hex = hexMatch[1];
      // Expand shorthand
      if (hex.length === 3 || hex.length === 4) {
        hex = hex
          .split('')
          .map((c) => c + c)
          .join('');
      }
      // Parse full hex
      if (hex.length === 6 || hex.length === 8) {
        const int = parseInt(hex, 16);
        return {
          r: (int >> 16) & 255,
          g: (int >> 8) & 255,
          b: int & 255,
        };
      }
    }

    return null;
  }

  /**
   * Handle logo loading errors by showing fallback
   */
  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && img.src !== '/assets/standard-header/default-logo-white.svg') {
      console.warn('Logo failed to load, using fallback');
      img.src = '/assets/standard-header/default-logo-white.svg';
    }
  }

  /**
   * Handle successful logo loading
   */
  onLogoLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      // Add loaded class for any additional styling
      img.classList.add('logo-loaded');
    }
  }
}
