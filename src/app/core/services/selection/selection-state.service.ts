import { Injectable } from '@angular/core';

export interface SelectionState {
  businessType?: string;
  planType?: string;
  templateId?: string;
  timestamp: number;
}

/**
 * Service to persist user selections across authentication flow
 * Stores the state of template selection when users navigate to login/register
 */
@Injectable({
  providedIn: 'root',
})
export class SelectionStateService {
  private readonly STORAGE_KEY = 'webcraft_selection_state';

  /**
   * Save user selections to localStorage
   * @param businessType Selected business type
   * @param planType Selected plan type (standard/premium)
   * @param templateId Optional template ID if selected
   */
  saveSelections(
    businessType?: string,
    planType?: string,
    templateId?: string
  ): void {
    if (!businessType && !planType && !templateId) {
      // If no selections provided, clear the state
      this.clearSelections();
      return;
    }

    const state: SelectionState = {
      timestamp: Date.now(),
    };

    if (businessType) state.businessType = businessType;
    if (planType) state.planType = planType;
    if (templateId) state.templateId = templateId;

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    console.log('Saved selection state:', state);
  }

  /**
   * Retrieve saved selections
   * @returns The saved selection state or empty object if none exists
   */
  getSelections(): SelectionState {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (!data) return { timestamp: 0 };

    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Error parsing selection state:', e);
      return { timestamp: 0 };
    }
  }

  /**
   * Check if selections were saved recently (within the specified time window)
   * @param maxAgeMs Maximum age in milliseconds (default: 30 minutes)
   */
  hasRecentSelections(maxAgeMs: number = 30 * 60 * 1000): boolean {
    const selections = this.getSelections();
    if (!selections.timestamp) return false;

    // Check if selections are recent enough
    const age = Date.now() - selections.timestamp;
    return (
      age < maxAgeMs && (!!selections.businessType || !!selections.planType)
    );
  }

  /**
   * Clear all saved selections
   */
  clearSelections(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('Cleared selection state');
  }
}
