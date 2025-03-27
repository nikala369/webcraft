import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHoverWrapperComponent } from '../../../../components/section-hover-wrapper/section-hover-wrapper.component';
import { ThemeColorsService } from '../../../../../../core/services/theme/theme-colors.service';

interface MenuItem {
  name: string;
  description: string;
  price: string;
  image?: string;
  tags?: string[];
  featured?: boolean;
}

interface MenuCategory {
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
export class MenuSectionComponent {
  @Input() customizations: any;
  @Input() isMobileLayout: boolean = false;
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'restaurant';
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  private themeColorsService = inject(ThemeColorsService);

  // Default menu items for a restaurant
  private defaultMenuCategories: MenuCategory[] = [
    {
      name: 'Appetizers',
      description: 'Perfect starters to begin your culinary journey.',
      items: [
        {
          name: 'Bruschetta',
          description:
            'Toasted bread topped with ripe tomatoes, fresh basil, and extra virgin olive oil.',
          price: '$8.99',
          tags: ['vegetarian'],
        },
        {
          name: 'Calamari Fritti',
          description:
            'Crispy fried calamari served with lemon and marinara sauce.',
          price: '$12.99',
        },
      ],
    },
    {
      name: 'Main Courses',
      description: 'Signature dishes crafted with finest ingredients.',
      items: [
        {
          name: 'Grilled Salmon',
          description:
            'Fresh salmon fillet grilled to perfection, served with seasonal vegetables and lemon butter sauce.',
          price: '$24.99',
          featured: true,
        },
        {
          name: 'Pasta Carbonara',
          description:
            'Classic Italian pasta with pancetta, egg, black pepper, and Parmesan cheese.',
          price: '$18.99',
        },
      ],
    },
  ];

  /**
   * Get menu section title or fallback
   */
  getMenuTitle(): string {
    return this.customizations?.pages?.home?.menu?.title || 'Our Menu';
  }

  /**
   * Get menu section subtitle or fallback
   */
  getMenuSubtitle(): string {
    return (
      this.customizations?.pages?.home?.menu?.subtitle ||
      'Enjoy our carefully crafted dishes made with the finest ingredients'
    );
  }

  /**
   * Get menu categories or use defaults
   */
  getMenuCategories(): MenuCategory[] {
    return (
      this.customizations?.pages?.home?.menu?.categories ||
      this.defaultMenuCategories
    );
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
