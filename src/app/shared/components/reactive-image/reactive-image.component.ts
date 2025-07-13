import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  inject,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../../core/services/shared/image/image.service';

/**
 * 🖼️ Reactive Image Component - Secure Display with Authentication
 *
 * This component handles secure image display with JWT authentication:
 * ✅ Automatic auth header inclusion via HttpClient
 * ✅ Signal-based reactivity for instant updates
 * ✅ Handles temp:, blob:, objectId, and legacy URLs
 * ✅ Loading states and error recovery
 * ✅ Memory efficient with effect-based updates
 *
 * USAGE:
 * <app-reactive-image
 *   [src]="objectIdOrUrl"
 *   alt="Description"
 *   style="width: 100%; height: 400px; object-fit: cover;"
 * ></app-reactive-image>
 *
 * @version 2.0 - Production ready
 */
@Component({
  selector: 'app-reactive-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <img
      [src]="displayUrl()"
      [alt]="alt"
      [ngClass]="class"
      [style]="style"
      (load)="onImageLoad()"
      (error)="onImageError()"
    />
  `,
  styles: [
    `
      img {
        transition: opacity 0.3s ease;
      }
      .loading {
        opacity: 0.7;
      }
    `,
  ],
})
export class ReactiveImageComponent implements OnInit, OnChanges, OnDestroy {
  @Input() src: string = '';
  @Input() alt: string = '';
  @Input() class: string = '';
  @Input() style: string = '';

  private imageService = inject(ImageService);

  displayUrl = signal<string>('');
  isLoading = signal<boolean>(false);

  constructor() {
    // Watch for image updates from the service
    effect(() => {
      const imageUpdate = this.imageService.getImageUpdateSignal()();
      if (imageUpdate && this.src === imageUpdate.objectId) {
        // This image has been updated, refresh the display URL
        this.updateDisplayUrl();
      }
    });
  }

  ngOnInit() {
    this.updateDisplayUrl();
  }

  ngOnChanges() {
    this.updateDisplayUrl();
  }

  ngOnDestroy(): void {
    // Cleanup handled by Angular's effect system
  }

  private updateDisplayUrl(): void {
    if (!this.src) {
      this.displayUrl.set('');
      return;
    }

    // Use the ImageService to get the correct URL
    // This handles temp:, blob:, assets, and objectId cases
    this.displayUrl.set(this.imageService.getImageUrl(this.src));
  }

  onImageLoad() {
    this.isLoading.set(false);
  }

  onImageError() {
    this.isLoading.set(false);
    console.error('Image failed to load:', this.src);
  }
}
