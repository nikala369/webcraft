import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  moveItemInArray,
  DragDropModule,
} from '@angular/cdk/drag-drop';

// Define interfaces for menu data structure (can be moved to a shared models file later)
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  // Premium-only fields
  tags?: string[];
  featured?: boolean;
  image?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-menu-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './menu-editor.component.html',
  styleUrls: ['./menu-editor.component.scss'],
})
export class MenuEditorComponent implements OnInit {
  // Inputs from modal service
  @Input() initialCategories: MenuCategory[] = [];
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() onSave?: (categories: MenuCategory[]) => void;

  // For compatibility with both approaches - injected modal and direct use
  @Output() save = new EventEmitter<MenuCategory[]>();
  @Output() cancel = new EventEmitter<void>();

  // State management with signals
  categories = signal<MenuCategory[]>([]);
  selectedCategoryIndex = signal<number | null>(null);

  // Plan-based limits (updated as per requirement)
  maxCategories = computed(() => (this.isPremium() ? 5 : 2)); // Premium: 5, Standard: 2
  maxItemsPerCategory = computed(() => (this.isPremium() ? 15 : 8)); // Premium: 15, Standard: 8

  // Check if user has premium plan
  isPremium(): boolean {
    return this.planType === 'premium';
  }

  ngOnInit(): void {
    console.log('MenuEditorComponent initialized with plan:', this.planType);
    console.log('Initial categories:', this.initialCategories);
    console.log('onSave callback present:', !!this.onSave);

    // Make a deep clone to prevent modifying the original data directly
    try {
      // Create deep copy of categories
      const categoriesCopy = structuredClone(this.initialCategories) || [];

      // Ensure all categories and items have IDs
      categoriesCopy.forEach((cat) => {
        if (!cat.id)
          cat.id = `cat${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;

        cat.items?.forEach((item) => {
          if (!item.id)
            item.id = `item${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`;
        });
      });

      // Set the categories signal
      this.categories.set(categoriesCopy);

      // Auto-select the first category if available
      if (categoriesCopy.length > 0) {
        this.selectedCategoryIndex.set(0);
      }

      console.log('Categories initialized:', this.categories());
    } catch (error) {
      console.error('Error initializing menu categories:', error);
      // Fallback to a simpler approach
      this.categories.set(
        JSON.parse(JSON.stringify(this.initialCategories || []))
      );
    }
  }

  // --- Category Management ---

  canAddCategory(): boolean {
    return this.categories().length < this.maxCategories();
  }

  addCategory(): void {
    if (!this.canAddCategory()) return;

    // Generate a unique ID for the new category
    const newId = `cat${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newCategory: MenuCategory = {
      id: newId,
      name: 'New Category',
      items: [],
    };

    // Add to categories list
    this.categories.update((cats) => [...cats, newCategory]);
    // Auto-select the new category
    this.selectedCategoryIndex.set(this.categories().length - 1);

    console.log('Category added:', newCategory);
  }

  selectCategory(index: number): void {
    this.selectedCategoryIndex.set(index);
  }

  selectedCategory = computed(() => {
    const index = this.selectedCategoryIndex();
    return index !== null ? this.categories()[index] : null;
  });

  canRemoveCategory(): boolean {
    // Can always remove if more than one category exists
    return this.categories().length > 1;
  }

  removeCategory(index: number): void {
    if (!this.canRemoveCategory()) return;

    // Remove the category
    this.categories.update((cats) => {
      const newCats = [...cats];
      newCats.splice(index, 1);
      return newCats;
    });

    // Adjust selectedCategoryIndex if needed
    if (
      this.selectedCategoryIndex() === index ||
      this.selectedCategoryIndex() === null
    ) {
      // If we're removing the selected category, select the first one
      this.selectedCategoryIndex.set(this.categories().length > 0 ? 0 : null);
    } else if (this.selectedCategoryIndex()! > index) {
      // If we're removing a category before the selected one, adjust the index
      this.selectedCategoryIndex.update((i) => (i !== null ? i - 1 : null));
    }

    console.log('Category removed, updated categories:', this.categories());
  }

  // For premium users: drag and drop categories to reorder
  dropCategory(event: CdkDragDrop<MenuCategory[]>): void {
    if (!this.isPremium()) return; // Block if not premium

    // Track which category was selected before the move
    const selectedCategory = this.selectedCategory();

    // Reorder the list
    moveItemInArray(
      this.categories() as MenuCategory[],
      event.previousIndex,
      event.currentIndex
    );

    // Force categories signal update
    this.categories.update((cats) => [...cats]);

    // Update the selected category index if needed
    if (selectedCategory) {
      const newIndex = this.categories().findIndex(
        (c) => c.id === selectedCategory.id
      );
      this.selectedCategoryIndex.set(newIndex);
    }

    console.log('Categories reordered');
  }

  // --- Item Management ---

  canAddItem(): boolean {
    const category = this.selectedCategory();
    return category
      ? category.items.length < this.maxItemsPerCategory()
      : false;
  }

  addItem(): void {
    const category = this.selectedCategory();
    if (!category || !this.canAddItem()) return;

    // Generate unique ID for the item
    const newId = `item${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newItem: MenuItem = {
      id: newId,
      name: 'New Item',
      description: 'Description of this item',
      price: '$0.00',
    };

    // Add to the selected category
    category.items.push(newItem);

    // Force category update for reactivity
    this.categories.update((cats) => [...cats]);

    console.log('Item added to category:', category.name);
  }

  removeItem(itemIndex: number): void {
    const category = this.selectedCategory();
    if (!category) return;
    category.items.splice(itemIndex, 1);
    // Force category update for reactivity
    this.categories.update((cats) => [...cats]);

    console.log('Item removed from category:', category.name);
  }

  // For premium users: drag and drop items to reorder
  dropItem(event: CdkDragDrop<MenuItem[]>): void {
    if (!this.isPremium()) return; // Block if not premium

    const category = this.selectedCategory();
    if (!category) return;

    // Reorder items within the current category
    moveItemInArray(category.items, event.previousIndex, event.currentIndex);
    // Force update
    this.categories.update((cats) => [...cats]);

    console.log('Items reordered in category:', category.name);
  }

  // --- Save / Cancel ---

  onSaveClick(): void {
    // Perform validation if needed before saving
    // Check for empty category names, item names, etc.
    const invalidCategory = this.categories().find((cat) => !cat.name.trim());
    if (invalidCategory) {
      alert(
        `Category "${
          invalidCategory.name || '(empty)'
        }" cannot have an empty name.`
      );
      // Optionally, select the invalid category
      const invalidIndex = this.categories().findIndex(
        (cat) => cat === invalidCategory
      );
      this.selectCategory(invalidIndex);
      return;
    }

    const invalidItem = this.categories()
      .flatMap((cat) => cat.items)
      .find((item) => !item.name.trim());
    if (invalidItem) {
      alert(
        `Item "${invalidItem.name || '(empty)'}" cannot have an empty name.`
      );
      // Optionally find and select the category of the invalid item
      return;
    }

    const finalCategories = this.categories();
    console.log('Saving menu data:', finalCategories);

    // Support both callback and event approaches
    if (this.onSave) {
      console.log('Using onSave callback');
      this.onSave(finalCategories);
    }

    this.save.emit(finalCategories);
  }

  onCancelClick(): void {
    console.log('Cancelling menu edit');
    this.cancel.emit();
  }
}
