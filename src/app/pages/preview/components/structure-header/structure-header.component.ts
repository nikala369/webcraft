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
}
