import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  computed,
  effect,
} from '@angular/core';
import { ImageUploaderComponent } from '../../../../shared/components/image-uploader/image-uploader.component';

@Component({
  selector: 'app-component-customizer',
  standalone: true,
  imports: [ImageUploaderComponent],
  templateUrl: './component-customizer.component.html',
  styleUrl: './component-customizer.component.scss',
})
export class ComponentCustomizerComponent {
  @Input() set component(value: any) {
    if (value) {
      this._component.set(value);
      this.newText.set(value.text || '');
      this.newColor.set(value.color || '#FFFFFF'); // Default color if not provided
      this.newImageUrl.set(value.image || '');
      this.isUploadable.set(value.uploadable || false);

      if (value.menuLinks) {
        this.menuLinks.set([...value.menuLinks]);
      }
    }
  }

  @Output() update = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  public _component = signal<any>(null);
  newText = signal<string>('');
  newColor = signal<string>('');
  newImageUrl = signal<string>('');
  menuLinks = signal<string[]>([]);
  isUploadable = signal<boolean>(false);

  // Computed signal to track component changes
  componentData = computed(() => ({
    id: this._component()?.id,
    text: this.newText(),
    color: this.newColor(),
    image: this.newImageUrl(),
    menuLinks: this.menuLinks(),
    uploadable: this.isUploadable(),
  }));

  constructor() {
    // Log real-time updates for debugging purposes
    effect(() => {
      console.log('Updated component data:', this.componentData());
    });
  }

  // Validation logic for the form
  isValid = computed(() => {
    const comp = this._component();
    if (!comp) return false;

    if (comp.uploadable && !this.newImageUrl()) return false;
    if (!this.newText().trim()) return false;

    return true;
  });

  // Update text signal
  updateText(event: any) {
    this.newText.set(event.target.value);
  }

  // Update color signal
  updateColor(event: any) {
    this.newColor.set(event.target.value);
  }

  // Handle image upload
  handleImageUpload(imageUrl: string | any) {
    this.newImageUrl.set(imageUrl);
  }

  // Update menu link text dynamically
  updateMenuLink(index: number, newText: any) {
    const links = [...this.menuLinks()];
    links[index] = newText.target.value;
    this.menuLinks.set(links);
  }

  // Emit updated changes
  applyChanges() {
    this.update.emit({
      [this._component()?.id]: this.componentData(),
    });
    this.close.emit();
  }
}
