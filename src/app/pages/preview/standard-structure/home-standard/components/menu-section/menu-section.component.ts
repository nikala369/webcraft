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
  Signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHoverWrapperComponent } from '../../../../components/section-hover-wrapper/section-hover-wrapper.component';
import { ThemeColorsService } from '../../../../../../core/services/theme/theme-colors.service';
import { ImageService } from '../../../../../../core/services/shared/image/image.service';
import { ReactiveImageComponent } from '../../../../../../shared/components/reactive-image/reactive-image.component';

// Interface definition should match the MenuCategory from menu-editor.component.ts
interface MenuItem {
  id?: string;
  name: string;
  description: string;
  price: string;
  imageUrl?: string; // Updated to match menu editor
  tags?: string[];
  featured?: boolean;
}

interface MenuCategory {
  id?: string;
  name: string;
  description?: string;
  imageUrl?: string; // Updated to match menu editor
  items: MenuItem[];
}

@Component({
  selector: 'app-menu-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent, ReactiveImageComponent],
  templateUrl: './menu-section.component.html',
  styleUrls: ['./menu-section.component.scss'],
})
export class MenuSectionComponent implements OnChanges, OnInit {
  @Input({ required: true }) data!: Signal<any>;
  @Input() isMobileLayout: boolean = false;
  @Input() isMobileView: string = 'view-desktop';
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'restaurant';
  @Input() editable: boolean = true;
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  // Maximum menu limits that match the menu editor
  readonly maxCategories = 3; // Standard plan limit
  readonly maxItemsPerCategory = 12; // Standard plan limit

  private themeColorsService = inject(ThemeColorsService);
  private elementRef = inject(ElementRef);
  private imageService = inject(ImageService);

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

  // ARCHITECTURE FIX: Convert getMenuCategories() to computed signal
  // This eliminates the race condition by ensuring rendering logic only executes
  // after data dependencies have changed and stabilized
  menuCategories = computed(() => {
    const data = this.data();

    // Primary: Check if categories are directly available in data
    if (
      data?.categories &&
      Array.isArray(data.categories) &&
      data.categories.length > 0
    ) {
      return data.categories;
    }

    // Secondary: Check if categories are nested under menu property
    if (
      data?.menu?.categories &&
      Array.isArray(data.menu.categories) &&
      data.menu.categories.length > 0
    ) {
      return data.menu.categories;
    }

    // Fallback: Use default categories
    return this.defaultMenuCategories;
  });

  ngOnInit() {
    // Debug logging
    const data = this.data();
    console.log('[MenuSection] Component initialized with data:', {
      data,
      dataType: typeof data,
      isArray: Array.isArray(data),
      dataKeys: data ? Object.keys(data) : [],
      hasCategories: !!data?.categories,
      categoriesCount: data?.categories?.length || 0,
      firstCategory: data?.categories?.[0],
      // Check for nested menu structure
      hasMenuProperty: !!data?.menu,
      menuCategories: data?.menu?.categories,
      menuCategoriesCount: data?.menu?.categories?.length || 0,
      // Raw data inspection
      rawData: JSON.stringify(data, null, 2),
    });

    // Log the categories result
    const categories = this.menuCategories();
    console.log(
      '[MenuSection] Categories result from menuCategories computed:',
      {
        categories,
        categoriesCount: categories.length,
        isDefault: categories === this.defaultMenuCategories,
        firstCategoryName: categories[0]?.name,
        firstCategoryItems: categories[0]?.items?.length || 0,
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Track changes for debugging
    if (changes['data']) {
      this.lastUpdated = Date.now();
      console.log('Menu section received update at:', new Date().toISOString());
      console.log('New menu data:', this.data());
    }

    // Re-apply colors when data change
    this.applyCustomColors();
  }

  /**
   * Apply custom colors from configuration
   */
  private applyCustomColors(): void {
    const host = this.elementRef.nativeElement;
    const data = this.data();

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
    const data = this.data();
    return data?.title || 'Our Menu';
  }

  /**
   * Get menu section subtitle or fallback
   */
  getMenuSubtitle(): string {
    const data = this.data();
    return (
      data?.subtitle ||
      'Enjoy our carefully crafted dishes made with the finest ingredients'
    );
  }

  /**
   * Get the menu section data using the same pattern as other sections
   */
  private getSectionData(): any {
    return this.data();
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
   * Check if menu item has an image
   */
  hasImage(item: MenuItem): boolean {
    return !!item.imageUrl && item.imageUrl.trim() !== '';
  }

  /**
   * Get image URL for menu items and categories
   * @param imageUrl The image URL from the menu item or category
   * @returns The processed image URL
   */
  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) {
      return '/assets/placeholder-menu-item.jpg'; // Default placeholder
    }

    // Handle temporary blob URLs (during editing)
    if (imageUrl.startsWith('temp:')) {
      return imageUrl.substring(5); // Remove 'temp:' prefix
    }

    // Handle backend object IDs
    if (imageUrl.match(/^[a-f\d]{24}$/i)) {
      return this.imageService.getImageUrl(imageUrl);
    }

    // Handle regular URLs
    return imageUrl;
  }

  /**
   * Get computed value or default
   */
  private getValue(key: string, defaultValue: any): any {
    return this.data()?.[key] || defaultValue;
  }

  /**
   * Check if menu data is fully loaded and ready to display
   * FIXED: Always return true since menuCategories computed signal handles fallback to defaults
   */
  isDataLoaded(): boolean {
    // Since our menuCategories computed signal always provides valid data
    // (either from the actual data or from defaults), we should always
    // consider the data "loaded" and ready to display
    return true;
  }

  handleSectionEdit(sectionId: string) {
    // Emit the section selected event to open the customizer
    this.sectionSelected.emit({
      key: 'menu',
      name: 'Menu Section',
      path: 'pages.home.menu',
    });
  }
}
