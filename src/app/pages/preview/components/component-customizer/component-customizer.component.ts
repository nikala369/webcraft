import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  computed,
  effect,
} from '@angular/core';

@Component({
  selector: 'app-component-customizer',
  standalone: true,
  imports: [],
  templateUrl: './component-customizer.component.html',
  styleUrl: './component-customizer.component.scss',
})
export class ComponentCustomizerComponent {
  @Input() set component(value: any) {
    if (value) {
      this._component.set(value);
      this.newText.set(value.text || '');
      this.newColor.set(value.color || '');
      this.newImageUrl.set(value.image || '');
      this.isUploadable.set(value.uploadable || false);

      if (value.menuLinks) {
        this.menuLinks.set([...value.menuLinks]);
      }
    }
  }

  @Output() update = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  private _component = signal<any>(null);
  newText = signal<string>('');
  newColor = signal<string>('');
  newImageUrl = signal<string>('');
  menuLinks = signal<string[]>([]);
  isUploadable = signal<boolean>(false);

  // Dynamically computed reactive data
  componentData = computed(() => ({
    id: this._component()?.id,
    text: this.newText(),
    color: this.newColor(),
    image: this.newImageUrl(),
    menuLinks: this.menuLinks(),
    uploadable: this.isUploadable(),
  }));

  constructor() {
    effect(() => {
      console.log('Updated component data:', this.componentData());
    });
  }

  isValid = computed(() => {
    const comp = this._component();
    if (!comp) return false;

    if (comp.uploadable && !this.newImageUrl()) return false;
    if (!this.newText().trim()) return false;

    return true;
  });

  updateText(event: any) {
    this.newText.set(event.target.value);
  }

  updateColor(event: any) {
    this.newColor.set(event.target.value);
  }

  handleImageUpload(imageUrl: string | any) {
    this.newImageUrl.set(imageUrl);
  }

  updateMenuLink(index: number, newText: string) {
    const links = [...this.menuLinks()];
    links[index] = newText;
    this.menuLinks.set(links);
  }

  applyChanges() {
    this.update.emit({
      [this._component()?.id]: this.componentData(),
    });
    this.close.emit();
  }
}
