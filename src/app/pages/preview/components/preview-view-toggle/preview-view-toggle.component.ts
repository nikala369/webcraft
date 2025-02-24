import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-preview-view-toggle',
  standalone: true,
  imports: [],
  templateUrl: './preview-view-toggle.component.html',
  styleUrl: './preview-view-toggle.component.scss'
})
export class PreviewViewToggleComponent {
  @Output() viewChange = new EventEmitter<'desktop' | 'mobile'>();

  toggleView(view: 'desktop' | 'mobile') {
    this.viewChange.emit(view);
  }
}
