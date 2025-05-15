import { Injectable, Signal, computed, inject, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeColorsService {
  // Define color values
  private _standardPrimaryColor = '#4a8dff';
  private _premiumPrimaryColor = '#9e6aff';

  // Plan signal
  private currentPlanSignal = signal<'standard' | 'premium'>('standard');

  // Computed primary color based on plan
  primaryColor: Signal<string> = computed(() => {
    return this.currentPlanSignal() === 'standard'
      ? this._standardPrimaryColor
      : this._premiumPrimaryColor;
  });

  // Shade generator for derived colors (lighter/darker)
  getColorShade(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);

    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;

    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 0 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    );
  }

  // Set the current plan
  setPlan(plan: 'standard' | 'premium'): void {
    console.log(`[ThemeColorsService] Setting plan to ${plan}`);
    this.currentPlanSignal.set(plan);
  }

  // Get plain color values for components that can't use signals
  getPrimaryColor(plan: 'standard' | 'premium'): string {
    return plan === 'standard'
      ? this._standardPrimaryColor
      : this._premiumPrimaryColor;
  }

  // Get color as RGBA
  getRgbaColor(color: string, alpha: number): string {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
