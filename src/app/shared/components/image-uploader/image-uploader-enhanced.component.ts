import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import {
  ImageService,
  ImageData,
  ImageUploadProgress,
} from '../../../core/services/shared/image/image.service';

@Component({
  selector: 'app-image-uploader-enhanced',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="image-uploader"
      [ngClass]="{
        'drag-over': isDragOver(),
        'has-image': hasImage(),
        uploading: isUploading(),
        error: hasError()
      }"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
      (click)="triggerFileInput()"
    >
      <!-- Hidden file input -->
      <input
        #fileInput
        type="file"
        [accept]="acceptedTypes"
        (change)="onFileSelected($event)"
        class="file-input"
        style="display: none;"
      />

      <!-- Upload area -->
      <div class="upload-area" *ngIf="!hasImage() && !isUploading()">
        <div class="upload-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7,10 12,15 17,10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </div>
        <div class="upload-text">
          <p class="primary-text">
            <span *ngIf="!isDragOver()"
              >Drop an image here or click to browse</span
            >
            <span *ngIf="isDragOver()">Drop image to upload</span>
          </p>
          <p class="secondary-text">{{ uploadDescription }}</p>
          <p class="size-info">Max size: {{ maxFileSize }}MB</p>
        </div>
      </div>

      <!-- Upload progress -->
      <div class="upload-progress" *ngIf="isUploading()">
        <div class="progress-icon">
          <div class="spinner"></div>
        </div>
        <div class="progress-text">
          <p class="primary-text">Uploading {{ currentFileName }}...</p>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="uploadProgress()"></div>
          </div>
          <p class="secondary-text">{{ uploadProgress() }}% complete</p>
        </div>
      </div>

      <!-- Image preview -->
      <div class="image-preview" *ngIf="hasImage() && !isUploading()">
        <img [src]="imageUrl()" [alt]="imageFileName()" class="preview-image" />
        <div class="image-overlay">
          <div class="image-info">
            <p class="file-name">{{ imageFileName() }}</p>
            <p class="file-size" *ngIf="currentImageData()">
              {{ formatFileSize(getImageSize()) }}
            </p>
          </div>
          <div class="image-actions">
            <button
              type="button"
              class="btn-change"
              (click)="changeImage($event)"
              title="Change image"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                ></path>
                <path
                  d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                ></path>
              </svg>
            </button>
            <button
              type="button"
              class="btn-remove"
              (click)="removeImage($event)"
              title="Remove image"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <polyline points="3,6 5,6 21,6"></polyline>
                <path
                  d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Error message -->
      <div class="error-message" *ngIf="hasError()">
        <div class="error-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <p class="error-text">{{ errorMessage() }}</p>
        <button type="button" class="btn-retry" (click)="clearError()">
          Try Again
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./image-uploader-enhanced.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploaderEnhancedComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Input properties
  @Input() userTemplateId: string = '';
  @Input() sectionPath: string = '';
  @Input() fieldKey: string = '';
  @Input() currentValue: ImageData | string | null = null;
  @Input() placeholder: string = '';

  // Output events
  @Output() imageUploaded = new EventEmitter<ImageData>();
  @Output() imageRemoved = new EventEmitter<void>();
  @Output() uploadError = new EventEmitter<string>();

  // Injected services
  private imageService = inject(ImageService);
  private destroy$ = new Subject<void>();

  // Component state
  isDragOver = signal(false);
  isUploading = signal(false);
  uploadProgress = signal(0);
  currentFileName = signal('');
  currentImageData = signal<ImageData | null>(null);
  errorMessage = signal('');

  // Computed properties
  hasImage = computed(() => {
    return !!(this.currentImageData() || this.currentValue);
  });

  hasError = computed(() => {
    return this.errorMessage().length > 0;
  });

  imageUrl = computed(() => {
    const imageData = this.currentImageData();
    if (imageData) {
      return this.imageService.getImageUrl(imageData);
    }

    if (this.currentValue) {
      return this.imageService.getImageUrl(this.currentValue);
    }

    return this.placeholder;
  });

  imageFileName = computed(() => {
    const imageData = this.currentImageData();
    if (imageData) {
      return imageData.fileName;
    }

    if (this.currentValue && this.imageService.isImageData(this.currentValue)) {
      return this.currentValue.fileName;
    }

    return 'Image';
  });

  // Upload configuration
  get acceptedTypes(): string {
    const types = this.imageService.getSupportedTypes(
      this.sectionPath,
      this.fieldKey
    );
    return types.join(',');
  }

  get maxFileSize(): number {
    return this.imageService.getMaxFileSize(this.sectionPath, this.fieldKey);
  }

  get uploadDescription(): string {
    return this.imageService.getUploadDescription(
      this.sectionPath,
      this.fieldKey
    );
  }

  ngOnInit() {
    // Set current image data if we have a value
    if (this.currentValue) {
      if (this.imageService.isImageData(this.currentValue)) {
        this.currentImageData.set(this.currentValue);
      } else if (typeof this.currentValue === 'string') {
        // Convert legacy URL to ImageData format
        this.currentImageData.set(
          this.imageService.convertLegacyUrl(this.currentValue, 'Current Image')
        );
      }
    }

    // Subscribe to upload progress
    this.imageService.uploadProgress$
      .pipe(takeUntil(this.destroy$))
      .subscribe((progress: ImageUploadProgress | null) => {
        if (
          progress &&
          progress.sectionId === this.sectionPath &&
          progress.fieldKey === this.fieldKey
        ) {
          this.uploadProgress.set(progress.progress);
          this.currentFileName.set(progress.fileName);

          if (progress.status === 'uploading') {
            this.isUploading.set(true);
            this.clearError();
          } else if (progress.status === 'completed') {
            this.isUploading.set(false);
          } else if (progress.status === 'error') {
            this.isUploading.set(false);
            this.errorMessage.set(progress.error || 'Upload failed');
            this.uploadError.emit(progress.error || 'Upload failed');
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Drag and drop handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  // File input handlers
  triggerFileInput() {
    if (!this.isUploading() && !this.hasError()) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  // File handling
  private handleFile(file: File) {
    this.clearError();

    // Validate file first
    const validation = this.imageService.validateFile(
      file,
      this.sectionPath,
      this.fieldKey
    );
    if (!validation.isValid) {
      this.errorMessage.set(validation.error || 'Invalid file');
      this.uploadError.emit(validation.error || 'Invalid file');
      return;
    }

    // Start upload
    this.imageService
      .uploadImage(file, this.userTemplateId, this.sectionPath, this.fieldKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (imageData: ImageData) => {
          this.currentImageData.set(imageData);
          this.imageUploaded.emit(imageData);
          this.clearFileInput();
        },
        error: (error) => {
          console.error('Upload error:', error);
          this.errorMessage.set(error.message || 'Upload failed');
          this.uploadError.emit(error.message || 'Upload failed');
        },
      });
  }

  // Action handlers
  changeImage(event: Event) {
    event.stopPropagation();
    this.triggerFileInput();
  }

  removeImage(event: Event) {
    event.stopPropagation();
    this.currentImageData.set(null);
    this.clearFileInput();
    this.imageRemoved.emit();
  }

  clearError() {
    this.errorMessage.set('');
  }

  // Utility methods
  private clearFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  getImageSize(): number {
    // For now, return 0 as we don't track file size in ImageData
    // Could be enhanced to store file size in ImageData interface
    return 0;
  }

  formatFileSize(bytes: number): string {
    return this.imageService.formatFileSize(bytes);
  }
}
