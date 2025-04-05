import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnChanges,
  SimpleChanges,
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
export class MenuSectionComponent implements OnChanges {
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customizations'] || changes['wholeData']) {
      console.log(
        'Menu section received updated customizations:',
        this.customizations
      );
      console.log('Menu section received updated wholeData:', this.wholeData);
      this.lastUpdated = Date.now();
    }
  }

  /**
   * Get menu section title or fallback
   */
  getMenuTitle(): string {
    return this.getSectionData()?.title || 'Our Menu';
  }

  /**
   * Get menu section subtitle or fallback
   */
  getMenuSubtitle(): string {
    return (
      this.getSectionData()?.subtitle ||
      'Enjoy our carefully crafted dishes made with the finest ingredients'
    );
  }

  /**
   * Get the menu section data using the same pattern as other sections
   */
  private getSectionData(): any {
    // Check for data in the correct hierarchy
    const data =
      this.wholeData?.pages?.home?.menu ||
      this.customizations?.pages?.home?.menu ||
      this.customizations;

    console.log('getSectionData returning:', data);
    return data;
  }

  /**
   * Get menu categories or use defaults
   */
  getMenuCategories(): MenuCategory[] {
    const categories = this.getSectionData()?.categories;

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
