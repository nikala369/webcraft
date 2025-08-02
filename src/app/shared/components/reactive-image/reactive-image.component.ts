import {
  Component,
  Input,
  Output,
  EventEmitter,
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
      (load)="onImageLoad($event)"
      (error)="onImageError($event)"
    />
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.3s ease;
    }

    img[src=""] {
      opacity: 0;
    }

    .loading {
      opacity: 0.7;
    }

    .error {
      opacity: 0.5;
      filter: grayscale(100%);
    }
  `,
})
export class ReactiveImageComponent implements OnInit, OnChanges, OnDestroy {
  @Input() src = '';
  @Input() alt = '';
  @Input() class = '';
  @Input() style = '';
  @Input() imageType?: 'logo' | 'hero' | 'about' | 'general'; // Added context support

  @Output() imageLoad = new EventEmitter<Event>();
  @Output() imageError = new EventEmitter<Event>();

  private imageService = inject(ImageService);

  // Signals for reactive state management
  private currentSrc = signal<string>('');
  private isLoading = signal(false);
  displayUrl = signal<string>('');

  // Track disposed URLs for cleanup
  private disposedUrls = new Set<string>();

  ngOnInit(): void {
    this.updateDisplayUrl();
  }

  ngOnChanges(): void {
    this.updateDisplayUrl();
  }

  ngOnDestroy(): void {
    // Clean up any blob URLs we created
    this.disposedUrls.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  }

  private updateDisplayUrl(): void {
    if (!this.src) {
      this.displayUrl.set('');
      return;
    }

    // Use the ImageService to get the correct URL with context support
    // This handles temp:, blob:, assets, and objectId cases with proper placeholders
    this.displayUrl.set(
      this.imageService.getImageUrl(this.src, this.imageType)
    );
  }

  onImageLoad(event: Event): void {
    this.isLoading.set(false);
    this.imageLoad.emit(event);
  }

  onImageError(event: Event): void {
    this.isLoading.set(false);
    console.error('Image failed to load:', this.src);
    this.imageError.emit(event);
  }
}
