import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnChanges,
  SimpleChanges,
  OnInit,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHoverWrapperComponent } from '../../../../components/section-hover-wrapper/section-hover-wrapper.component';
import { ThemeColorsService } from '../../../../../../core/services/theme/theme-colors.service';

// Interface definition should match the MenuCategory from menu-editor.component.ts
interface MenuItem {
  id?: string;
  name: string;
  description: string;
  price: string;
  image?: string;
  tags?: string[];
  featured?: boolean;
}

interface MenuCategory {
  id?: string;
  name: string;
  description?: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-menu-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  templateUrl: './menu-section.component.html',
  styleUrls: ['./menu-section.component.scss'],
})
export class MenuSectionComponent implements OnChanges, OnInit {
  @Input() customizations: any;
  @Input() wholeData: any;
  @Input() isMobileLayout: boolean = false;
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'restaurant';
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  private themeColorsService = inject(ThemeColorsService);
  private elementRef = inject(ElementRef);

  // Track when updates happen
  private lastUpdated = Date.now();

  // Default menu items for a restaurant
  private defaultMenuCategories: MenuCategory[] = [
    {
      id: 'cat1',
      name: 'Appetizers',
      description: 'Perfect starters to begin your culinary journey.',
      items: [
        {
          id: 'item1',
          name: 'Bruschetta',
          description:
            'Toasted bread topped with ripe tomatoes, fresh basil, and extra virgin olive oil.',
          price: '$8.99',
          tags: ['vegetarian'],
        },
        {
          id: 'item2',
          name: 'Calamari Fritti',
          description:
            'Crispy fried calamari served with lemon and marinara sauce.',
          price: '$12.99',
        },
      ],
    },
    {
      id: 'cat2',
      name: 'Main Courses',
      description: 'Signature dishes crafted with finest ingredients.',
      items: [
        {
          id: 'item3',
          name: 'Grilled Salmon',
          description:
            'Fresh salmon fillet grilled to perfection, served with seasonal vegetables and lemon butter sauce.',
          price: '$24.99',
          featured: true,
        },
        {
          id: 'item4',
          name: 'Pasta Carbonara',
          description:
            'Classic Italian pasta with pancetta, egg, black pepper, and Parmesan cheese.',
          price: '$18.99',
        },
      ],
    },
  ];

  // Plan-based limits (matching with menu-editor)
  get maxCategories(): number {
    return this.isPremium() ? 5 : 2; // Premium: 5, Standard: 2
  }

  get maxItemsPerCategory(): number {
    return this.isPremium() ? 15 : 8; // Premium: 15, Standard: 8
  }

  ngOnInit() {
    // Apply custom colors from configuration
    this.applyCustomColors();
    console.log(
      'MenuSectionComponent initialized with businessType:',
      this.businessType
    );
    console.log('Initial customizations:', this.customizations);
    console.log('Initial wholeData:', this.wholeData);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Track changes for debugging
    if (changes['customizations'] || changes['wholeData']) {
      this.lastUpdated = Date.now();
      console.log('Menu section received update at:', new Date().toISOString());

      if (changes['customizations']) {
        console.log(
          'New customizations for menu section:',
          this.customizations
        );
      }
      if (changes['wholeData']) {
        console.log('New wholeData for menu section:', this.wholeData);
      }
    }

    // Re-apply colors when customizations change
    this.applyCustomColors();
  }

  /**
   * Apply custom colors from configuration
   */
  private applyCustomColors(): void {
    const host = this.elementRef.nativeElement;
    const data = this.getSectionData();

    // Apply primary accent color
    const primaryColor = this.themeColorsService.getPrimaryColor(this.planType);
    host.style.setProperty('--primary-accent-color', primaryColor);

    // Apply section background color
    if (data?.backgroundColor) {
      host.style.setProperty('--section-bg-color', data.backgroundColor);
    }

    // Apply text color
    if (data?.textColor) {
      host.style.setProperty('--text-color', data.textColor);
      host.style.setProperty('--heading-color', data.textColor);
    }

    // Apply card background color
    if (data?.cardBackgroundColor) {
      host.style.setProperty('--card-bg-color', data.cardBackgroundColor);
    }

    // Apply accent color (overrides primary if specified)
    if (data?.accentColor) {
      host.style.setProperty('--primary-accent-color', data.accentColor);
    }
  }

  /**
   * Get menu section title or fallback
   */
  getMenuTitle(): string {
    const data = this.getSectionData();
    return data?.title || 'Our Menu';
  }

  /**
   * Get menu section subtitle or fallback
   */
  getMenuSubtitle(): string {
    const data = this.getSectionData();
    return (
      data?.subtitle ||
      'Enjoy our carefully crafted dishes made with the finest ingredients'
    );
  }

  /**
   * Get the menu section data using the same pattern as other sections
   */
  private getSectionData(): any {
    let data = null;
    console.log(
      'Searching for menu data in:',
      this.wholeData,
      this.customizations
    );

    // Check for data in different possible locations
    if (this.wholeData?.pages?.home?.menu) {
      console.log('Found menu data in wholeData.pages.home.menu');
      data = this.wholeData.pages.home.menu;
    } else if (this.customizations?.pages?.home?.menu) {
      console.log('Found menu data in customizations.pages.home.menu');
      data = this.customizations.pages.home.menu;
    } else {
      console.log('Using top-level customizations data');
      data = this.customizations;
    }

    // Log found data
    if (data?.categories) {
      console.log(
        `Found ${data.categories.length} menu categories:`,
        data.categories
      );
    } else {
      console.log('No menu data found, using defaults');
    }

    return data;
  }

  /**
   * Get menu categories or use defaults
   */
  getMenuCategories(): MenuCategory[] {
    const data = this.getSectionData();
    const categories = data?.categories;

    // Make sure we log what we're working with
    if (categories && categories.length > 0) {
      console.log(
        `Menu section returning ${categories.length} custom categories (updated: ${this.lastUpdated})`
      );
      return categories;
    } else {
      console.log('Menu section using default categories');
      return this.defaultMenuCategories;
    }
  }

  /**
   * Check if menu item has tags
   */
  hasTags(item: MenuItem): boolean {
    return !!item.tags && item.tags.length > 0;
  }

  /**
   * Get tag label for display
   */
  getTagLabel(tag: string): string {
    const tagLabels: Record<string, string> = {
      vegetarian: 'Vegetarian',
      vegan: 'Vegan',
      'gluten-free': 'Gluten Free',
      spicy: 'Spicy',
      new: 'New',
      popular: 'Popular',
    };

    return tagLabels[tag] || tag;
  }

  /**
   * Handle section selection
   */
  handleSectionSelection() {
    console.log('Menu section selected, emitting path: pages.home.menu');
    this.sectionSelected.emit({
      key: 'menu',
      name: 'Menu Section',
      path: 'pages.home.menu',
    });
  }

  /**
   * Get tag CSS class
   */
  getTagClass(tag: string): string {
    const tagClasses: Record<string, string> = {
      vegetarian: 'tag-vegetarian',
      vegan: 'tag-vegan',
      'gluten-free': 'tag-gluten-free',
      spicy: 'tag-spicy',
      new: 'tag-new',
      popular: 'tag-popular',
    };

    return tagClasses[tag] || 'tag-default';
  }

  /**
   * Premium plan features additional display options
   */
  isPremium(): boolean {
    return this.planType === 'premium';
  }

  /**
   * Check if an item is featured
   */
  isFeatured(item: MenuItem): boolean {
    return item.featured === true;
  }

  /**
   * Check if an item has an image
   */
  hasImage(item: MenuItem): boolean {
    return !!item.image;
  }
}
