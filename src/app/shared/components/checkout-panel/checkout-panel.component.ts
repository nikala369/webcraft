import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout-panel',
  standalone: true,
  imports: [CommonModule],
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
        <button class="checkout-button" (click)="checkoutClicked.emit()">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18ZM7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L21.16 4.96L19.42 4H19.41L18.31 6L15.55 11H8.53L8.4 10.73L6.16 6L5.21 4L4.27 2H1V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.29 15 7.17 14.89 7.17 14.75Z"
              fill="currentColor"
            />
          </svg>
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
  @Output() checkoutClicked = new EventEmitter<void>();
}
