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
        display: inline-block;
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 1px;
        white-space: nowrap;
        transition: all 0.3s ease;
        text-align: center;
      }

      .standard {
        background: rgba(40, 118, 255, 0.2);
        border: 1px solid rgba(40, 118, 255, 0.4);
        color: #2876ff;
        box-shadow: 0 0 15px rgba(40, 118, 255, 0.3);
      }

      .premium {
        background: rgba(140, 82, 255, 0.2);
        border: 1px solid rgba(140, 82, 255, 0.4);
        color: #8c52ff;
        box-shadow: 0 0 15px rgba(140, 82, 255, 0.3);
      }

      @media (max-width: 768px) {
        .plan-badge {
          font-size: 0.7rem;
          padding: 4px 12px;
        }
      }
    `,
  ],
})
export class PlanBadgeComponent {
  @Input() plan: 'standard' | 'premium' = 'standard';
}
