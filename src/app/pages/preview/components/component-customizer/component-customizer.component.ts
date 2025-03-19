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
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CustomizationFormConfig,
  FieldConfig,
} from './customizing-form-config';
import { FormsModule } from '@angular/forms';

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
  originalData: any;
  isVisible = false;
  activeCategory = 'general';

  @Input() set initialData(value: any) {
    if (value) {
      // Store original for reset functionality
      this.originalData = structuredClone(value);

      // Get fields configuration
      const configFields = this.getFieldsConfig();

      // Start with component ID and existing data
      const mergedData = { id: this.componentKey, ...value };

      // Apply default values for fields that don't have data
      configFields.forEach((field: FieldConfig) => {
        if (
          field.defaultValue !== undefined &&
          mergedData[field.key] === undefined
        ) {
          mergedData[field.key] = field.defaultValue;
        }
      });

      // Set the local data signal
      this.localData.set(mergedData);
    }
  }

  @Output() update = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  // Component data handling
  localData = signal<any>({});

  // Helper to get field config for this component
  getFieldsConfig(): FieldConfig[] {
    return CustomizationFormConfig[this.componentKey] || [];
  }

  // Form validation signal
  isValid = computed(() => {
    const data = this.localData();
    const requiredFields = this.getFieldsConfig().filter(
      (field) => field.required === true
    );

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
      console.log('Fields Config Available:', this.getFieldsConfig());
      console.log('Fields for Category:', this.getFieldsForCategory());
      console.log('Initial Data:', this.localData());
    }, 50);
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
        field.type === 'text' || field.type === 'file' || field.type === 'list'
    );
  }

  setActiveCategory(categoryId: string) {
    this.activeCategory = categoryId;
  }

  getFieldsForCategory() {
    const allFields = this.getFieldsConfig();

    // Use the explicit category field
    return allFields.filter((field) => field.category === this.activeCategory);
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
        { id: 'transparent', label: 'Transparent' },
        { id: 'gradient', label: 'Gradient' },
      ];
    }

    // Add presets for other components as needed
    return [];
  }

  applyPreset(presetId: string) {
    // Apply preset values based on selected template
    if (this.componentKey === 'header') {
      if (presetId === 'light') {
        this.localData.update((data) => ({
          ...data,
          backgroundColor: '#ffffff',
          textColor: '#333333',
          position: 'fixed',
        }));
      } else if (presetId === 'dark') {
        this.localData.update((data) => ({
          ...data,
          backgroundColor: '#222222',
          textColor: '#ffffff',
          position: 'fixed',
        }));
      } else if (presetId === 'transparent') {
        this.localData.update((data) => ({
          ...data,
          backgroundColor: 'transparent',
          textColor: '#ffffff',
          position: 'absolute',
        }));
      } else if (presetId === 'gradient') {
        this.localData.update((data) => ({
          ...data,
          backgroundColor: 'linear-gradient(135deg, #2876FF 0%, #1D4ED8 100%)',
          textColor: '#ffffff',
          position: 'fixed',
        }));
      }
    }

    // Add similar handling for other components
  }

  // Helper for displaying field labels
  shouldShowLabel(field: FieldConfig | any): boolean {
    return field.type !== 'boolean';
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

    this.localData.update((data) => ({ ...data, [fieldKey]: typedValue }));
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

  addListItem(fieldKey: string) {
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
    this.localData.update((current) => {
      const list = [...current[fieldKey]];
      list.splice(index, 1);
      return { ...current, [fieldKey]: list };
    });
  }

  handleFileChange(event: any, fieldKey: string) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.localData.update((current) => {
          return { ...current, [fieldKey]: e.target?.result };
        });
      };
      reader.readAsDataURL(file);
    }
  }

  trackByIndex(index: number): number {
    return index;
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
    console.log(result, 'result data after update sidebar');

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
}
