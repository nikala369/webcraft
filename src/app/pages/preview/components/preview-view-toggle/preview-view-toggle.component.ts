// preview-view-toggle.component.ts
import { Component, EventEmitter, Output, signal, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-preview-view-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-view-toggle.component.html',
  styleUrl: './preview-view-toggle.component.scss'
})
export class PreviewViewToggleComponent {
  @Output() viewChange = new EventEmitter<'desktop' | 'mobile'>();
  activeView = signal<'desktop' | 'mobile'>('desktop');
  isMobileDevice = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobileDevice = window.matchMedia('(max-width: 768px)').matches;
      if (this.isMobileDevice) {
        this.activeView.set('mobile');
      }
    }
  }

  toggleView(view: 'desktop' | 'mobile') {
    if (this.isMobileDevice) return; // Prevent changing on mobile
    this.activeView.set(view);
    this.viewChange.emit(view);
  }
}
