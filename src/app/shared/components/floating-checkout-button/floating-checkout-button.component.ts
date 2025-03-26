import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-floating-checkout-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  animations: [
    trigger('slideInOut', [
      state(
        'void',
        style({
          transform: 'translateY(100%)',
          opacity: 0,
        })
      ),
      state(
        '*',
        style({
          transform: 'translateY(0)',
          opacity: 1,
        })
      ),
      transition('void => *', [animate('300ms ease-out')]),
      transition('* => void', [animate('200ms ease-in')]),
    ]),
  ],
  template: `
    <div class="floating-checkout-wrapper" @slideInOut>
      <button
        class="floating-checkout-button"
        (click)="checkoutClicked.emit()"
        [class.pulse]="pulsing"
      >
        <app-icon name="publish" width="20" height="20"></app-icon>
        {{ buttonText }}
      </button>
    </div>
  `,
  styles: [
    `
      .floating-checkout-wrapper {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 9999; /* Very high z-index to ensure it's above everything */
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        pointer-events: auto;
      }

      .floating-checkout-button {
        background: #4caf50;
        color: white;
        border: none;
        padding: 14px 26px;
        border-radius: 30px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        white-space: nowrap;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
      }

      .floating-checkout-button:hover {
        background: #43a047;
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.35);
      }

      .floating-checkout-button.pulse {
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
        }
        70% {
          box-shadow: 0 0 0 15px rgba(76, 175, 80, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
        }
      }

      @media (max-width: 768px) {
        .floating-checkout-wrapper {
          bottom: 20px;
          right: 15px;
          left: 15px;
          align-items: stretch;
        }

        .floating-checkout-button {
          width: 100%;
          justify-content: center;
          padding: 12px 20px;
          font-size: 0.95rem;
        }
      }
    `,
  ],
})
export class FloatingCheckoutButtonComponent {
  @Input() buttonText: string = 'Publish Website';
  @Input() showTooltip: boolean = false; // Default to false
  @Input() pulsing: boolean = true;
  @Output() checkoutClicked = new EventEmitter<void>();
}
