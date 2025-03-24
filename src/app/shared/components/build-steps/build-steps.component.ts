import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-build-steps',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="build-steps" [class.vertical]="vertical">
      <div class="step" [class.active]="currentStep >= 1">
        <div class="step-number">1</div>
        <div class="step-label">{{ steps[0] }}</div>
      </div>
      <div
        class="step-connector"
        [class.active]="currentStep >= 2"
        [class.vertical]="vertical"
      ></div>
      <div class="step" [class.active]="currentStep >= 2">
        <div class="step-number">2</div>
        <div class="step-label">{{ steps[1] }}</div>
      </div>
      <div
        class="step-connector"
        [class.active]="currentStep >= 3"
        [class.vertical]="vertical"
      ></div>
      <div class="step" [class.active]="currentStep >= 3">
        <div class="step-number">3</div>
        <div class="step-label">{{ steps[2] }}</div>
      </div>
    </div>
  `,
  styles: [
    `
      .build-steps {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 1rem auto 1.5rem;
        max-width: 600px;
        width: 100%;
        transition: all 0.3s ease;
        position: relative;
      }

      /* Vertical layout mode */
      .build-steps.vertical {
        flex-direction: column;
        width: 100%;
        height: auto;
        margin: 0;
        gap: 0;
        align-items: flex-start;
      }

      .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        z-index: 2;
        transition: all 0.3s ease;
        opacity: 0.7;
      }

      /* Horizontal layout for the step in vertical mode */
      .vertical .step {
        flex-direction: row;
        width: 100%;
        justify-content: flex-start;
        gap: 0rem;
        padding: 0.8rem 0;
      }

      .step.active {
        opacity: 1;
        transform: scale(1.05);
      }

      .vertical .step.active {
        opacity: 1;
        transform: translateX(3px);
      }

      .step-number {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        margin-bottom: 8px;
        transition: all 0.3s ease;
        font-size: 0.9rem;
        z-index: 3;
      }

      .vertical .step-number {
        margin-bottom: 0;
        width: 28px;
        height: 28px;
        font-size: 0.85rem;
      }

      .active .step-number {
        background: rgba(40, 118, 255, 0.2);
        border-color: #2876ff;
        box-shadow: 0 0 15px rgba(40, 118, 255, 0.5);
      }

      .step-label {
        font-size: 0.85rem;
        font-weight: 500;
        white-space: nowrap;

        margin-left: 0.5rem;
      }

      .vertical .step-label {
        font-size: 0.85rem;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.85);
      }

      .vertical .step.active .step-label {
        color: #fff;
      }

      .step-connector {
        height: 2px;
        background: rgba(255, 255, 255, 0.2);
        width: 60px;
        margin: 0 15px;
        position: relative;
        top: -15px;
        transition: all 0.3s ease;
        z-index: 1;
      }

      .step-connector.vertical {
        position: absolute;
        width: 2px;
        height: 25px;
        margin: 0;
        top: 42px;
        left: 14px;
        z-index: 1;
      }

      /* Position the second connector below the first one */
      .step-connector.vertical:nth-of-type(4) {
        top: 100px;
      }

      .step-connector.active {
        background: rgba(40, 118, 255, 0.6);
        box-shadow: 0 0 10px rgba(40, 118, 255, 0.4);
      }

      @media (max-width: 768px) {
        .build-steps {
          max-width: 100%;
          margin: 0.75rem auto 1.25rem;
        }

        .step-connector {
          width: 40px;
          margin: 0 8px;
        }

        .step-number {
          width: 28px;
          height: 28px;
          font-size: 0.8rem;
        }

        .step-label {
          font-size: 0.75rem;
        }
      }
    `,
  ],
})
export class BuildStepsComponent {
  @Input() currentStep: number = 1;
  @Input() vertical: boolean = false; // Controls layout direction
  @Input() steps: string[] = [
    'Choose Plan',
    'Customize Design',
    'Publish Website',
  ];
}
