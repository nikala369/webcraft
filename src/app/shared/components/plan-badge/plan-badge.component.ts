import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plan-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="plan-badge"
      [class.premium]="plan === 'premium'"
      [class.standard]="plan === 'standard'"
    >
      {{ plan | uppercase }} PLAN
    </div>
  `,
  styles: [
    `
      .plan-badge {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 6px 15px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 1.2px;
        white-space: nowrap;
        transition: all 0.3s ease;
        text-align: center;
        min-width: 120px;
        height: 32px;
      }

      .standard {
        background: rgba(40, 118, 255, 0.15);
        border: 1px solid rgba(40, 118, 255, 0.5);
        color: #4a8dff;
        box-shadow: 0 0 15px rgba(40, 118, 255, 0.3),
          inset 0 0 10px rgba(40, 118, 255, 0.05);
      }

      .premium {
        background: rgba(140, 82, 255, 0.15);
        border: 1px solid rgba(140, 82, 255, 0.5);
        color: #9e6aff;
        box-shadow: 0 0 15px rgba(140, 82, 255, 0.3),
          inset 0 0 10px rgba(140, 82, 255, 0.05);
      }

      @media (max-width: 768px) {
        .plan-badge {
          font-size: 0.75rem;
          padding: 5px 12px;
          min-width: 100px;
          height: 28px;
        }
      }
    `,
  ],
})
export class PlanBadgeComponent {
  @Input() plan: 'standard' | 'premium' = 'standard';
}
