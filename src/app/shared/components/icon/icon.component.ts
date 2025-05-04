import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
  styles: [
    `
      .icon-svg {
        display: block;
        vertical-align: middle;
        transition: transform 0.2s ease;

        @media (max-width: 1024px) {
          width: 20px;
          height: 20px;
        }
      }

      .fullscreen-icon {
        display: block;
        vertical-align: middle;
        transition: all 0.2s ease;

        @media (max-width: 1024px) {
          width: 28px;
          height: 28px;
        }
      }

      :host-context(.size-small) .icon-svg {
        width: 16px;
        height: 16px;
      }

      :host-context(.size-large) .icon-svg {
        width: 32px;
        height: 32px;
      }

      :host-context(.size-x-large) .icon-svg {
        width: 48px;
        height: 48px;
      }
    `,
  ],
})
export class IconComponent {
  @Input() name: string = '';
  @Input() width: string | number = 24;
  @Input() height: string | number = 24;
  @Input() viewBox: string | number = '0 0 24 24';
  @Input() set size(value: 'small' | 'medium' | 'large' | 'x-large' | null) {
    if (!value) return;

    switch (value) {
      case 'small':
        this.width = 16;
        this.height = 16;
        break;
      case 'large':
        this.width = 32;
        this.height = 32;
        break;
      case 'x-large':
        this.width = 48;
        this.height = 48;
        break;
      default: // medium
        this.width = 24;
        this.height = 24;
        break;
    }
  }

  getStrokeValue(): string {
    // Only exitFullscreen needs stroke attribute
    return this.name === 'exitFullscreen' ? 'currentColor' : 'none';
  }

  getStrokeWidth(): string {
    // Only exitFullscreen needs larger stroke width
    return this.name === 'exitFullscreen' ? '2' : '1.5';
  }
}
