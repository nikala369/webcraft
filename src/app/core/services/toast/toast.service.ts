import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor() {}

  /**
   * Show a success toast message
   */
  success(message: string): void {
    console.log('✅ Success:', message);
    this.showAlert('✅ ' + message);
  }

  /**
   * Show an error toast message
   */
  error(message: string): void {
    console.error('❌ Error:', message);
    this.showAlert('❌ ' + message);
  }

  /**
   * Show an info toast message
   */
  info(message: string): void {
    console.info('ℹ️ Info:', message);
    this.showAlert('ℹ️ ' + message);
  }

  /**
   * Show a warning toast message
   */
  warning(message: string): void {
    console.warn('⚠️ Warning:', message);
    this.showAlert('⚠️ ' + message);
  }

  /**
   * Temporary implementation showing a browser alert
   * This will be replaced with a proper toast component later
   */
  private showAlert(message: string): void {
    // Only show alert in development
    if (typeof window !== 'undefined') {
      // Use a nicer toast/notification when available
      // For now, just console.log
      // alert(message);
    }
  }
}
