import { Injectable, inject, OnDestroy, effect } from '@angular/core';
import { BehaviorSubject, fromEvent, Subject, timer } from 'rxjs';
import { takeUntil, throttleTime } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class SessionService implements OnDestroy {
  private readonly authService = inject(AuthService);

  // Default timeout duration in milliseconds (30 minutes)
  private readonly DEFAULT_TIMEOUT = 30 * 60 * 1000;

  // Time until warning in milliseconds (1 minute before timeout)
  private readonly WARNING_BEFORE_TIMEOUT = 1 * 60 * 1000;

  // Timer reference
  private timeoutId: any;

  // Warning state
  private warningSubject = new BehaviorSubject<boolean>(false);
  public warning$ = this.warningSubject.asObservable();

  // Component destroyer
  private destroy$ = new Subject<void>();

  constructor() {
    // Start monitoring activity when the service is created
    this.initActivityMonitoring();

    // Watch for authentication state changes using effect
    effect(() => {
      const isAuthenticated = this.authService.isAuthenticated();
      if (isAuthenticated) {
        this.resetTimer();
      } else {
        this.clearTimer();
        this.warningSubject.next(false);
      }
    });
  }

  /**
   * Start monitoring user activity
   */
  private initActivityMonitoring(): void {
    // Monitor for user activity if authenticated
    if (this.authService.isAuthenticated()) {
      this.resetTimer();

      // Monitor for user activity
      fromEvent(document, 'mousemove')
        .pipe(
          throttleTime(1000), // Throttle to avoid excessive processing
          takeUntil(this.destroy$)
        )
        .subscribe(() => this.resetTimer());

      fromEvent(document, 'keypress')
        .pipe(throttleTime(1000), takeUntil(this.destroy$))
        .subscribe(() => this.resetTimer());

      fromEvent(document, 'click')
        .pipe(throttleTime(1000), takeUntil(this.destroy$))
        .subscribe(() => this.resetTimer());

      // Also reset timer on focus
      fromEvent(window, 'focus')
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.resetTimer());
    }
  }

  /**
   * Reset the inactivity timer
   */
  public resetTimer(): void {
    this.clearTimer();
    this.warningSubject.next(false);

    // Set warning timer
    timer(this.DEFAULT_TIMEOUT - this.WARNING_BEFORE_TIMEOUT)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.warningSubject.next(true);
      });

    // Set timeout timer
    this.timeoutId = setTimeout(() => {
      if (this.authService.isAuthenticated()) {
        console.log('Session expired due to inactivity.');
        this.warningSubject.next(false);
        this.authService.logout();
      }
    }, this.DEFAULT_TIMEOUT);
  }

  /**
   * Clear the inactivity timer
   */
  private clearTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Clean up resources
   */
  ngOnDestroy(): void {
    this.clearTimer();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
