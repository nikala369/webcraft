import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  computed,
  effect,
  HostListener,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CustomizationFormConfig,
  FieldConfig,
} from './customizing-form-config';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../../core/services/toast/toast.service';

@Component({
  selector: 'app-component-customizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './component-customizer.component.html',
  styleUrls: ['./component-customizer.component.scss'],
})
export class ComponentCustomizerComponent implements OnInit {
  @Input() componentKey!: string;
  @Input() componentPath?: string;
  @Input() planType: string = 'standard'; // Default to standard plan
  @Input() businessType!: string;
  originalData: any;
  isVisible = false;
  activeCategory = 'general';

  // Inject the toast service
  private toastService = inject(ToastService);

  // Data structure for storing video placeholder metadata
  videoPlaceholders: Record<string, { fileName: string; timestamp: string }> =
    {};

  @Input() set initialData(value: any) {
    if (value) {
      console.log('Component customizer received initial data:', value);
      console.log('Component key:', this.componentKey);

      // Check specifically for image and video data
      if (this.componentKey.includes('hero')) {
        console.log(
          'Hero section data - backgroundImage:',
          value.backgroundImage
        );
        console.log(
          'Hero section data - backgroundType:',
          value.backgroundType
        );
        console.log(
          'Hero section data - backgroundVideo:',
          value.backgroundVideo ? 'Video data present' : 'No video data'
        );
      }

      // Store original for reset functionality
      this.originalData = structuredClone(value);

      // Get fields configuration
      const configFields = this.getFieldsConfig();

      // Start with component ID and existing data
      const mergedData = { id: this.componentKey, ...value };

      // Apply default values for fields that don't have data
      if (configFields && configFields.length > 0) {
        console.log(
          `Applying defaults from field config for ${this.componentKey} where missing`
        );
        configFields.forEach((field: FieldConfig) => {
          if (
            field.defaultValue !== undefined &&
            (mergedData[field.key] === undefined ||
              mergedData[field.key] === null)
          ) {
            console.log(
              `Setting default for ${field.key}: ${field.defaultValue}`
            );
            mergedData[field.key] = field.defaultValue;
          }
        });
      } else {
        console.log('No field config found for:', this.componentKey);
      }

      // Set the local data signal
      this.localData.set(mergedData);
      console.log('Final merged data for customizer:', mergedData);
    } else {
      console.warn('Component customizer received null/undefined initial data');
      // Initialize with empty object and component ID
      this.localData.set({ id: this.componentKey });
    }
  }

  @Output() update = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  // Component data handling
  localData = signal<any>({});

  // Helper to get field config for this component
  getFieldsConfig(): FieldConfig[] {
    // No longer need backward compatibility aliases
    // Use only the exact component key provided
    return CustomizationFormConfig[this.componentKey] || [];
  }

  // Form validation signal
  isValid = computed(() => {
    const data = this.localData();
    const requiredFields = this.getFieldsConfig().filter(
      (field) => field.required === true
    );

    // Special validation for hero section with background type
    if (this.componentKey.includes('hero') && data.backgroundType) {
      // For video background, require backgroundVideo
      if (data.backgroundType === 'video') {
        return !!data.backgroundVideo;
      }

      // For image background, require backgroundImage
      if (data.backgroundType === 'image') {
        return !!data.backgroundImage;
      }
    }

    // Regular validation for other components
    return requiredFields.every((field: FieldConfig) => {
      if (field.type === 'text') {
        return data[field.key]?.trim?.() !== '';
      }
      return data[field.key] !== undefined && data[field.key] !== null;
    });
  });

  ngOnInit() {
    // Show sidebar with animation after component is initialized
    setTimeout(() => {
      this.isVisible = true;

      // Debugging statements
      console.log('Component Customizer Initialized');
      console.log('Component Key:', this.componentKey);
      console.log('Plan Type:', this.planType);
      console.log('Fields Config Available:', this.getFieldsConfig());
      console.log('Fields for Category:', this.getFieldsForCategory());
      console.log('Initial Data:', this.localData());

      // Check validation status and auto-select category with errors if any
      const validationStatus = this.getCategoryValidationStatus();
      console.log('Initial validation status:', validationStatus);

      // Find the first category with validation errors
      const invalidCategory = Object.entries(validationStatus).find(
        ([category, isValid]) => !isValid
      )?.[0];

      // If there's an invalid category, switch to it
      if (invalidCategory) {
        console.log(`Selecting category with errors: ${invalidCategory}`);
        this.activeCategory = invalidCategory;
      }
    }, 50);

    // Load video placeholders from session storage if they exist
    const savedPlaceholders = sessionStorage.getItem('videoPlaceholders');
    if (savedPlaceholders) {
      try {
        this.videoPlaceholders = JSON.parse(savedPlaceholders);
        console.log('Loaded video placeholders:', this.videoPlaceholders);
      } catch (error) {
        console.error('Error parsing video placeholders:', error);
      }
    }
  }

  // Get formatted component title for display
  getComponentTitle(): string {
    const parts = this.componentKey.split('.');
    const rawName = parts[parts.length - 1];
    return (
      rawName.charAt(0).toUpperCase() +
      rawName.slice(1).replace(/([A-Z])/g, ' $1')
    );
  }

  // Category management
  getCategories() {
    // Get all available fields
    const allFields = this.getFieldsConfig();

    // Check which categories have fields
    const hasGeneralFields = allFields.some(
      (field) => field.category === 'general'
    );
    const hasContentFields = allFields.some(
      (field) => field.category === 'content'
    );
    const hasStylingFields = allFields.some(
      (field) => field.category === 'styling'
    );

    // Only add categories that have fields
    const categories: any = [];

    if (hasGeneralFields) {
      categories.push({ id: 'general', label: 'General' });
    }

    if (hasContentFields) {
      categories.push({ id: 'content', label: 'Content' });
    }

    if (hasStylingFields) {
      categories.push({ id: 'styling', label: 'Styling' });
    }

    // After constructing categories array, if empty, set a default
    if (categories.length === 0) {
      categories.push({ id: 'general', label: 'General' });
    }

    // Ensure active category is valid
    if (
      categories.length > 0 &&
      !categories.some((cat: any) => cat.id === this.activeCategory)
    ) {
      setTimeout(() => {
        this.activeCategory = categories[0].id;
      });
    }

    return categories;
  }

  hasContentFields(): boolean {
    const config = this.getFieldsConfig();
    return config.some(
      (field) =>
        field.type === 'text' ||
        field.type === 'textarea' ||
        field.type === 'file' ||
        field.type === 'list'
    );
  }

  setActiveCategory(categoryId: string) {
    this.activeCategory = categoryId;
  }

  getFieldsForCategory() {
    const allFields = this.getFieldsConfig();

    // Filter fields by category
    const categoryFields = allFields.filter(
      (field) => field.category === this.activeCategory
    );

    // If this is the header component and we're editing menu items,
    // filter based on plan type
    if (this.componentKey === 'header' && this.activeCategory === 'content') {
      return categoryFields.filter((field) => {
        // For standard plan, hide the ability to add/remove menu items
        if (this.planType === 'standard' && field.key === 'menuItems') {
          return false;
        }
        return true;
      });
    }

    return categoryFields;
  }

  // Check if we should show presets for this component
  hasPresets(): boolean {
    // Add component types that support presets
    return ['header', 'services', 'hero1', 'footer'].includes(
      this.componentKey
    );
  }

  getPresets() {
    if (this.componentKey === 'header') {
      return [
        { id: 'light', label: 'Light Theme' },
        { id: 'dark', label: 'Dark Theme' },
        { id: 'colorful', label: 'Colorful' },
        { id: 'gradient', label: 'Gradient' },
      ];
    }

    // Add presets for other components as needed
    return [];
  }

  applyPreset(presetId: string): void {
    if (this.componentKey === 'header') {
      if (presetId === 'light') {
        // A light theme with a soft light-gray background and dark text.
        this.localData.update((data) => ({
          ...data,
          backgroundColor: '#808080', // Soft light gray, not pure white
          textColor: '#ffffff',
          position: 'fixed',
        }));
      } else if (presetId === 'dark') {
        // A dark theme with a deep gray background and light text.
        this.localData.update((data) => ({
          ...data,
          backgroundColor: '#121212', // Deep gray
          textColor: '#ffffff', // Near white text for contrast
          position: 'fixed',
        }));
      } else if (presetId === 'colorful') {
        // A transparent header with white text.
        this.localData.update((data) => ({
          ...data,
          backgroundColor: '#ffb86d',
          textColor: '#ffffff',
          position: 'fixed',
        }));
      } else if (presetId === 'gradient') {
        // A gradient header with modern blue tones and white text.
        this.localData.update((data) => ({
          ...data,
          backgroundColor: 'linear-gradient(135deg, #3a8dff 0%, #0066ff 100%)',
          textColor: '#ffffff',
          position: 'fixed',
        }));
      }
    }
  }

  // Helper for displaying field labels
  shouldShowLabel(field: FieldConfig | any): boolean {
    return field.type !== 'boolean';
  }

  // Helper to determine if the entire field label row should be displayed
  shouldShowFieldLabel(field: FieldConfig | any): boolean {
    // Hide backgroundImage label when video is selected
    if (
      field.key === 'backgroundImage' &&
      this.localData()['backgroundType'] === 'video'
    ) {
      return false;
    }

    // Hide backgroundVideo label when image is selected or no type is specified
    if (
      field.key === 'backgroundVideo' &&
      (this.localData()['backgroundType'] === 'image' ||
        !this.localData()['backgroundType'])
    ) {
      return false;
    }

    // Show all other field labels
    return true;
  }

  updateBooleanField(fieldKey: string, value: boolean): void {
    this.localData.update((data) => ({ ...data, [fieldKey]: value }));
  }

  // Form field methods
  updateField(fieldKey: string, event: any) {
    const value = event.target.value;
    this.localData.update((current) => {
      return { ...current, [fieldKey]: value };
    });
  }

  updateTextField(fieldKey: string, value: string): void {
    this.localData.update((data) => ({ ...data, [fieldKey]: value }));
  }

  /**
   * Handle select field changes with special handling for background type
   * @param fieldKey The field key being updated
   * @param value The new value
   */
  updateSelectField(fieldKey: string, value: string | boolean): void {
    // Find field config to determine expected type
    const field = this.getFieldsConfig().find((f) => f.key === fieldKey);

    let typedValue: any = value;

    // Convert string "true"/"false" to actual boolean if necessary
    if (field?.options?.some((opt) => typeof opt.value === 'boolean')) {
      if (value === 'true') typedValue = true;
      if (value === 'false') typedValue = false;
    }

    // Handle numeric values
    if (
      field?.options?.some((opt) => typeof opt.value === 'number') &&
      !isNaN(Number(value))
    ) {
      typedValue = Number(value);
    }

    // Update the field value
    this.localData.update((data) => ({ ...data, [fieldKey]: typedValue }));

    // Special handling for hero section background type
    if (fieldKey === 'backgroundType') {
      console.log(`Background type changed to: ${typedValue}`);

      // Switching between image and video modes
      const currentData = this.localData();

      // If switching to video mode
      if (typedValue === 'video') {
        // If we don't have a video yet, scroll to the video input
        if (!currentData['backgroundVideo']) {
          setTimeout(() => {
            const fileInput = document.getElementById('backgroundVideo');
            if (fileInput) {
              fileInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Add flashing highlight to draw attention
              fileInput.classList.add('highlight-required');
              setTimeout(() => {
                fileInput.classList.remove('highlight-required');
              }, 2000);
            }
          }, 100);
        }
      }
      // If switching to image mode
      else if (typedValue === 'image') {
        // If we don't have an image yet, scroll to the image input
        if (!currentData['backgroundImage']) {
          setTimeout(() => {
            const fileInput = document.getElementById('backgroundImage');
            if (fileInput) {
              fileInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Add flashing highlight to draw attention
              fileInput.classList.add('highlight-required');
              setTimeout(() => {
                fileInput.classList.remove('highlight-required');
              }, 2000);
            }
          }, 100);
        }
      }
    }
  }

  updateColorField(fieldKey: string, value: string) {
    this.localData.update((current) => {
      return { ...current, [fieldKey]: value };
    });
  }

  updateListField(fieldKey: string, index: number, newValue: string) {
    this.localData.update((current) => {
      const list = current[fieldKey] ? [...current[fieldKey]] : [];

      if (typeof list[index] === 'object') {
        list[index] = { ...list[index], label: newValue };
      } else {
        list[index] = newValue;
      }

      return { ...current, [fieldKey]: list };
    });
  }

  // Check if user can add/remove list items based on plan type and component
  canModifyList(fieldKey: string): boolean {
    // For header menuItems in standard plan, don't allow adding/removing
    if (
      this.componentKey === 'header' &&
      fieldKey === 'menuItems' &&
      this.planType === 'standard'
    ) {
      return false;
    }

    // For premium plan, allow adding up to 5 menu items
    if (
      this.componentKey === 'header' &&
      fieldKey === 'menuItems' &&
      this.planType === 'premium'
    ) {
      const currentItems = this.localData()[fieldKey] || [];
      // Allow adding only if less than 5 items exist
      return currentItems.length < 5;
    }

    // Default - allow modifications
    return true;
  }

  // Check if user can remove list items based on plan type and component
  canRemoveListItem(fieldKey: string): boolean {
    // For header menuItems in standard plan, don't allow removing
    if (
      this.componentKey === 'header' &&
      fieldKey === 'menuItems' &&
      this.planType === 'standard'
    ) {
      return false;
    }

    // For premium plan, make sure at least 3 menu items remain
    if (
      this.componentKey === 'header' &&
      fieldKey === 'menuItems' &&
      this.planType === 'premium'
    ) {
      const currentItems = this.localData()[fieldKey] || [];
      // Allow removing only if more than 3 items exist
      return currentItems.length > 3;
    }

    // Default - allow removals
    return true;
  }

  addListItem(fieldKey: string) {
    // Check if we can add items
    if (!this.canModifyList(fieldKey)) {
      return;
    }

    this.localData.update((current) => {
      const list = current[fieldKey] ? [...current[fieldKey]] : [];

      // Check if list items are objects or simple values
      if (list.length > 0 && typeof list[0] === 'object') {
        // Generate a unique ID for the new item
        const maxId = list.reduce(
          (max, item) => (item.id > max ? item.id : max),
          0
        );

        list.push({ id: maxId + 1, label: '', link: '/' });
      } else {
        list.push('');
      }

      return { ...current, [fieldKey]: list };
    });
  }

  removeListItem(fieldKey: string, index: number) {
    // Check if we can remove items
    if (!this.canRemoveListItem(fieldKey)) {
      return;
    }

    this.localData.update((current) => {
      const list = [...current[fieldKey]];
      list.splice(index, 1);
      return { ...current, [fieldKey]: list };
    });
  }

  /**
   * Handle file upload with validation
   * @param event File input change event
   * @param fieldKey Field key to update
   */
  handleFileUpload(event: Event, fieldKey: string): void {
    console.log(`Handling file upload for ${fieldKey}`);
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      console.log('No file selected');
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

    // Get max file size based on file type
    let maxSize = 1024 * 1024 * 2; // Default 2MB for images
    if (file.type.includes('video')) {
      maxSize = 1024 * 1024 * 10; // 10MB for videos
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      this.toastService.error(
        `File size exceeds ${maxSizeMB}MB limit. Please choose a smaller file.`
      );
      // Reset the input to clear the invalid selection
      input.value = '';
      return;
    }

    // Read file as data URL
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      if (readerEvent.target?.result) {
        const result = readerEvent.target.result as string;

        // Update local data with the new file
        const updatedData = { ...this.localData() };
        updatedData[fieldKey] = result;

        // For video uploads, also check if we need to save a placeholder
        if (file.type.includes('video')) {
          // Store a placeholder for videos to avoid storage quota issues
          this.storeVideoPlaceholder(fieldKey, file.name);
        }

        this.localData.set(updatedData);
        console.log(`Updated ${fieldKey} with file data`);
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      this.toastService.error('Error uploading file. Please try again.');
    };

    reader.readAsDataURL(file);
  }

  /**
   * Store a placeholder for video files to avoid storage quota issues
   */
  private storeVideoPlaceholder(fieldKey: string, fileName: string): void {
    // Update stored data with placeholder
    this.videoPlaceholders = {
      ...this.videoPlaceholders,
      [fieldKey]: {
        fileName: fileName,
        timestamp: new Date().toISOString(),
      },
    };

    // Update session storage for persistence
    sessionStorage.setItem(
      'videoPlaceholders',
      JSON.stringify(this.videoPlaceholders)
    );
    console.log('Stored video placeholder:', this.videoPlaceholders);
  }

  /**
   * Check if a field is required
   */
  isFieldRequired(fieldKey: string): boolean {
    const field = this.getFieldsConfig().find((f) => f.key === fieldKey);
    if (!field) return false;

    // Check field.required property first
    if (field.required !== undefined) {
      return field.required;
    }

    // For backward compatibility, check validation if defined
    if (
      field &&
      typeof field === 'object' &&
      'validation' in field &&
      field.validation
    ) {
      const validation = field.validation as Record<string, unknown>;
      if ('required' in validation) {
        return !!validation['required'];
      }
    }

    return false;
  }

  // Handle backdrop click
  handleBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('sidebar-backdrop')) {
      this.cancel();
    }
  }

  // Actions
  applyChanges(): void {
    const result = { ...this.localData() };

    // Remove the ID field we added for internal tracking
    if (result.id === this.componentKey) {
      delete result.id;
    }

    // Start closing animation
    this.startClosingAnimation();

    // Emit update event with the result
    this.update.emit(result);
  }

  cancel(): void {
    // Start the closing animation
    this.startClosingAnimation();

    // Reset to original data
    if (this.originalData) {
      this.localData.set({
        id: this.componentKey,
        ...structuredClone(this.originalData),
      });
    }
  }

  startClosingAnimation(): void {
    // Add closing class to trigger the exit animation
    const container = document.querySelector('.customizer-sidebar-container');
    container?.classList.add('closing');
    container?.classList.remove('visible');

    setTimeout(() => {
      this.close.emit();
    }, 400);
  }

  // Check which categories have required but invalid fields
  getCategoryValidationStatus(): Record<string, boolean> {
    const data = this.localData();
    const result: Record<string, boolean> = {};

    // Get all available categories
    const categories = this.getCategories().map((cat: any) => cat.id as string);

    // Initialize all categories as valid
    categories.forEach((cat: string) => {
      result[cat] = true;
    });

    // Special case for hero section
    if (this.componentKey.includes('hero')) {
      const contentValid = this.isContentCategoryValid();
      result['content'] = contentValid;
      return result;
    }

    // For other components, check each required field
    const requiredFields = this.getFieldsConfig().filter(
      (field) => field.required === true
    );

    requiredFields.forEach((field) => {
      const isValid =
        field.type === 'text'
          ? data[field.key]?.trim?.() !== ''
          : data[field.key] !== undefined && data[field.key] !== null;

      if (!isValid) {
        result[field.category] = false;
      }
    });

    return result;
  }

  // Special validation for content category in hero section
  isContentCategoryValid(): boolean {
    const data = this.localData();

    if (data.backgroundType === 'video') {
      return !!data.backgroundVideo;
    }

    if (data.backgroundType === 'image' || !data.backgroundType) {
      return !!data.backgroundImage;
    }

    return true;
  }

  /**
   * Legacy handler for backwards compatibility
   * @deprecated Use handleFileUpload instead
   */
  handleFileChange(event: Event, fieldKey: string): void {
    // Forward to the new method
    this.handleFileUpload(event, fieldKey);
  }

  /**
   * Helper method for tracking by index in ngFor loops
   */
  trackByIndex(index: number): number {
    return index;
  }
}
