import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '../../../core/services/auth/session.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-session-timeout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showWarning" class="timeout-modal-overlay">
      <div class="timeout-modal">
        <div class="timeout-modal-header">
          <h2>Session Timeout</h2>
        </div>
        <div class="timeout-modal-body">
          <p>Your session is about to expire due to inactivity.</p>
          <p>You will be logged out in about 1 minute.</p>
        </div>
        <div class="timeout-modal-footer">
          <button class="btn-secondary" (click)="logout()">Logout Now</button>
          <button class="btn-primary" (click)="continueSession()">
            Continue Session
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .timeout-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }

      .timeout-modal {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        width: 90%;
        max-width: 400px;
        overflow: hidden;
        animation: fadeIn 0.3s;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .timeout-modal-header {
        background-color: var(--primary-color, #3b82f6);
        color: white;
        padding: 1rem 1.5rem;
      }

      .timeout-modal-header h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 500;
      }

      .timeout-modal-body {
        padding: 1.5rem;
      }

      .timeout-modal-body p {
        margin: 0 0 0.75rem;
        color: var(--text-color, #1e293b);
      }

      .timeout-modal-footer {
        padding: 1rem 1.5rem;
        background-color: var(--bg-muted-color, #f8fafc);
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }

      .btn-primary,
      .btn-secondary {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-weight: 500;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background-color 0.2s;
        border: none;
      }

      .btn-primary {
        background-color: var(--primary-color, #3b82f6);
        color: white;
      }

      .btn-primary:hover {
        background-color: var(--primary-color-hover, #2563eb);
      }

      .btn-secondary {
        background-color: var(--bg-muted-color, #f1f5f9);
        color: var(--text-color, #1e293b);
      }

      .btn-secondary:hover {
        background-color: var(--bg-muted-hover-color, #e2e8f0);
      }
    `,
  ],
})
export class SessionTimeoutComponent implements OnInit, OnDestroy {
  private sessionService = inject(SessionService);
  private authService = inject(AuthService);

  showWarning = false;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Subscribe to the warning state
    this.sessionService.warning$
      .pipe(takeUntil(this.destroy$))
      .subscribe((warning) => {
        this.showWarning = warning;
      });
  }

  continueSession(): void {
    // Reset the session timer
    this.sessionService.resetTimer();
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
