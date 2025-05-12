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
      [class.clickable]="canUpgrade()"
      [routerLink]="canUpgrade() ? ['/pricing'] : null"
      [title]="canUpgrade() ? 'Click to upgrade your plan' : 'Your current plan'"
    >
      <span class="plan-name">{{ displayPlan }}</span>
      <!-- Optional: Add back upgrade arrow if desired -->
      <!-- <span class="upgrade-indicator" *ngIf="canUpgrade()">↗</span> -->
    </div>
  `,
  styles: [
    `
      .plan-badge {
        display: inline-block; /* Changed from inline-flex */
        padding: 5px 15px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        letter-spacing: 1px;
        white-space: nowrap;
        transition: all 0.3s ease;
        text-align: center;
        cursor: default; /* Default cursor */
      }

      /* Add pointer cursor only when clickable */
      .plan-badge.clickable {
        cursor: pointer;
      }

      .standard {
        background: rgba(40, 118, 255, 0.2); /* Style from v2 */
        border: 1px solid rgba(40, 118, 255, 0.4); /* Style from v2 */
        color: #2876ff; /* Style from v2 */
        box-shadow: 0 0 15px rgba(40, 118, 255, 0.3); /* Style from v2 */
      }

      .premium {
        background: rgba(140, 82, 255, 0.2); /* Style from v2 */
        border: 1px solid rgba(140, 82, 255, 0.4); /* Style from v2 */
        color: #8c52ff; /* Style from v2 */
        box-shadow: 0 0 15px rgba(140, 82, 255, 0.3); /* Style from v2 */
      }

      /* Hover effect only when clickable */
      .plan-badge.standard.clickable:hover {
        /* Slightly adjust background/shadow on hover for feedback */
        background: rgba(40, 118, 255, 0.3);
        box-shadow: 0 0 20px rgba(40, 118, 255, 0.4);
      }

      .plan-badge.premium.clickable:hover {
        /* Slightly adjust background/shadow on hover for feedback */
        background: rgba(140, 82, 255, 0.3);
        box-shadow: 0 0 20px rgba(140, 82, 255, 0.4);
      }

      /* Optional: Styles for upgrade indicator if you re-add it */
      /*
      .upgrade-indicator {
        margin-left: 4px;
        font-weight: bold;
        display: inline-block; // Ensure it aligns correctly
      }
      */

      /* Responsive styles from v2 */
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
  @Input() plan: string = 'standard';
  private authService = inject(AuthService);

  // Use more user-friendly display names
  get displayPlan(): string {
    switch (this.plan?.toLowerCase()) {
      case 'premium':
        return 'Premium Pro';
      case 'standard':
        return 'Premium Plan';
      default:
        return 'Unknown Plan';
    }
  }

  // CSS class based on plan
  getPlanClass(): string {
    return this.plan?.toLowerCase() === 'premium' ? 'premium' : 'standard';
  }

  // Determine if the badge should link to upgrade
  canUpgrade(): boolean {
    // Only allow upgrade if authenticated AND on the standard/free plan
    return this.authService.isAuthenticated() && this.plan?.toLowerCase() !== 'premium';
  }
}
