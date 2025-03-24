import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-checkout-panel',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="checkout-section">
      <div class="checkout-card">
        <div class="checkout-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
              fill="#4CAF50"
            />
          </svg>
        </div>
        <div class="checkout-content">
          <h3>{{ title }}</h3>
          <p>{{ description }}</p>
        </div>
        <button
          *ngIf="showButton"
          class="checkout-button"
          (click)="checkoutClicked.emit()"
        >
          <app-icon name="cart" width="18" height="18"></app-icon>
          {{ buttonText }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .checkout-section {
        width: 100%;
        max-width: 800px;
        margin: auto;
        margin-top: 70px;
        margin-bottom: 30px;
      }

      .checkout-card {
        background: linear-gradient(
          135deg,
          rgba(40, 118, 255, 0.1),
          rgba(140, 82, 255, 0.1)
        );
        border: 1px solid rgba(40, 118, 255, 0.3);
        border-radius: 12px;
        padding: 2rem;
        display: flex;
        align-items: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        animation: fadeIn 0.6s ease-in-out;
      }

      @media (max-width: 768px) {
        .checkout-card {
          flex-direction: column;
          text-align: center;
          padding: 1.5rem;
        }
      }

      .checkout-icon {
        margin-right: 1.5rem;
      }

      @media (max-width: 768px) {
        .checkout-icon {
          margin-right: 0;
          margin-bottom: 1rem;
        }
      }

      .checkout-content {
        flex: 1;
      }

      h3 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: #ffffff;
      }

      p {
        color: rgba(255, 255, 255, 0.8);
        margin-bottom: 0;
        font-size: 1rem;
        line-height: 1.5;
      }

      .checkout-button {
        background: #4caf50;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-left: 1.5rem;
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
      }

      @media (max-width: 768px) {
        .checkout-button {
          margin-left: 0;
          margin-top: 1.5rem;
          width: 100%;
          justify-content: center;
        }
      }

      .checkout-button:hover {
        background: #43a047;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
      }

      @keyframes fadeIn {
        0% {
          opacity: 0;
          transform: translateY(20px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class CheckoutPanelComponent {
  @Input() title: string = 'Your Website Is Ready!';
  @Input() description: string =
    'Your design has been saved. Complete the checkout process to publish your website and make it live.';
  @Input() buttonText: string = 'Proceed to Checkout';
  @Input() showButton: boolean = true;
  @Output() checkoutClicked = new EventEmitter<void>();
}
