import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-uploader.component.html',
  styleUrl: './image-uploader.component.scss',
})
export class ImageUploaderComponent {
  @Output() uploaded = new EventEmitter<File>();

  imageSrc: string | null = null;
  errorMessage: string | null = null;
  private currentFile: File | null = null;

  handleFileInput(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      const file = element.files[0];

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        this.errorMessage =
          'Invalid file type. Please upload a JPEG, PNG, GIF, or WEBP image.';
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        this.errorMessage = 'File is too large. Maximum size is 5MB.';
        return;
      }

      // Clear any previous errors
      this.errorMessage = null;
      this.currentFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imageSrc = e.target?.result as string;
        this.uploaded.emit(file);
      };
      reader.readAsDataURL(file);
    }
  }

  clearImage(): void {
    this.imageSrc = null;
    this.currentFile = null;
    this.errorMessage = null;
    this.uploaded.emit(null as any);
  }
}
