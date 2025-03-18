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
    // Default categories for all components
    const categories = [
      { id: 'general', label: 'General' },
      { id: 'styling', label: 'Styling' },
    ];

    // Add content category for components with content fields
    if (this.hasContentFields()) {
      categories.splice(1, 0, { id: 'content', label: 'Content' });
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

    switch (this.activeCategory) {
      case 'general':
        // Basic settings, usually text, selects, and non-visual settings
        return allFields.filter(
          (field) =>
            (field.type === 'text' || field.type === 'select') &&
            !field.key.toLowerCase().includes('color') &&
            !field.key.toLowerCase().includes('image') &&
            !field.key.toLowerCase().includes('background') &&
            !field.key.toLowerCase().includes('icon')
        );

      case 'content':
        // Content, usually text fields, lists and media
        return allFields.filter(
          (field) =>
            field.type === 'text' ||
            field.type === 'file' ||
            field.type === 'list'
        );

      case 'styling':
        // Visual settings, usually colors, images, margins, etc.
        return allFields.filter(
          (field) =>
            field.type === 'color' ||
            field.key.toLowerCase().includes('color') ||
            field.key.toLowerCase().includes('background') ||
            field.key.toLowerCase().includes('image') ||
            field.key.toLowerCase().includes('style') ||
            field.key.toLowerCase().includes('size') ||
            field.key.toLowerCase().includes('height') ||
            field.key.toLowerCase().includes('width') ||
            field.key.toLowerCase().includes('padding') ||
            field.key.toLowerCase().includes('margin')
        );

      default:
        return allFields;
    }
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

  updateSelectField(fieldKey: string, value: string): void {
    this.localData.update((data) => ({ ...data, [fieldKey]: value }));
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
    // Remove the ID field we added for internal tracking
    if (result.id === this.componentKey) {
      delete result.id;
    }
    this.update.emit(result);
    this.close.emit();
  }

  cancel(): void {
    if (this.originalData) {
      this.localData.set({
        id: this.componentKey,
        ...structuredClone(this.originalData),
      });
    }
    this.close.emit();
  }
}
