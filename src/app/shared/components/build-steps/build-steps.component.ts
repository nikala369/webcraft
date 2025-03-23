import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-build-steps',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="build-steps">
      <div class="step" [class.active]="currentStep >= 1">
        <div class="step-number">1</div>
        <div class="step-label">{{ steps[0] }}</div>
      </div>
      <div class="step-connector" [class.active]="currentStep >= 2"></div>
      <div class="step" [class.active]="currentStep >= 2">
        <div class="step-number">2</div>
        <div class="step-label">{{ steps[1] }}</div>
      </div>
      <div class="step-connector" [class.active]="currentStep >= 3"></div>
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
        margin: 1.5rem auto 2.5rem;
        max-width: 800px;
        width: 100%;
      }

      .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        z-index: 1;
        transition: all 0.3s ease;
        opacity: 0.6;
      }

      .step.active {
        opacity: 1;
        transform: scale(1.05);
      }

      .step-number {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        margin-bottom: 8px;
        transition: all 0.3s ease;
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
      }

      .step-connector {
        height: 2px;
        background: rgba(255, 255, 255, 0.2);
        width: 80px;
        margin: 0 10px;
        position: relative;
        top: -10px;
        transition: all 0.3s ease;
      }

      .step-connector.active {
        background: rgba(40, 118, 255, 0.6);
        box-shadow: 0 0 10px rgba(40, 118, 255, 0.4);
      }

      @media (max-width: 768px) {
        .step-connector {
          width: 40px;
        }
      }
    `,
  ],
})
export class BuildStepsComponent {
  @Input() currentStep: number = 1;
  @Input() steps: string[] = [
    'Choose Plan',
    'Customize Design',
    'Publish Website',
  ];
}
