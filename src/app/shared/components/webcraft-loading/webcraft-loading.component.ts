import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-webcraft-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './webcraft-loading.component.html',
  styleUrls: ['./webcraft-loading.component.scss'],
})
export class WebcraftLoadingComponent implements OnInit {
  // CSS class for custom animation state (e.g. 'fade-out')
  @Input() overlayClass: string = '';
  // Whether to show the overlay (parent controls via *ngIf)
  @Input() showLoadingOverlay: boolean = false;
  // Delay in milliseconds before starting the fade‑out
  @Input() delay: number = 0;

  // Emit an event when the overlay is finished (after fade‑out)
  @Output() finished = new EventEmitter<void>();

  ngOnInit(): void {
    if (this.delay > 0) {
      setTimeout(() => {
        this.overlayClass = 'fade-out';
        // Listen for animation end
        const overlayEl = document.querySelector('.start-overlay');
        overlayEl?.addEventListener('animationend', () => {
          this.finished.emit();
        });
      }, this.delay);
    }
  }
}
