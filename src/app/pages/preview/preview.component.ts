import {
  Component,
  Renderer2,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  effect,
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ThemeService } from '../../core/services/theme/theme.service';
import { ThemeSwitcherComponent } from './components/theme-switcher/theme-switcher.component';
import {
  FontOption,
  FontSelectorComponent,
} from './components/font-selector/font-selector.component';
import { PreviewViewToggleComponent } from './components/preview-view-toggle/preview-view-toggle.component';
import { ComponentCustomizerComponent } from './components/component-customizer/component-customizer.component';
import { PremiumStructureComponent } from './premium-structure/premium-structure.component';
import { StandardStructureComponent } from './standard-structure/standard-structure.component';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ScrollService } from '../../core/services/shared/scroll/scroll.service';
import { ConfirmationService } from '../../core/services/shared/confirmation/confirmation.service';
import { PlanBadgeComponent } from '../../shared/components/plan-badge/plan-badge.component';
import { FeaturesSectionComponent } from '../../shared/components/features-section/features-section.component';
import { CheckoutPanelComponent } from '../../shared/components/checkout-panel/checkout-panel.component';
import { BuildStepsComponent } from '../../shared/components/build-steps/build-steps.component';
import { FloatingCheckoutButtonComponent } from '../../shared/components/floating-checkout-button/floating-checkout-button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BusinessTypeSelectorComponent } from './components/business-type-selector/business-type-selector.component';
import { BUSINESS_TYPE_MENU_ITEMS } from '../../core/models/business-types';
import { ThemeColorsService } from '../../core/services/theme/theme-colors.service';

/**
 * PreviewComponent is the main interface for the website builder.
 * It allows users to customize website templates, save their progress,
 * and view their changes in both desktop and mobile layouts.
 */
@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    ThemeSwitcherComponent,
    FontSelectorComponent,
    PreviewViewToggleComponent,
    ComponentCustomizerComponent,
    PremiumStructureComponent,
    StandardStructureComponent,
    UpperCasePipe,
    CommonModule,
    PlanBadgeComponent,
    FeaturesSectionComponent,
    CheckoutPanelComponent,
    BuildStepsComponent,
    FloatingCheckoutButtonComponent,
    IconComponent,
    BusinessTypeSelectorComponent,
  ],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit, OnDestroy {
  // ======== SERVICES INJECTION ========
  private themeService = inject(ThemeService);
  private renderer = inject(Renderer2);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private location = inject(Location);
  modalStateService = inject(ScrollService);
  isViewOnlyStateService = inject(ScrollService);
  private destroy$ = new Subject<void>();
  private themeColorsService = inject(ThemeColorsService);

  // ======== CORE STATE SIGNALS ========
  // View state
  isMobileView = signal(window.innerWidth <= 768);
  viewMode = signal<'view-desktop' | 'view-mobile'>('view-desktop');

  // Authentication state
  isAuthenticated = signal<boolean>(false); // TODO: Integrate with auth service

  // Building process state
  hasStartedBuilding = signal<boolean>(false);
  private lastSavedState = signal<Customizations | null>(null);
  private currentEditingState = signal<Customizations | null>(null);
  currentStep = signal<number>(1); // Tracks progress in the website building flow
  private hasSavedChangesFlag = signal<boolean>(false); // Tracks if changes were saved

  // UI state
  selectedComponent = signal<{
    key: keyof Customizations;
    name: string;
    path?: string;
  } | null>(null);

  // Product configuration
  currentPlan = signal<'standard' | 'premium'>('standard');
  businessType = signal<string>(''); // NEW: Selected business type
  showBusinessTypeSelector = signal<boolean>(false); // NEW: Control visibility of business type selector
  currentPage = signal<string>('home');
  selectedFont = signal<FontOption | null>(null);

  // Themes based on business type
  availableThemes = signal<any[]>([]);

  // Fullscreen state management
  private fullscreenState = signal(false);
  isFullscreen = this.fullscreenState.asReadonly();
  private preFullscreenScrollPosition = 0;

  // Theme management
  defaultThemeId = computed(() => (this.currentPlan() === 'standard' ? 1 : 4));

  // Flag to prevent theme service from overriding user customizations
  private preventThemeOverride = signal<boolean>(false);

  // ======== DEFAULT CUSTOMIZATIONS ========
  // Default customization values when no saved state exists
  customizations = signal<Customizations>({
    fontConfig: {
      fontId: 1,
      family: 'Arial',
      fallback: 'sans-serif',
    },
    header: {
      backgroundColor: '#161b33',
      textColor: '#f5f5f5',
      logoUrl: '',
      menuItems: [
        { id: 1, label: 'Home', link: '/' },
        { id: 2, label: 'About', link: '/about' },
        { id: 3, label: 'Contact', link: '/contact' },
      ],
    },
    pages: {
      home: {
        hero1: {
          backgroundImage: 'assets/standard-hero1/background-image1.jpg',
          title: 'Grow Your Business With Us',
          subtitle: 'Professional solutions tailored to your business needs',
          layout: 'center',
          showLogo: true,
          titleColor: '#ffffff',
          subtitleColor: '#f0f0f0',
          textShadow: 'medium',
          showPrimaryButton: true,
          primaryButtonText: 'GET STARTED NOW',
          primaryButtonColor: '#ffffff',
          primaryButtonTextColor: '#000000',
          primaryButtonLink: '/contact',
        },
        hero2: {
          backgroundImage: 'assets/themes/theme1/services-bg.jpg',
          title: 'Our Services',
          subtitle: 'Discover what we can do for you',
        },
      },
      about: {},
      contact: {},
    },
    footer: {
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      copyrightText: '© 2025 Your Company',
    },
  });

  // ======== COMPUTED STATE ========
  // Computed selection state for the component customizer modal
  selectedCustomization = computed(() => {
    const selected = this.selectedComponent();
    if (!selected) return null;

    console.log('Computing selectedCustomization for:', selected);

    // If there's a path, use it to get the nested data
    if (selected.path) {
      const pathParts = selected.path.split('.');
      let data = this.customizations() as any;
      let missingParts = false;

      // Navigate through the path to get the data
      for (const part of pathParts) {
        if (data && data[part] !== undefined) {
          data = data[part];
        } else {
          console.warn(
            `Cannot find data at path part: "${part}" in path: "${selected.path}"`
          );
          missingParts = true;
          break;
        }
      }

      // If we couldn't find the data, ensure the structure exists and add default values
      if (missingParts) {
        console.log(
          'Creating default structure for missing path:',
          selected.path
        );
        this.ensureCompleteCustomizationStructure();

        // Try to get the data again
        data = this.customizations() as any;
        for (const part of pathParts) {
          if (data && data[part] !== undefined) {
            data = data[part];
          } else {
            console.error(
              `Still missing data after initialization at: "${part}" in "${selected.path}"`
            );
            // Initialize with empty object as fallback
            data = {};
            break;
          }
        }
      }

      console.log('Selected component data for path:', selected.path, data);

      return {
        key: selected.key,
        name: selected.name,
        path: selected.path,
        data: data,
      };
    }

    // Otherwise use the key directly
    console.log(
      'Selected component data for key:',
      selected.key,
      this.customizations()[selected.key]
    );

    return {
      key: selected.key,
      name: selected.name,
      data: this.customizations()[selected.key],
    };
  });

  // ======== LIFECYCLE HOOKS ========
  constructor() {
    // Effect to open sidebar, change state based on component selection
    effect(
      () => {
        this.modalStateService.setModalOpen(this.selectedComponent() !== null);
      },
      { allowSignalWrites: true }
    );

    // Effect to update theme colors when plan changes
    effect(
      () => {
        this.themeColorsService.setPlan(this.currentPlan());
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    console.log('PreviewComponent initializing');

    // Initialize default customization structure
    this.ensureCompleteCustomizationStructure();

    // Handle window resize
    window.addEventListener('resize', this.updateIsMobile.bind(this));

    // Handle route parameters
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const plan = params['plan'] || 'standard';
        this.currentPlan.set(plan as 'standard' | 'premium');

        // Check for business type parameter
        if (params['businessType']) {
          this.businessType.set(params['businessType']);
        }
      });

    // Handle navigation events for page changes
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const routeData = this.route.firstChild?.snapshot.data;
        if (routeData && routeData['page']) {
          const newPage = routeData['page'];
          // Only scroll to top if the page actually changed
          if (this.currentPage() !== newPage) {
            this.currentPage.set(newPage);
            // Scroll the preview area to top when changing pages
            const previewWrapper = document.querySelector('.preview-wrapper');
            if (previewWrapper) {
              previewWrapper.scrollTop = 0;
            }
          }
        }
      });

    // Initial page setup from route
    const initialPage = this.route.firstChild?.snapshot.data['page'];
    if (initialPage) {
      this.currentPage.set(initialPage);
    }

    // Scroll to top when initially entering preview page
    window.scrollTo(0, 0);

    // Check authentication status and load appropriate state
    this.initializeUserState();

    // Ensure view mode is valid
    this.ensureValidViewMode();

    // Add fullscreen change event listener
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);

    // Initial class application
    if (this.isFullscreen()) {
      document.body.classList.add('fullscreen-mode');
    }
  }

  ngOnDestroy(): void {
    // Clean up all event listeners and subscriptions
    window.removeEventListener('resize', this.updateIsMobile.bind(this));
    document.removeEventListener(
      'fullscreenchange',
      this.handleFullscreenChange
    );
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ======== AUTHENTICATION & USER STATE ========
  /**
   * Initialize user state based on authentication status
   * and load saved customizations if they exist
   */
  private initializeUserState(): void {
    // TODO: For authenticated users, fetch their saved templates from the backend
    // TODO: Implement template selection UI for authenticated users
    // TODO: Add template saving to user's account

    if (!this.isAuthenticated()) {
      // For unauthenticated users, check session storage for saved state
      console.log('User is not authenticated - checking for saved states');

      // Check for saved customizations and build state
      const hasSavedConfig = !!sessionStorage.getItem('savedCustomizations');
      const hasStarted =
        sessionStorage.getItem('hasStartedBuilding') === 'true';

      if (hasSavedConfig && hasStarted) {
        // User has previously saved changes - set appropriate flags
        console.log('Found saved customizations - showing edit/view options');
        this.hasStartedBuilding.set(true);
        this.hasSavedChangesFlag.set(true);
        // Only set to step 3 if they've completed checkout, otherwise keep at step 2 (editing)
        const hasCompletedCheckout =
          sessionStorage.getItem('hasCompletedCheckout') === 'true';

        // Get the business type from saved data to determine the correct step
        const savedData = JSON.parse(
          sessionStorage.getItem('savedCustomizations') || '{}'
        );

        // If they have a business type set, they're at step 3 (Customize)
        // Otherwise set to step 2 (Business Type selection)
        if (savedData.businessType) {
          this.businessType.set(savedData.businessType);
          this.currentStep.set(hasCompletedCheckout ? 4 : 3);
        } else {
          this.currentStep.set(2); // Still need to select business type
        }

        // Load their saved configuration
        this.loadSavedCustomizations();
      } else {
        // New visitor - reset flags and prepare to select business type
        console.log('No saved customizations - showing Business Type Selector');
        this.hasStartedBuilding.set(false);
        this.hasSavedChangesFlag.set(false);
        this.currentStep.set(2); // They're at the business type selection step (2)
        this.showBusinessTypeSelector.set(true);

        sessionStorage.removeItem('savedCustomizations');
        sessionStorage.removeItem('hasStartedBuilding');
        sessionStorage.removeItem('currentCustomizations');
        sessionStorage.removeItem('hasCompletedCheckout');
      }
    } else {
      // TODO: For authenticated users
      // 1. Load their saved templates from the backend
      // 2. If they have purchased a subscription, set appropriate flags
      // 3. Show their most recent template as the default
    }
  }

  // ======== BUSINESS TYPE HANDLING ========
  /**
   * Handle business type selection from the selector component
   */
  handleBusinessTypeSelection(type: string): void {
    console.log('Business type selected:', type);

    // If business type changed, update it
    if (this.businessType() !== type) {
      this.businessType.set(type);

      // Clear the current theme cache to force reload of themes
      this.availableThemes.set([]);

      // Get themes for this business type
      this.loadThemesForBusinessType(type);

      // Update URL to reflect business type
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { businessType: type },
        queryParamsHandling: 'merge',
      });

      // Apply default menu items based on business type
      this.updateMenuItemsForBusinessType(type);

      // Advance to step 3 (Customize) after selecting business type
      this.currentStep.set(3);

      // If in fullscreen mode, store the current state for editing
      if (this.isFullscreen()) {
        this.storeCurrentConfiguration();
      } else {
        // If not in fullscreen, hide selector after choosing
        this.showBusinessTypeSelector.set(false);
      }
    } else if (!this.isFullscreen()) {
      // If same type selected and not in fullscreen, just hide selector
      this.showBusinessTypeSelector.set(false);
    }
  }

  /**
   * Load themes filtered by business type
   */
  loadThemesForBusinessType(businessType: string): void {
    console.log(`Loading themes for business type: ${businessType}`);

    // Always set loading state first
    this.availableThemes.set([]);

    this.themeService
      .getThemesByBusinessType(businessType, this.currentPlan())
      .subscribe({
        next: (themes) => {
          console.log(
            `Received ${
              themes.length
            } themes for ${businessType} with plan ${this.currentPlan()}`
          );

          // Save themes to signal
          this.availableThemes.set(themes);

          // If we have themes, select the first one as default if no theme is currently selected
          if (themes.length > 0) {
            if (!this.defaultThemeId()) {
              this.loadTheme(themes[0].id);
            } else {
              // Try to find the current theme in the new list
              const currentTheme = themes.find(
                (t) => t.id === this.defaultThemeId()
              );
              if (currentTheme) {
                // If current theme exists in new list, keep it
                this.loadTheme(currentTheme.id);
              } else {
                // Otherwise load the first theme
                this.loadTheme(themes[0].id);
              }
            }
          }
        },
        error: (err) => {
          console.error('Error loading themes for business type:', err);
          // Set empty array to avoid undefined errors
          this.availableThemes.set([]);
        },
      });
  }

  /**
   * Update menu items based on business type and plan
   */
  updateMenuItemsForBusinessType(businessType: string): void {
    const plan = this.currentPlan();

    // Check if we have predefined menu items for this business type and plan
    if (
      BUSINESS_TYPE_MENU_ITEMS[
        businessType as keyof typeof BUSINESS_TYPE_MENU_ITEMS
      ]?.[plan as 'standard' | 'premium']
    ) {
      this.customizations.update((current) => {
        return {
          ...current,
          header: {
            ...current.header,
            menuItems:
              BUSINESS_TYPE_MENU_ITEMS[
                businessType as keyof typeof BUSINESS_TYPE_MENU_ITEMS
              ][plan as 'standard' | 'premium'],
          },
        };
      });
    }
  }

  // ======== SESSION STATE MANAGEMENT ========
  /**
   * Check if customizations are stored in the current session
   */
  hasStoredCustomizations(): boolean {
    return !!sessionStorage.getItem('currentCustomizations');
  }

  /**
   * Store current configuration for editing
   */
  storeCurrentConfiguration(): void {
    // Stores the current editing state to session storage
    const saveData = {
      customizations: this.customizations(),
      themeId: this.defaultThemeId(),
      businessType: this.businessType(), // Add business type
    };
    sessionStorage.setItem('currentCustomizations', JSON.stringify(saveData));

    // Update our in-memory state
    this.currentEditingState.set(structuredClone(this.customizations()));
  }

  /**
   * Load the stored configuration for current editing session
   */
  loadStoredCustomizations(): void {
    const storedCustomizations = sessionStorage.getItem(
      'currentCustomizations'
    );
    if (storedCustomizations) {
      try {
        const parsedData = JSON.parse(storedCustomizations);

        if (parsedData.customizations) {
          // Set the customizations
          this.customizations.set(parsedData.customizations);

          // Also update font if exists
          if (parsedData.customizations.fontConfig) {
            const fontConfig = parsedData.customizations.fontConfig;
            this.selectedFont.set({
              id: fontConfig.fontId,
              family: fontConfig.family,
              fallback: fontConfig.fallback,
            });
          }
        }

        // Set business type if available
        if (parsedData.businessType) {
          this.businessType.set(parsedData.businessType);
        }
      } catch (e) {
        console.error('Error parsing stored customizations:', e);
        // Fallback to saved customizations or default theme
        if (sessionStorage.getItem('savedCustomizations')) {
          this.loadSavedCustomizations();
        } else {
          this.loadTheme(this.defaultThemeId());
        }
      }
    }
  }

  // ======== FULLSCREEN & VIEW MODE MANAGEMENT ========
  /**
   * Handle fullscreen change events from browser
   */
  handleFullscreenChange = (): void => {
    if (!document.fullscreenElement && this.isFullscreen()) {
      this.fullscreenState.set(false);
      const mainHeader = document.querySelector('.header') as HTMLElement;
      if (mainHeader) {
        mainHeader.style.zIndex = '1000';
        document.body.style.overflow = '';
      }
      setTimeout(() => {
        window.scrollTo({
          top: this.preFullscreenScrollPosition,
          behavior: 'auto',
        });
      }, 0);
    }
    if (this.isFullscreen()) {
      document.body.classList.add('fullscreen-mode');
    } else {
      document.body.classList.remove('fullscreen-mode');
    }
  };

  /**
   * Toggle between fullscreen and normal mode
   */
  toggleFullscreen(): void {
    if (!this.isFullscreen()) {
      // ENTERING FULLSCREEN
      console.log('🔍 Entering fullscreen mode');

      // Store scroll position for later restoration
      this.preFullscreenScrollPosition = window.scrollY;

      // Update state
      this.fullscreenState.set(true);

      // UI adjustments
      const mainHeader = document.querySelector('.header') as HTMLElement;
      if (mainHeader) {
        mainHeader.style.zIndex = '500';
        document.body.style.overflow = 'hidden';
      }
    } else {
      // EXITING FULLSCREEN
      console.log('🔍 Exiting fullscreen mode');

      // Check if we're in view mode or edit mode
      if (this.isViewOnlyStateService.isOnlyViewMode()) {
        // In view-only mode, just exit fullscreen without state changes
        console.log('🔍 Exiting view-only mode - no state changes');
      } else {
        // In edit mode, check if changes were saved
        console.log('🔍 Exiting edit mode - checking for saved customizations');
        const hasSavedCustomizations = !!sessionStorage.getItem(
          'savedCustomizations'
        );

        if (hasSavedCustomizations) {
          // If user has saved customizations, revert to those
          console.log('🔍 Reverting to saved customizations');
          // Don't reload theme, just load saved customizations to prevent overrides
          this.preventThemeOverride.set(true);
          this.loadSavedCustomizations();
          // Reset prevention after short delay
          setTimeout(() => {
            this.preventThemeOverride.set(false);
          }, 500);
        } else {
          // If no saved customizations yet (user started building but didn't save),
          // revert to default theme
          console.log(
            '🔍 No saved customizations - reverting to default theme'
          );
          this.preventThemeOverride.set(false);
          this.loadTheme(this.defaultThemeId());
        }
      }

      // Update state
      this.fullscreenState.set(false);

      // UI adjustments
      const mainHeader = document.querySelector('.header') as HTMLElement;
      if (mainHeader) {
        mainHeader.style.zIndex = '1000';
        document.body.style.overflow = '';
      }

      // Reset scroll positions
      const previewWrapper = document.querySelector('.preview-wrapper');
      if (previewWrapper) {
        previewWrapper.scrollTop = 0;
      }

      // Restore main page scroll position
      setTimeout(() => {
        window.scrollTo({
          top: this.preFullscreenScrollPosition,
          behavior: 'auto',
        });
      }, 0);
    }
  }

  /**
   * Ensure view mode is valid for current screen size
   */
  ensureValidViewMode(): void {
    if (!this.isMobileView() && this.viewMode() === 'view-mobile') {
      this.viewMode.set('view-desktop');
    }
  }

  /**
   * Update mobile view signal on window resize
   */
  updateIsMobile(): void {
    const isNowMobile = window.innerWidth <= 768;
    if (this.isMobileView() !== isNowMobile) {
      this.isMobileView.set(isNowMobile);
      this.ensureValidViewMode();
    }
  }

  /**
   * Toggle between desktop and mobile view modes
   */
  toggleView(mode: 'view-desktop' | 'view-mobile'): void {
    this.viewMode.set(mode);
  }

  // ======== VIEWING & EDITING MODES ========
  /**
   * Enter view-only mode without editing controls
   */
  openViewOnly(): void {
    // Set view mode flag
    this.isViewOnlyStateService.setIsOnlyViewMode(true);

    // In view-only mode, we always load the last saved configuration
    if (sessionStorage.getItem('savedCustomizations')) {
      this.loadSavedCustomizations();
    }

    // Then enter fullscreen to show the view
    if (!this.isFullscreen()) {
      this.toggleFullscreen();
    }
  }

  /**
   * Exit view-only mode and return to editing mode
   */
  exitViewOnly(): void {
    this.isViewOnlyStateService.setIsOnlyViewMode(false);
  }

  /**
   * Enter fullscreen edit mode (Start Building)
   */
  startBuilding(): void {
    console.log('Starting building process');

    // Set view mode to editing
    this.isViewOnlyStateService.setIsOnlyViewMode(false);

    // Set building flag (temporary until they save)
    this.hasStartedBuilding.set(true);

    // Make sure we load the themes for the current business type BEFORE entering fullscreen
    // This ensures the theme dropdown has correct options immediately
    const currentBusinessType = this.businessType();
    if (currentBusinessType) {
      console.log(
        `Preloading themes for business type: ${currentBusinessType}`
      );
      this.loadThemesForBusinessType(currentBusinessType);

      // Update the step to Customize (3) since we have a business type
      this.currentStep.set(3);
    } else {
      // Still at business type selection (2)
      this.currentStep.set(2);
    }

    // Check if there are saved customizations
    if (sessionStorage.getItem('savedCustomizations')) {
      console.log('Found saved customizations, loading them');
      this.loadSavedCustomizations();
    } else {
      console.log('No saved customizations, using default theme');
      // Load default theme for the selected plan
      this.loadTheme(this.defaultThemeId());
    }

    // Store default state before any edits
    this.lastSavedState.set(structuredClone(this.customizations()));

    // Also cache the current state for potential restore
    this.currentEditingState.set(structuredClone(this.customizations()));

    // Give time for themes to load before entering fullscreen
    setTimeout(() => {
      // Enter fullscreen mode to start editing
      this.toggleFullscreen();
    }, 100);
  }

  /**
   * Re-enter edit mode from main screen (Continue Editing)
   */
  editBuilding(): void {
    console.log('🔍 editBuilding called - continuing editing');

    // Reset view-only flag
    this.isViewOnlyStateService.setIsOnlyViewMode(false);

    // IMPORTANT: Set the flag to prevent theme from overriding saved customizations
    this.preventThemeOverride.set(true);

    // First check for saved customizations
    const savedCustomizationsRaw = sessionStorage.getItem(
      'savedCustomizations'
    );
    console.log('🔍 Raw saved customizations:', savedCustomizationsRaw);

    const hasSavedCustomizations = !!savedCustomizationsRaw;
    let businessTypeToLoad = this.businessType();

    if (hasSavedCustomizations) {
      try {
        // Parse the data before passing to any functions
        const parsedData = JSON.parse(savedCustomizationsRaw);
        console.log('🔍 Parsed saved data structure:', parsedData);

        // IMPORTANT: Apply directly without using loadSavedCustomizations
        // This avoids potential async issues with theme service
        if (parsedData.customizations) {
          console.log('🔍 Applying nested customizations structure directly');
          // Apply the customizations directly
          this.customizations.set(parsedData.customizations);

          // Also handle font
          if (parsedData.customizations.fontConfig) {
            const fontConfig = parsedData.customizations.fontConfig;
            this.selectedFont.set({
              id: fontConfig.fontId,
              family: fontConfig.family,
              fallback: fontConfig.fallback,
            });
          }

          // Get business type from saved data
          if (parsedData.businessType) {
            businessTypeToLoad = parsedData.businessType;
            this.businessType.set(parsedData.businessType);
          }
        } else {
          console.log('🔍 Applying legacy customizations structure directly');
          // Handle legacy structure
          this.customizations.set(parsedData);

          // Handle legacy font
          if (parsedData.fontConfig) {
            const fontConfig = parsedData.fontConfig;
            this.selectedFont.set({
              id: fontConfig.fontId,
              family: fontConfig.family,
              fallback: fontConfig.fallback,
            });
          }

          // Get business type from saved data
          if (parsedData.businessType) {
            businessTypeToLoad = parsedData.businessType;
            this.businessType.set(parsedData.businessType);
          }
        }

        // Update currentEditingState with our applied data
        this.currentEditingState.set(structuredClone(this.customizations()));
        console.log(
          '🔍 Successfully applied saved customizations:',
          this.customizations()
        );

        // IMPORTANT: Also update currentCustomizations to ensure consistency
        const freshData = {
          customizations: this.customizations(),
          themeId: this.defaultThemeId(),
          businessType: businessTypeToLoad,
        };
        sessionStorage.setItem(
          'currentCustomizations',
          JSON.stringify(freshData)
        );
      } catch (e) {
        console.error('🚨 Error applying saved customizations:', e);
        // Disable override prevention since we're loading default theme
        this.preventThemeOverride.set(false);
        this.loadTheme(this.defaultThemeId());
      }
    } else {
      console.log('🔍 No saved customizations found - using default theme');
      // Disable override prevention since we're loading default theme
      this.preventThemeOverride.set(false);
      this.loadTheme(this.defaultThemeId());
    }

    // Preload themes for the current business type before entering fullscreen
    if (businessTypeToLoad) {
      console.log(
        `🔍 Preloading themes for business type: ${businessTypeToLoad}`
      );
      this.loadThemesForBusinessType(businessTypeToLoad);
    }

    // Enter fullscreen mode after a short delay to allow theme loading
    setTimeout(() => {
      if (!this.isFullscreen()) {
        this.toggleFullscreen();
      }
    }, 100);

    // Keep prevention active for a short time to ensure all theme load operations respect it
    setTimeout(() => {
      console.log('🔍 Theme override prevention disabled after initialization');
      this.preventThemeOverride.set(false);
    }, 1000);
  }

  // ======== THEME & CUSTOMIZATION MANAGEMENT ========
  /**
   * Load theme CSS from backend and apply global styles
   */
  loadTheme(themeId: number): void {
    console.log(`Loading theme with ID ${themeId}`);

    // Check if we should prevent theme customizations from overriding saved ones
    if (this.preventThemeOverride()) {
      console.log('🛡️ Theme override prevention active - loading CSS only');

      this.themeService.getById(themeId).subscribe({
        next: (theme) => {
          console.log('🛡️ Theme CSS loaded without overriding customizations');
          // Apply CSS styles only, without overriding customizations
          this.applyGlobalStyles(theme.cssContent);
        },
        error: (err) => {
          console.error('Error loading theme CSS:', err);
        },
      });
      return;
    }

    // Normal theme loading with customizations
    this.themeService.getById(themeId).subscribe({
      next: (theme) => {
        console.log('Theme loaded successfully:', theme.name);

        // Apply CSS styles
        this.applyGlobalStyles(theme.cssContent);

        // Update customizations from theme data
        if (theme.customizations) {
          console.log('Setting customizations from theme');
          this.customizations.set(theme.customizations);

          // Update selectedFont signal if fontConfig exists in the loaded theme
          if (theme.customizations.fontConfig) {
            const fontConfig = theme.customizations.fontConfig;
            this.selectedFont.set({
              id: fontConfig.fontId,
              family: fontConfig.family,
              fallback: fontConfig.fallback,
            });
          }
        }
      },
      error: (err) => {
        console.error('Error loading theme:', err);
      },
    });
  }

  /**
   * Direct application of customizations without loading from theme service
   * This is critical for preventing saved customizations from being overridden
   */
  applyCustomizations(customizationsData: Customizations): void {
    console.log('🔍 Directly applying customizations', customizationsData);

    // Temporarily prevent theme override
    this.preventThemeOverride.set(true);

    // Update the customizations signal
    this.customizations.set(customizationsData);

    // Update font if available
    if (customizationsData.fontConfig) {
      const fontConfig = customizationsData.fontConfig;
      this.selectedFont.set({
        id: fontConfig.fontId,
        family: fontConfig.family,
        fallback: fontConfig.fallback,
      });
    }

    // Also update in-memory state
    this.currentEditingState.set(structuredClone(customizationsData));

    // Ensure we have these customizations in currentCustomizations too
    const freshData = {
      customizations: customizationsData,
      themeId: this.defaultThemeId(),
    };
    sessionStorage.setItem('currentCustomizations', JSON.stringify(freshData));

    // Reset prevention after a short delay
    setTimeout(() => {
      this.preventThemeOverride.set(false);
    }, 500);
  }

  /**
   * Load saved (not temporary) customizations
   */
  loadSavedCustomizations(): void {
    console.log('🔍 Loading saved customizations');
    const savedCustomizations = sessionStorage.getItem('savedCustomizations');
    if (savedCustomizations) {
      try {
        const parsedData = JSON.parse(savedCustomizations);
        console.log('🔍 Parsed saved data:', parsedData);

        // Check if data is in the new format with nested customizations
        if (parsedData.customizations) {
          console.log('🔍 Setting customizations from nested structure');
          // Use direct application for nested structure
          this.applyCustomizations(parsedData.customizations);
        } else {
          // Handle legacy format (direct customizations object)
          console.log('🔍 Setting customizations from legacy structure');
          // Use direct application for legacy format too
          this.applyCustomizations(parsedData);
        }

        console.log('🔍 Successfully loaded saved customizations');
      } catch (e) {
        console.error('🚨 Error parsing saved customizations:', e);
        // Fallback to default theme if parsing fails
        this.preventThemeOverride.set(false);
        this.loadTheme(this.defaultThemeId());
      }
    } else {
      console.warn('No saved customizations found');
    }
  }

  /**
   * Apply global CSS styles
   */
  applyGlobalStyles(cssContent: string): void {
    let styleTag = document.getElementById(
      'dynamic-theme-style'
    ) as HTMLStyleElement;
    if (!styleTag) {
      styleTag = this.renderer.createElement('style');
      this.renderer.setAttribute(styleTag, 'id', 'dynamic-theme-style');
      this.renderer.appendChild(document.head, styleTag);
    }
    styleTag.innerHTML = cssContent;
  }

  // ======== COMPONENT CUSTOMIZATION HANDLERS ========
  /**
   * Handler for selection coming from the child structure component
   */
  handleComponentSelection(selected: {
    key: string;
    name: string;
    path?: string;
  }): void {
    // Key being emitted should be one of the keys in Customizations
    this.selectedComponent.set({
      key: selected.key as keyof Customizations,
      name: selected.name,
      path: selected.path,
    });
  }

  /**
   * Handler for updates coming from the modal (using selectedCustomization)
   */
  handleComponentUpdate(update: any): void {
    const selected = this.selectedComponent();
    if (!selected) return;

    console.log('Updating component:', selected, 'with data:', update);

    // If there's a path, update the nested data
    if (selected.path) {
      const pathParts = selected.path.split('.');

      this.customizations.update((current) => {
        // Create a deep copy to avoid mutating the original
        const updated = structuredClone(current);

        // Navigate to the parent object that contains the property to update
        let target: any = updated;
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          // Create objects along the path if they don't exist
          if (!target[part]) {
            console.log(`Creating missing object at path part: ${part}`);
            target[part] = {};
          }
          target = target[part];
        }

        // Update the property
        const lastPart = pathParts[pathParts.length - 1];

        // Use a merge approach to avoid overwriting existing properties
        if (!target[lastPart]) {
          console.log(
            `Creating missing object at final path part: ${lastPart}`
          );
          target[lastPart] = {};
        }

        // Merge the update with the existing data
        target[lastPart] = { ...target[lastPart], ...update };

        console.log('Updated customizations at path:', selected.path);
        console.log('Updated data:', target[lastPart]);

        return updated;
      });
    } else {
      // Original logic for top-level properties
      this.customizations.update((current) => {
        const updated = {
          ...current,
          [selected.key]: {
            ...current[selected.key],
            ...update,
          },
        };
        console.log('Updated top-level customizations:', updated);
        return updated;
      });
    }

    // Update currentEditingState with latest changes
    // but don't save to sessionStorage until explicit save
    this.currentEditingState.set(structuredClone(this.customizations()));
  }

  /**
   * Update font selection
   */
  handleFontUpdate(font: FontOption): void {
    this.selectedFont.set(font);
    this.customizations.update((current) => ({
      ...current,
      fontConfig: {
        fontId: font.id,
        family: font.family,
        fallback: font.fallback,
      },
    }));

    // Update currentEditingState with font changes
    this.currentEditingState.set(structuredClone(this.customizations()));
  }

  // ======== PLAN SELECTION ========
  /**
   * Select a plan (standard or premium)
   * @param plan The plan type to select
   */
  selectPlan(plan: 'standard' | 'premium'): void {
    this.currentPlan.set(plan);

    // If user changes plan after starting, we need to update the theme
    if (this.hasStartedBuilding()) {
      this.loadTheme(this.defaultThemeId());
    }

    // Update current step if we're just starting
    if (this.currentStep() === 1) {
      this.currentStep.set(2);
    }

    // Update URL to reflect plan change
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { plan },
      queryParamsHandling: 'merge',
    });
  }

  // ======== CHECKOUT PROCESS ========
  /**
   * Check if user has saved changes
   */
  hasSavedChanges(): boolean {
    return this.hasSavedChangesFlag();
  }

  /**
   * Proceed to checkout after saving website changes
   */
  proceedToCheckout(): void {
    // TODO: Implement checkout flow with payment gateway integration
    // For now, we'll just navigate to a placeholder checkout page
    console.log('Proceeding to checkout');
    this.confirmationService.showConfirmation(
      'Redirecting to checkout...',
      'info',
      2000
    );

    // Set flag for completed checkout
    sessionStorage.setItem('hasCompletedCheckout', 'true');
    // Update step to 4 (final step)
    this.currentStep.set(4);

    // Simulate checkout redirect
    setTimeout(() => {
      // TODO: Replace with actual checkout route
      alert('Checkout functionality will be implemented in the next phase');
      // this.router.navigate(['/checkout'], {
      //   queryParams: { plan: this.currentPlan() }
      // });
    }, 2000);
  }

  // ======== SAVE & RESET ACTIONS ========
  /**
   * Save customizations
   * For unauthenticated users - saves to sessionStorage
   * TODO: For authenticated users - save to backend
   */
  saveAllChanges(): void {
    console.log('Saving customizations:', this.customizations());

    // TODO: For authenticated users, save to their account in the backend
    if (this.isAuthenticated()) {
      // Future implementation: Save to user's account via API
      // this.userTemplateService.saveTemplate(this.customizations());
    }

    // Prepare data for saving with proper structure
    const savedData = {
      customizations: this.customizations(),
      themeId: this.defaultThemeId(),
      businessType: this.businessType(), // Add business type to saved data
    };

    // Save to session storage
    sessionStorage.setItem('savedCustomizations', JSON.stringify(savedData));

    // Also update currentCustomizations to match the saved state
    sessionStorage.setItem('currentCustomizations', JSON.stringify(savedData));

    // Set flags to indicate successful save
    sessionStorage.setItem('hasStartedBuilding', 'true');
    this.hasStartedBuilding.set(true);
    this.hasSavedChangesFlag.set(true);

    // Update progress step to the editing step (2)
    // We only move to step 3 after checkout is complete
    this.currentStep.set(4);

    // Update lastSavedState to track what was saved
    this.lastSavedState.set(structuredClone(this.customizations()));
    this.currentEditingState.set(structuredClone(this.customizations()));

    // Show confirmation message
    this.confirmationService.showConfirmation(
      'Your website changes have been saved successfully!',
      'success',
      3000
    );

    // Exit fullscreen mode
    if (this.isFullscreen()) {
      this.toggleFullscreen();
    }
  }

  /**
   * Reset customizations and clear selected component
   */
  resetCustomizations(): void {
    if (confirm('Are you sure you want to reset all changes?')) {
      // TODO: For authenticated users, prompt if they want to reset to one of their saved templates

      // Remove all stored customizations
      sessionStorage.removeItem('currentCustomizations');
      sessionStorage.removeItem('savedCustomizations');
      sessionStorage.removeItem('hasCompletedCheckout');

      // Reset hasStartedBuilding flag
      sessionStorage.removeItem('hasStartedBuilding');
      this.hasStartedBuilding.set(false);
      this.hasSavedChangesFlag.set(false);

      // Reset progress step
      this.currentStep.set(2);
      this.showBusinessTypeSelector.set(true);
      this.businessType.set('');

      // Reset in-memory states
      this.lastSavedState.set(null);
      this.currentEditingState.set(null);

      // Reset to default theme
      this.loadTheme(this.defaultThemeId());
      this.selectedComponent.set(null);

      // Exit fullscreen mode
      if (this.isFullscreen()) {
        this.toggleFullscreen();
      }

      // Remove 'businessType' from the URL without triggering navigation
      const currentParams = { ...this.route.snapshot.queryParams };
      if (currentParams['businessType']) {
        delete currentParams['businessType'];
        const baseUrl = this.router.url.split('?')[0];
        const newQueryString = new URLSearchParams(currentParams).toString();
        this.location.replaceState(baseUrl, newQueryString);
      }

      // Show confirmation message
      this.confirmationService.showConfirmation(
        'All customizations have been reset',
        'info',
        3000
      );
    }
  }

  /**
   * Ensure the customization object has all the required nested objects
   * This prevents "undefined" errors when accessing deeply nested properties
   */
  private ensureCompleteCustomizationStructure(): void {
    this.customizations.update((current) => {
      const updated = structuredClone(current);

      // Ensure pages object exists
      if (!updated.pages) {
        updated.pages = {};
      }

      // Ensure home object exists
      if (!updated.pages.home) {
        updated.pages.home = {};
      }

      // Ensure hero1 object exists with default values if not set
      if (!updated.pages.home.hero1) {
        updated.pages.home.hero1 = {
          backgroundImage: 'assets/standard-hero1/background-image1.jpg',
          title: 'Grow Your Business With Us',
          subtitle: 'Professional solutions tailored to your business needs',
          layout: 'center',
          showLogo: true,
          titleColor: '#ffffff',
          subtitleColor: '#f0f0f0',
          textShadow: 'medium',
          showPrimaryButton: true,
          primaryButtonText: 'GET STARTED NOW',
          primaryButtonColor: '#ffffff',
          primaryButtonTextColor: '#000000',
          primaryButtonLink: '/contact',
        };
      }

      // Ensure about, menu, services, projects, contact objects exist
      ['about', 'menu', 'services', 'projects', 'contact'].forEach(
        (section) => {
          // Use type assertion to handle dynamic property access
          const homeObj = updated.pages.home as Record<string, any>;
          if (!homeObj[section]) {
            homeObj[section] = {};
          }
        }
      );

      return updated;
    });
  }
}

/**
 * Interface defining the structure of website customizations
 */
export interface Customizations {
  fontConfig: {
    fontId: number;
    family: string;
    fallback: string;
  };
  header: {
    backgroundColor: string;
    textColor: string;
    logoUrl: string;
    menuItems: { id: number; label: string; link: string }[];
  };
  pages: {
    home?: {
      hero1?: {
        backgroundImage: string;
        title: string;
        subtitle: string;
        layout?: 'center' | 'left' | 'right';
        showLogo?: boolean;
        titleColor?: string;
        subtitleColor?: string;
        textShadow?: 'none' | 'light' | 'medium' | 'heavy';
        showPrimaryButton?: boolean;
        primaryButtonText?: string;
        primaryButtonColor?: string;
        primaryButtonTextColor?: string;
        primaryButtonLink?: string;
      };
      hero2?: {
        backgroundImage: string;
        title: string;
        subtitle: string;
      };
    };
    about?: {};
    contact?: {};
  };
  footer: {
    backgroundColor: string;
    textColor: string;
    copyrightText: string;
  };
}
