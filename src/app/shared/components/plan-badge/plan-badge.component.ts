import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-plan-badge',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div
      class="plan-badge"
      [ngClass]="getPlanClass()"
      [routerLink]="canUpgrade() ? ['/pricing'] : null"
      [title]="canUpgrade() ? 'Click to upgrade' : 'Current plan'"
    >
      <span class="plan-name">{{ displayPlan }}</span>
      <span class="upgrade-indicator" *ngIf="canUpgrade()">↗</span>
    </div>
  `,
  styles: [
    `
      .plan-badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .standard {
        background-color: #e3f2fd;
        color: #0984e3;
        border: 1px solid #bbdefb;
      }

      .standard:hover {
        background-color: #bbdefb;
      }

      .premium {
        background-color: #f3e5f5;
        color: #9e6aff;
        border: 1px solid #e1bee7;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .premium:hover {
        background-color: #e1bee7;
      }

      .upgrade-indicator {
        margin-left: 4px;
        font-weight: bold;
      }
    `,
  ],
})
export class PlanBadgeComponent {
  @Input() plan: string = 'standard';
  private router = inject(Router);
  private authService = inject(AuthService);

  get displayPlan(): string {
    return this.plan === 'premium' ? 'Premium' : 'Free Plan';
  }

  getPlanClass(): string {
    return this.plan === 'premium' ? 'premium' : 'standard';
  }

  canUpgrade(): boolean {
    // Only show upgrade option if authenticated and on standard plan
    return this.authService.isAuthenticated() && this.plan !== 'premium';
  }
}
