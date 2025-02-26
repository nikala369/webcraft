import { Component, EventEmitter, Input, Output, signal, computed, effect } from '@angular/core';
import { ImageUploaderComponent } from '../../../../shared/components/image-uploader/image-uploader.component';
import {CustomizationFormConfig} from "./customizing-form-config";
import {CommonModule} from "@angular/common";

// Optional: Define an interface for aggregated component data.
export interface ComponentData {
  id: string;
  [key: string]: any;
}

@Component({
  selector: 'app-component-customizer',
  standalone: true,
  imports: [ImageUploaderComponent, CommonModule],
  templateUrl: './component-customizer.component.html',
  styleUrls: ['./component-customizer.component.scss']
})
export class ComponentCustomizerComponent {
  // Input properties to receive data from the parent.
  @Input() componentKey!: string;
  @Input() set initialData(value: any) {
    if (value) {
      // Combine componentKey with the passed data.
      this._component.set({ id: this.componentKey, ...value });
      // Use the config to initialize fields (if available).
      const config = CustomizationFormConfig[this.componentKey] || [];
      config.forEach(field => {
        switch (field.key) {
          case 'backgroundColor':
            this.newColor.set(value[field.key] || field.defaultValue || '#FFFFFF');
            break;
          case 'logoUrl':
            this.newImageUrl.set(value[field.key] || '');
            break;
          case 'menuItems':
            this.menuItems.set(value[field.key] ? [...value[field.key]] : []);
            break;
          case 'text':
          case 'title':
          case 'subtitle':
          case 'copyrightText':
          case 'textColor':
            this.newText.set(value[field.key] || '');
            break;
          // Add more cases if necessary.
        }
      });
    }
  }

  @Output() update = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  // Public signal so the template can access it.
  public _component = signal<any>(null);
  newText = signal<string>('');
  newColor = signal<string>('');
  newImageUrl = signal<string>('');
  menuItems = signal<any[]>([]);

  // Get configuration for the current component.
  config = computed(() => CustomizationFormConfig[this.componentKey] || []);

  // Aggregate current customization data.
  componentData = computed<ComponentData>(() => {
    const comp = this._component();
    return {
      id: comp?.id || 'Component',
      text: this.newText(),
      color: this.newColor(),
      image: this.newImageUrl(),
      menuItems: this.menuItems()
    };
  });

  constructor() {
    effect(() => {
      console.log('Updated component data:', this.componentData());
    });
  }

  // Validation to enable/disable the Apply button.
  isValid = computed(() => {
    const comp = this._component();
    if (!comp) return false;
    if (!this.newText().trim()) return false;
    // If a file input is required for any field of type 'file', check that.
    if (this.config().some(field => field.type === 'file' && !this.newImageUrl())) return false;
    return true;
  });

  // Handlers for updating fields.
  updateText(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.newText.set(target.value);
  }

  updateColor(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.newColor.set(target.value);
  }

  updateMenuItem(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const items = [...this.menuItems()];
    items[index] = target.value;
    this.menuItems.set(items);
  }

  handleImageUpload(file: File | any): void {
    if (file) {
      // Here you might want to upload the file and then set its URL.
      // For simplicity, we'll just set the file name.
      this.newImageUrl.set(file.name);
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input && input?.files[0];
      this.handleImageUpload(file);
    }
  }

  applyChanges(): void {
    this.update.emit({
      id: this._component()?.id,
      data: this.componentData()
    });
    this.close.emit();
  }
}
