import {
  Component,
  Input,
  OnInit,
  signal,
  Output,
  EventEmitter,
  OnDestroy,
  HostBinding,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BUSINESS_TYPE_MENU_ITEMS } from '../../../../core/models/business-types';

@Component({
  selector: 'app-structure-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './structure-header.component.html',
  styleUrls: ['./structure-header.component.scss'],
})
export class StructureHeaderComponent implements OnInit, OnDestroy {
  /**
   * Holds background color, text color, logoUrl, and menuItems
   * e.g. { backgroundColor, text, logoUrl, menuItems: [ { id, label, link } ] }
   */
  @Input() customizations: any = {};

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

  // Smart hide functionality
  private lastScrollTop = 0;
  private scrollThreshold = 5;
  private headerHeight = 80;

  @HostBinding('class.hidden') isHidden = false;
  @HostBinding('class.scrolled') isScrolled = false;

  // Default standard menu items - now 4 items including About
  private standardMenuItems = [
    { id: 1, label: 'Home', link: '#hero' },
    { id: 2, label: 'About', link: '#about' },
    { id: 3, label: 'Services', link: '#services' },
    { id: 4, label: 'Contact', link: '#contact' },
  ];

  // Scroll event listener
  private scrollListener?: () => void;

  // Inject the Router and ActivatedRoute
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    console.log('Header customizations:', this.customizations);
    console.log('Current page:', this.currentPage);
    console.log('Current plan:', this.plan);
    console.log('Business type:', this.businessType);
    console.log('Active section:', this.activeSection);

    // Ensure standard plan has exactly 4 menu items
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

    // Initialize smart hide functionality for premium plans
    if (this.plan === 'premium' && this.getHeaderPosition() === 'smart-hide') {
      this.initializeSmartHide();
    }
  }

  ngOnDestroy() {
    // Clean up scroll listener
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  // Initialize smart hide functionality
  private initializeSmartHide() {
    if (typeof window === 'undefined') return;

    this.scrollListener = () => {
      const currentScrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      // Add scrolled class when not at top
      this.isScrolled = currentScrollTop > 10;

      // Don't hide/show if scroll difference is too small
      if (
        Math.abs(currentScrollTop - this.lastScrollTop) <= this.scrollThreshold
      ) {
        return;
      }

      // Hide header when scrolling down, show when scrolling up
      if (
        currentScrollTop > this.lastScrollTop &&
        currentScrollTop > this.headerHeight
      ) {
        // Scrolling down
        this.isHidden = true;
      } else {
        // Scrolling up
        this.isHidden = false;
      }

      this.lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
    };

    // Add scroll listener with passive option for better performance
    window.addEventListener('scroll', this.scrollListener, { passive: true });
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

  /** Toggle mobile menu visibility. */
  toggleMobileMenu() {
    this.isMobileMenuOpen.update((open) => !open);
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

  // Get the header position from customizations
  getHeaderPosition(): string {
    // Default to relative if not set
    return this.customizations?.stickyHeader || 'relative';
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
}
