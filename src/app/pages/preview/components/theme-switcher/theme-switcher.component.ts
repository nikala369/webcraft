import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  computed,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../../core/services/theme/theme.service';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss',
})
export class ThemeSwitcherComponent implements OnInit {
  private themeService = inject(ThemeService);

  themes = signal<{ id: number; name: string }[]>([]);
  dropdownOpen = signal(false);
  private planSignal = signal<'standard' | 'premium'>('standard');
  @Input() defaultThemeId?: number;

  @Input() set plan(value: 'standard' | 'premium') {
    this.planSignal.set(value);
    // Load available themes when plan changes
    this.loadThemesForPlan(value);
  }

  @Output() themeChange = new EventEmitter<number>();

  // Filtered themes based on the selected plan
  filteredThemes = computed(() => {
    return this.themes();
  });

  selectedTheme = signal<{ id: number; name: string }>({
    id: 0,
    name: 'Loading...',
  });

  constructor() {
    // Update selected theme when plan changes
    effect(() => {
      const plan = this.planSignal();
      // This will trigger loadThemesForPlan which will set the first theme
    });
  }

  ngOnInit() {
    // Load initial themes for current plan
    this.loadThemesForPlan(this.planSignal());
  }

  private loadThemesForPlan(plan: 'standard' | 'premium') {
    // TEMPORARY: Mock themes until service is working
    const mockThemes = {
      standard: [
        { id: 1, name: 'Light Theme', planType: 'standard' },
        { id: 2, name: 'Dark Theme', planType: 'standard' },
      ],
      premium: [
        { id: 1, name: 'Light Theme', planType: 'standard' },
        { id: 2, name: 'Dark Theme', planType: 'standard' },
        { id: 3, name: 'Blue Theme', planType: 'premium' },
        { id: 4, name: 'Forest Theme', planType: 'premium' },
      ],
    };

    this.themeService.getAvailableThemes(plan).subscribe({
      next: (themes) => {
        this.themes.set(themes);

        // If defaultThemeId is provided, select that theme
        if (this.defaultThemeId) {
          const defaultTheme = themes.find(
            (theme) => theme.id === this.defaultThemeId
          );
          if (defaultTheme) {
            this.selectedTheme.set(defaultTheme);
            this.themeChange.emit(defaultTheme.id);
            return;
          }
        }

        // Otherwise, select the first theme as default
        if (themes.length > 0) {
          this.selectedTheme.set(themes[0]);
          this.themeChange.emit(themes[0].id);
        }
      },
      error: (err) => {
        console.warn('Theme service not available yet, using mock data', err);
        // Use mock themes when service fails
        const themesForPlan = mockThemes[plan];
        this.themes.set(themesForPlan);

        // If defaultThemeId is provided, select that theme
        if (this.defaultThemeId) {
          const defaultTheme = themesForPlan.find(
            (theme) => theme.id === this.defaultThemeId
          );
          if (defaultTheme) {
            this.selectedTheme.set(defaultTheme);
            this.themeChange.emit(defaultTheme.id);
            return;
          }
        }

        if (themesForPlan.length > 0) {
          this.selectedTheme.set(themesForPlan[0]);
          this.themeChange.emit(themesForPlan[0].id);
        }
      },
    });
  }

  toggleDropdown() {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  selectTheme(theme: { id: number; name: string }) {
    this.selectedTheme.set(theme);
    this.themeChange.emit(theme.id);
    this.dropdownOpen.set(false);
  }
}
