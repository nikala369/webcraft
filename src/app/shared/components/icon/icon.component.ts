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
        transition: transform 0.2s ease;

        @media (max-width: 1024px) {
          width: 20px;
          height: 20px;
        }
      }

      .fullscreen-icon {
        transition: all 0.2s ease;

        @media (max-width: 1024px) {
          width: 28px;
          height: 28px;
        }
      }
    `,
  ],
})
export class IconComponent {
  @Input() name: string = '';
  @Input() width: string | number = 28;
  @Input() height: string | number = 28;

  getStrokeValue(): string {
    // Only exitFullscreen needs stroke attribute
    return this.name === 'exitFullscreen' ? 'currentColor' : 'none';
  }

  getStrokeWidth(): string {
    // Only exitFullscreen needs larger stroke width
    return this.name === 'exitFullscreen' ? '2' : '1.5';
  }
}
