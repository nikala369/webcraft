import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [],
  templateUrl: './image-uploader.component.html',
  styleUrl: './image-uploader.component.scss'
})
export class ImageUploaderComponent {
  @Output() uploaded = new EventEmitter<File>();

  handleFileInput(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploaded.emit(file);
    }
  }
}
