import {Injectable, signal} from '@angular/core';

/**
 * A simple interface for a confirmation/toast message.
 * You can extend this with optional icons, actions, etc.
 */
export interface Confirmation {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  // Signal holding an array of active confirmations
  private confirmationsSignal = signal<Confirmation[]>([]);

  // A read-only view of the current confirmations
  get confirmations() {
    return this.confirmationsSignal.asReadonly();
  }

  // Show a new confirmation message
  showConfirmation(
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success',
    durationMs: number = 3000
  ): void {
    // Generate a unique ID for this toast
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const newConfirmation: Confirmation = { id, message, type };

    // Add to the list
    this.confirmationsSignal.update((list) => [...list, newConfirmation]);

    // Automatically remove after the given duration
    setTimeout(() => {
      this.removeConfirmation(id);
    }, durationMs);
  }

  // Manually remove a confirmation
  removeConfirmation(id: number) {
    this.confirmationsSignal.update((list) =>
      list.filter((item) => item.id !== id)
    );
  }
}
