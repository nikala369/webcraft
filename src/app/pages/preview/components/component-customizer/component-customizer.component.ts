import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  computed,
  effect,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CustomizationFormConfig,
  FieldConfig,
} from './customizing-form-config';
import { FormsModule } from '@angular/forms';

export interface ComponentData {
  id: string;
  [key: string]: any;
}

@Component({
  selector: 'app-component-customizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './component-customizer.component.html',
  styleUrls: ['./component-customizer.component.scss'],
})
export class ComponentCustomizerComponent {
  @Input() componentKey!: string;
  @Input() componentPath?: string;
  originalData: any;

  @Input() set initialData(value: any) {
    if (value) {
      // Save a deep clone for cancel/revert logic.
      this.originalData = structuredClone(value);
      const configFields = CustomizationFormConfig[this.componentKey] || [];
      // Merge provided data with defaults.
      const mergedData: ComponentData = { id: this.componentKey, ...value };

      configFields.forEach((field: FieldConfig) => {
        if (
          mergedData[field.key] === undefined &&
          field.defaultValue !== undefined
        ) {
          mergedData[field.key] = structuredClone(field.defaultValue);
        }
      });

      this.localData.set(mergedData);
    }
  }

  @Output() update = new EventEmitter<ComponentData>();
  @Output() close = new EventEmitter<void>();

  // Local state holding the component data.
  localData = signal<ComponentData>({ id: this.componentKey });
  config = computed(() => {
    // If there's a path, use it to get the config
    if (this.componentPath) {
      return CustomizationFormConfig[this.componentPath] || [];
    }
    // Otherwise use the key
    return CustomizationFormConfig[this.componentKey] || [];
  });
  componentData = computed(() => this.localData());

  // Listen for ESC key to close modal
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent) {
    this.cancel();
  }

  constructor() {
    effect(() => {
      console.log('Local data updated:', this.localData());
    });
  }

  // Handle clicks on the modal overlay
  handleOverlayClick(event: MouseEvent): void {
    // Only close if the click was directly on the overlay, not the modal itself
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }

  updateField(fieldKey: string, event: Event): void {
    console.log(event, 'event received after update');
    const input = event.target as HTMLInputElement | HTMLSelectElement;
    let value: any = input.value;

    // Handle boolean conversion for select fields with true/false values
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }

    this.localData.update((current) => ({ ...current, [fieldKey]: value }));
  }

  updateSelectField(fieldKey: string, value: any): void {
    // Handle boolean conversion for select fields with true/false values
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }

    this.localData.update((current) => ({ ...current, [fieldKey]: value }));
  }

  // Helper method to convert any value to string for select elements
  getSelectValue(value: any): string {
    if (value === true || value === 'true') {
      return 'true';
    } else if (value === false || value === 'false') {
      return 'false';
    }
    return value?.toString() || '';
  }

  onFileChange(fieldKey: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const file = input?.files[0];
      this.handleImageUpload(fieldKey, file);
    }
  }

  handleImageUpload(fieldKey: string, file: File): void {
    const fileURL = URL.createObjectURL(file);
    this.localData.update((current) => ({ ...current, [fieldKey]: fileURL }));
  }

  updateListField(fieldKey: string, index: number, newValue: string): void {
    this.localData.update((current) => {
      const list = Array.isArray(current[fieldKey])
        ? [...current[fieldKey]]
        : [];
      if (typeof list[index] === 'object') {
        list[index] = { ...list[index], label: newValue };
      } else {
        list[index] = newValue;
      }
      return { ...current, [fieldKey]: list };
    });
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  isValid = computed(() => {
    const data = this.localData();
    return this.config().every((field: FieldConfig) => {
      if (field.type === 'text') {
        // If not required, allow empty.
        if (field.required === false) return true;
        return !!data[field.key]?.trim();
      }
      if (field.type === 'file') {
        return !!data[field.key];
      }
      // Additional validations for other field types can go here.
      return true;
    });
  });

  applyChanges(): void {
    this.update.emit(this.localData());
    this.close.emit();
  }

  cancel(): void {
    if (this.originalData) {
      this.localData.set(structuredClone(this.originalData));
    }
    this.close.emit();
  }
}