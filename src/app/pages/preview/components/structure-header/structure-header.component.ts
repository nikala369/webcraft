import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-structure-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './structure-header.component.html',
  styleUrls: ['./structure-header.component.scss']
})
export class StructureHeaderComponent implements OnInit {
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
   * The user-selected font family, passed from the parent
   * (e.g. "Roboto, sans-serif"). If none is provided, fallback to a default.
   */
  @Input() fontFamily = 'Arial, sans-serif';

  /** Signal for toggling the mobile menu overlay. */
  isMobileMenuOpen = signal(false);

  ngOnInit() {
    console.log('Header customizations:', this.customizations);
  }

  /** Toggle mobile menu visibility. */
  toggleMobileMenu() {
    this.isMobileMenuOpen.update(open => !open);
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

  private calculateRelativeLuminance(rgb: { r: number, g: number, b: number }): number {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private parseColorToRgb(colorStr: string): { r: number, g: number, b: number } | null {
    const color = colorStr.trim().toLowerCase();

    // Handle transparent backgrounds
    if (color === 'transparent') return null;

    // CSS named colors (extended list)
    const namedColors: { [key: string]: string } = {
      'white': '#ffffff',
      'black': '#000000',
      'red': '#ff0000',
      // Add other common named colors
    };

    // Check for named color first
    if (namedColors[color]) {
      colorStr = namedColors[color];
    }

    // Handle rgb(a) format
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (rgbMatch) {
      return {
        r: Math.min(255, parseInt(rgbMatch[1], 10)),
          g: Math.min(255, parseInt(rgbMatch[2], 10)),
        b: Math.min(255, parseInt(rgbMatch[3], 10))
    };
    }

    // Handle hex format
    const hexMatch = color.match(/^#?([a-f\d]{3,8})$/i);
    if (hexMatch) {
      let hex = hexMatch[1];
      // Expand shorthand
      if (hex.length === 3 || hex.length === 4) {
        hex = hex.split('').map(c => c + c).join('');
      }
      // Parse full hex
      if (hex.length === 6 || hex.length === 8) {
        const int = parseInt(hex, 16);
        return {
          r: (int >> 16) & 255,
          g: (int >> 8) & 255,
          b: int & 255
        };
      }
    }

    return null;
  }

}
