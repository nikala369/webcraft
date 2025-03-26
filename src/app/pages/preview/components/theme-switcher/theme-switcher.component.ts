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
import { ThemeListItem } from '../../../../core/services/theme/theme';
import { ThemeColorsService } from '../../../../core/services/theme/theme-colors.service';

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

  themes = signal<ThemeListItem[]>([]);
  dropdownOpen = signal(false);
  private planSignal = signal<'standard' | 'premium'>('standard');
  private businessTypeSignal = signal<string>('');
  @Input() defaultThemeId?: number;
  accentColor = '';

  // Allow passing in pre-filtered themes
  @Input() set availableThemes(value: ThemeListItem[]) {
    if (value && value.length > 0) {
      console.log('Using provided available themes:', value);
      this.themes.set(value);

      // Select default theme
      this.selectDefaultTheme(value);
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

    // Load available themes when plan changes if no themes provided
    if (this.themes().length === 0) {
      this.loadThemesForPlan(value, this.businessTypeSignal());
    }
  }

  @Input() set businessType(value: string) {
    if (value !== this.businessTypeSignal()) {
      this.businessTypeSignal.set(value);

      // When business type changes, reload themes
      if (value) {
        console.log(`ThemeSwitcher: Business type changed to ${value}`);
        // Clear current themes to force refresh
        this.themes.set([]);
        // Load themes for the current plan and new business type
        this.loadThemesForPlan(this.planSignal(), value);
      }
    }
  }

  @Output() themeChange = new EventEmitter<number>();

  // Filtered themes based on the selected plan
  filteredThemes = computed(() => {
    return this.themes();
  });

  selectedTheme = signal<ThemeListItem>({
    id: 0,
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
    // Load initial themes for current plan if none provided
    if (this.themes().length === 0) {
      this.loadThemesForPlan(this.planSignal(), this.businessTypeSignal());
    }

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

  private loadThemesForPlan(
    plan: 'standard' | 'premium',
    businessType: string = ''
  ) {
    // Skip theme service loading and use mock themes directly
    console.log(
      `Loading themes for plan: ${plan}, business type: ${businessType}`
    );

    if (businessType) {
      // If we have a business type, use ThemeService.getThemesByBusinessType
      this.themeService.getThemesByBusinessType(businessType, plan).subscribe({
        next: (themes) => {
          console.log(
            `Loaded ${themes.length} themes for ${businessType} - ${plan}`
          );
          this.themes.set(themes);
          this.selectDefaultTheme(themes);
        },
        error: (err) => {
          console.warn(`Failed to load themes for ${businessType}`, err);
          this.loadFallbackThemes(plan, businessType);
        },
      });
    } else {
      // No business type, try to get all themes
      this.themeService.getAll().subscribe({
        next: (themes) => {
          console.log(
            `Loaded ${themes.length} themes for ${plan} plan from service`
          );
          const filteredThemes = themes.filter(
            (theme) => plan === 'premium' || theme.planType === 'standard'
          );
          this.themes.set(filteredThemes);
          this.selectDefaultTheme(filteredThemes);
        },
        error: (err) => {
          console.warn('Theme service not available, using mock data', err);
          this.loadFallbackThemes(plan, businessType);
        },
      });
    }
  }

  private loadFallbackThemes(
    plan: 'standard' | 'premium',
    businessType: string = ''
  ) {
    // Generate different mock themes for each business type
    const mockThemesByBusinessType: Record<string, ThemeListItem[]> = {
      restaurant: [
        {
          id: 101,
          name: 'Restaurant Light',
          planType: 'standard',
          businessType: 'restaurant',
        },
        {
          id: 102,
          name: 'Restaurant Dark',
          planType: 'standard',
          businessType: 'restaurant',
        },
        {
          id: 103,
          name: 'Restaurant Premium',
          planType: 'premium',
          businessType: 'restaurant',
        },
      ],
      salon: [
        {
          id: 201,
          name: 'Salon Elegant',
          planType: 'standard',
          businessType: 'salon',
        },
        {
          id: 202,
          name: 'Salon Modern',
          planType: 'standard',
          businessType: 'salon',
        },
        {
          id: 203,
          name: 'Salon Premium',
          planType: 'premium',
          businessType: 'salon',
        },
      ],
      portfolio: [
        {
          id: 301,
          name: 'Portfolio Light',
          planType: 'standard',
          businessType: 'portfolio',
        },
        {
          id: 302,
          name: 'Portfolio Dark',
          planType: 'standard',
          businessType: 'portfolio',
        },
        {
          id: 303,
          name: 'Portfolio Premium',
          planType: 'premium',
          businessType: 'portfolio',
        },
      ],
      architecture: [
        {
          id: 501,
          name: 'Architecture Minimal',
          planType: 'standard',
          businessType: 'architecture',
        },
        {
          id: 502,
          name: 'Architecture Bold',
          planType: 'standard',
          businessType: 'architecture',
        },
        {
          id: 503,
          name: 'Architecture Premium',
          planType: 'premium',
          businessType: 'architecture',
        },
      ],
    };

    // Default themes if no business type is selected yet
    const defaultThemes: ThemeListItem[] = [
      {
        id: 1,
        name: 'Business Blue',
        planType: 'standard' as 'standard' | 'premium',
        businessType: 'all',
      },
      {
        id: 2,
        name: 'Modern Green',
        planType: 'standard' as 'standard' | 'premium',
        businessType: 'all',
      },
      {
        id: 3,
        name: 'Creative Purple',
        planType: 'standard' as 'standard' | 'premium',
        businessType: 'all',
      },
      {
        id: 4,
        name: 'Premium Corporate',
        planType: 'premium' as 'standard' | 'premium',
        businessType: 'all',
      },
    ];

    // Use business type specific themes if available, otherwise use defaults
    if (businessType && mockThemesByBusinessType[businessType]) {
      const businessTypeThemes = mockThemesByBusinessType[businessType].filter(
        (theme) => plan === 'premium' || theme.planType === 'standard'
      );
      console.log(`Using mock themes for ${businessType}:`, businessTypeThemes);
      this.themes.set(businessTypeThemes);
      this.selectDefaultTheme(businessTypeThemes);
    } else {
      // Fallback to default themes
      console.log(`Using default mock themes`);
      const filteredDefaultThemes = defaultThemes.filter(
        (theme) => plan === 'premium' || theme.planType === 'standard'
      );
      this.themes.set(filteredDefaultThemes);
      this.selectDefaultTheme(filteredDefaultThemes);
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
