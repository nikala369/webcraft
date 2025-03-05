import { Component, EventEmitter, Input, Output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomizationFormConfig, FieldConfig } from "./customizing-form-config";
import { FormsModule } from "@angular/forms";

export interface ComponentData {
  id: string;
  [key: string]: any;
}

@Component({
  selector: 'app-component-customizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './component-customizer.component.html',
  styleUrls: ['./component-customizer.component.scss']
})
export class ComponentCustomizerComponent {
  @Input() componentKey!: string;
  originalData: any;

  @Input() set initialData(value: any) {
    if (value) {
      // Save a deep clone for cancel/revert logic.
      this.originalData = structuredClone(value);
      const configFields = CustomizationFormConfig[this.componentKey] || [];
      // Merge provided data with defaults.
      const mergedData: ComponentData = { id: this.componentKey, ...value };

      configFields.forEach((field: FieldConfig) => {
        if (mergedData[field.key] === undefined && field.defaultValue !== undefined) {
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
  config = computed(() => CustomizationFormConfig[this.componentKey] || []);
  componentData = computed(() => this.localData());

  constructor() {
    effect(() => {
      console.log('Local data updated:', this.localData());
    });
  }

  updateField(fieldKey: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.localData.update(current => ({ ...current, [fieldKey]: value }));
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
    this.localData.update(current => ({ ...current, [fieldKey]: fileURL }));
  }

  updateListField(fieldKey: string, index: number, newValue: string): void {
    this.localData.update(current => {
      const list = Array.isArray(current[fieldKey]) ? [...current[fieldKey]] : [];
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
