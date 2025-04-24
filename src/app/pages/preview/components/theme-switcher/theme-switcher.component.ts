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
import { ThemeColorsService } from '../../../../core/services/theme/theme-colors.service';
import {
  PageResponse,
  TemplateSearch,
  TemplateService,
} from '../../../../core/services/template/template.service';
import { catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

// Update interface to use string IDs for compatibility with UUIDs
export interface ThemeListItem {
  id: string;
  name: string;
  planType: 'standard' | 'premium';
  businessType: string;
  description?: string;
}

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss',
})
export class ThemeSwitcherComponent implements OnInit {
  private themeService = inject(ThemeService);
  private themeColorsService = inject(ThemeColorsService);
  private templateService = inject(TemplateService);

  themes = signal<ThemeListItem[]>([]);
  dropdownOpen = signal(false);
  private planSignal = signal<'standard' | 'premium'>('standard');
  private businessTypeSignal = signal<string>('');
  @Input() defaultThemeId?: string;
  accentColor = '';

  // Allow passing in pre-filtered themes
  @Input() set availableThemes(value: any[]) {
    if (value && value.length > 0) {
      console.log('Using provided available themes:', value);
      // Convert API template format to ThemeListItem format if needed
      if (value[0] && 'templateType' in value[0]) {
        // This is coming from the API directly
        const mappedThemes: ThemeListItem[] = value.map((template: any) => ({
          id: template.id,
          name: template.name,
          planType:
            template.templatePlan?.type === 'PREMIUM'
              ? 'premium'
              : ('standard' as 'standard' | 'premium'),
          businessType: template.templateType?.key || '',
          description: template.description,
        }));
        this.themes.set(mappedThemes);
      } else {
        // Already in the correct format
        this.themes.set(value as ThemeListItem[]);
      }

      // Select default theme
      this.selectDefaultTheme(this.themes());
    }
  }

  @Input() set plan(value: 'standard' | 'premium') {
    this.planSignal.set(value);

    // Update accent color based on plan
    this.accentColor = this.themeColorsService.getPrimaryColor(value);
    document.documentElement.style.setProperty(
      '--theme-accent-color',
      this.accentColor
    );
  }

  @Input() set businessType(value: string) {
    if (value !== this.businessTypeSignal()) {
      this.businessTypeSignal.set(value);
      console.log(`ThemeSwitcher: Business type changed to ${value}`);
    }
  }

  @Output() themeChange = new EventEmitter<string>();

  // Filtered themes based on the selected plan
  filteredThemes = computed(() => {
    return this.themes();
  });

  selectedTheme = signal<ThemeListItem>({
    id: '0',
    name: 'Loading...',
    planType: 'standard',
    businessType: '',
  });

  constructor() {
    // Update selected theme when plan or business type changes
    effect(() => {
      const plan = this.planSignal();
      const businessType = this.businessTypeSignal();
      // This will trigger theme loading if needed
    });
  }

  ngOnInit() {
    // Set initial accent color
    this.accentColor = this.themeColorsService.getPrimaryColor(
      this.planSignal()
    );
    document.documentElement.style.setProperty(
      '--theme-accent-color',
      this.accentColor
    );
  }

  /**
   * Select the default theme based on defaultThemeId or first available theme
   */
  private selectDefaultTheme(themes: ThemeListItem[]): void {
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
  }

  toggleDropdown() {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  selectTheme(theme: ThemeListItem) {
    this.selectedTheme.set(theme);
    this.themeChange.emit(theme.id);
    this.dropdownOpen.set(false);
  }
}
