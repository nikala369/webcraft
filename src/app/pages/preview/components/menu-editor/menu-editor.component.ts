import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  moveItemInArray,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { ImageService } from '../../../../core/services/shared/image/image.service';
import { ReactiveImageComponent } from '../../../../shared/components/reactive-image/reactive-image.component';
import { ToastService } from '../../../../core/services/toast/toast.service';

// Define interfaces for menu data structure (can be moved to a shared models file later)
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl?: string; // ObjectId from backend or legacy URL
  // Premium-only fields
  tags?: string[];
  featured?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string; // ObjectId from backend or legacy URL
  items: MenuItem[];
}

@Component({
  selector: 'app-menu-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, ReactiveImageComponent],
  templateUrl: './menu-editor.component.html',
  styleUrls: ['./menu-editor.component.scss'],
})
export class MenuEditorComponent implements OnInit {
  // Inputs from modal service
  @Input() initialCategories: MenuCategory[] = [];
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() onSave?: (categories: MenuCategory[]) => void;
  @Input() userTemplateId?: string; // Required for image uploads

  // For compatibility with both approaches - injected modal and direct use
  @Output() menuSave = new EventEmitter<MenuCategory[]>();
  @Output() menuCancel = new EventEmitter<void>();

  // Service injections
  private imageService = inject(ImageService);
  private toastService = inject(ToastService);

  // State management with signals
  categories = signal<MenuCategory[]>([]);
  selectedCategoryIndex = signal<number | null>(null);

  // Store pending file uploads
  private pendingUploads = new Map<string, File>();

  // Plan-based limits (updated as per requirement)
  maxCategories = computed(() => (this.isPremium() ? 8 : 3)); // Premium: 8, Standard: 3
  maxItemsPerCategory = computed(() => (this.isPremium() ? 15 : 12)); // Premium: 15, Standard: 12

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

  /**
   * Handle menu item image upload from file input
   * @param event File input change event
   * @param item Menu item to update
   */
  handleItemImageUpload(event: Event, item: MenuItem): void {
    console.log(`Handling image upload for item: ${item.name}`);
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      console.log('No file selected');
      // Clear pending upload if any
      this.pendingUploads.delete(item.id);
      return;
    }

    const file = files[0];
    console.log(
      'File selected:',
      file.name,
      'Size:',
      file.size,
      'Type:',
      file.type
    );

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      this.toastService.error(
        'File size exceeds 2MB limit. Please choose a smaller image.'
      );
      // Reset the input
      input.value = '';
      this.pendingUploads.delete(item.id);
      return;
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      this.toastService.error(
        'Please upload an image file (JPEG, PNG, SVG, etc.)'
      );
      input.value = '';
      this.pendingUploads.delete(item.id);
      return;
    }

    // Store the file for later upload
    this.pendingUploads.set(item.id, file);

    // Create temporary preview URL for immediate display
    const tempUrl = URL.createObjectURL(file);

    // Update item with temporary marker
    item.imageUrl = `temp:${tempUrl}`;

    // Force update to the categories signal for reactivity
    this.categories.update((categories) => [...categories]);

    this.toastService.success('File selected. Click "Save Menu" to upload.');
  }

  /**
   * Handle menu category image upload from file input
   * @param event File input change event
   * @param category Menu category to update
   */
  handleCategoryImageUpload(event: Event, category: MenuCategory): void {
    console.log(`Handling image upload for category: ${category.name}`);
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      console.log('No file selected');
      // Clear pending upload if any
      this.pendingUploads.delete(category.id);
      return;
    }

    const file = files[0];
    console.log(
      'File selected:',
      file.name,
      'Size:',
      file.size,
      'Type:',
      file.type
    );

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      this.toastService.error(
        'File size exceeds 2MB limit. Please choose a smaller image.'
      );
      // Reset the input
      input.value = '';
      this.pendingUploads.delete(category.id);
      return;
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      this.toastService.error(
        'Please upload an image file (JPEG, PNG, SVG, etc.)'
      );
      input.value = '';
      this.pendingUploads.delete(category.id);
      return;
    }

    // Store the file for later upload
    this.pendingUploads.set(category.id, file);

    // Create temporary preview URL for immediate display
    const tempUrl = URL.createObjectURL(file);

    // Update category with temporary marker
    category.imageUrl = `temp:${tempUrl}`;

    // Force update to the categories signal for reactivity
    this.categories.update((categories) => [...categories]);

    this.toastService.success('File selected. Click "Save Menu" to upload.');
  }

  /**
   * Remove the image from a menu item
   * @param item Menu item to update
   */
  removeItemImage(item: MenuItem): void {
    // Remove the image
    item.imageUrl = '';

    // Remove any pending upload
    this.pendingUploads.delete(item.id);

    // Force update to the categories signal for reactivity
    this.categories.update((categories) => [...categories]);
  }

  /**
   * Remove the image from a menu category
   * @param category Menu category to update
   */
  removeCategoryImage(category: MenuCategory): void {
    // Remove the image
    category.imageUrl = '';

    // Remove any pending upload
    this.pendingUploads.delete(category.id);

    // Force update to the categories signal for reactivity
    this.categories.update((categories) => [...categories]);
  }

  onSaveClick(): void {
    // Perform validation if needed before saving
    // Check for empty category names, item names, etc.
    const invalidCategory = this.categories().find((cat) => !cat.name.trim());
    if (invalidCategory) {
      this.toastService.error(
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
      this.toastService.error(
        `Item "${invalidItem.name || '(empty)'}" cannot have an empty name.`
      );
      // Optionally find and select the category of the invalid item
      return;
    }

    // Check if we have pending uploads
    if (this.pendingUploads.size > 0) {
      this.uploadPendingFiles()
        .then(() => {
          this.finalizeSave();
        })
        .catch((error) => {
          console.error('Error uploading files:', error);
          this.toastService.error('Failed to upload images. Please try again.');
        });
    } else {
      // No pending uploads, save directly
      this.finalizeSave();
    }
  }

  /**
   * Upload all pending files to backend
   */
  private async uploadPendingFiles(): Promise<void> {
    if (!this.userTemplateId) {
      throw new Error('Template ID is required for image uploads.');
    }

    this.toastService.info('Uploading images...');

    const uploadPromises: Promise<void>[] = [];

    for (const [id, file] of this.pendingUploads.entries()) {
      const uploadPromise = this.imageService
        .uploadImage(file, this.userTemplateId, id)
        .toPromise()
        .then((objectId) => {
          console.log(`Image uploaded for ${id}, objectId:`, objectId);

          // Validate objectId format
          if (
            !objectId ||
            typeof objectId !== 'string' ||
            objectId.includes('{')
          ) {
            console.error('Invalid objectId received:', objectId);
            throw new Error('Invalid response from server');
          }

          // Find the item or category and update it
          const categories = this.categories();
          let found = false;

          // Check if it's a category
          const category = categories.find((cat) => cat.id === id);
          if (category) {
            // Get current temp value before updating
            const currentValue = category.imageUrl;

            // Update with objectId
            category.imageUrl = objectId;
            found = true;

            // Clean up temp URL
            if (
              typeof currentValue === 'string' &&
              currentValue.startsWith('temp:')
            ) {
              const tempUrl = currentValue.replace('temp:', '');
              if (tempUrl.startsWith('blob:')) {
                URL.revokeObjectURL(tempUrl);
              }
            }
          } else {
            // Check if it's an item
            for (const cat of categories) {
              const item = cat.items.find((item) => item.id === id);
              if (item) {
                // Get current temp value before updating
                const currentValue = item.imageUrl;

                // Update with objectId
                item.imageUrl = objectId;
                found = true;

                // Clean up temp URL
                if (
                  typeof currentValue === 'string' &&
                  currentValue.startsWith('temp:')
                ) {
                  const tempUrl = currentValue.replace('temp:', '');
                  if (tempUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(tempUrl);
                  }
                }
                break;
              }
            }
          }

          if (!found) {
            console.error(`Could not find item or category with id: ${id}`);
          }

          // Force update to the categories signal for reactivity
          this.categories.update((categories) => [...categories]);
        })
        .catch((error) => {
          console.error(`Upload failed for ${id}:`, error);
          throw error;
        });

      uploadPromises.push(uploadPromise);
    }

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    // Clear pending uploads
    this.pendingUploads.clear();

    this.toastService.success('Images uploaded successfully!');
  }

  /**
   * Finalize the save process after uploads are complete
   */
  private finalizeSave(): void {
    const finalCategories = this.categories();
    console.log('Saving menu data:', finalCategories);

    // Support both callback and event approaches
    if (this.onSave) {
      console.log('Using onSave callback');
      this.onSave(finalCategories);
    }

    this.menuSave.emit(finalCategories);
  }

  onCancelClick(): void {
    console.log('Cancelling menu edit');
    this.menuCancel.emit();
  }
}
