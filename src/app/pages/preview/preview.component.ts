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
import {
  ActivatedRoute,
  Router,
  NavigationEnd,
  RouterModule,
} from '@angular/router';
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
import { WebcraftLoadingComponent } from '../../shared/components/webcraft-loading/webcraft-loading.component';
import {
  Customizations,
  ThemeData,
} from '../../core/models/website-customizations';
import { BusinessConfigService } from '../../core/services/business-config/business-config.service';
import { UserTemplateService } from '../../core/services/template/user-template.service';
import { UserBuildService } from '../../core/services/build/user-build.service';
import { SubscriptionService } from '../../core/services/subscription/subscription.service';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth/auth.service';
import { SelectionStateService } from '../../core/services/selection/selection-state.service';
// Fixed import directly from service to avoid module resolution issues
import type { UserTemplate } from '../../core/services/template/user-template.service';

// Add the ScreenSize enum if it doesn't exist
export enum ScreenSize {
  DESKTOP = 'desktop',
  TABLET = 'tablet',
  MOBILE = 'mobile',
}

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
    WebcraftLoadingComponent,
    RouterModule,
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
  private businessConfigService = inject(BusinessConfigService);
  private userTemplateService = inject(UserTemplateService);
  private userBuildService = inject(UserBuildService);
  private subscriptionService = inject(SubscriptionService);
  private selectionStateService = inject(SelectionStateService);
  private authService = inject(AuthService);

  // ======== CORE STATE SIGNALS ========
  // View state
  isMobileView = signal(window.innerWidth <= 768);
  viewMode = signal<'view-desktop' | 'view-mobile'>('view-desktop');

  // Authentication state
  isAuthenticated = computed(() => this.authService.isAuthenticated());

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

  // Loading state
  showLoadingOverlay = signal<boolean>(false);
  loadingOverlayClass = signal<string>('');

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
        },
        about: {
          title: 'About Us',
          subtitle: 'Our Story',
          storyTitle: 'Our Story',
          storyText:
            'We are dedicated to providing exceptional service and quality. Our commitment to excellence has made us a trusted choice in the industry.',
          missionTitle: 'Our Mission',
          missionText:
            "Our mission is to provide high-quality services that exceed our clients' expectations. We believe in building long-lasting relationships based on trust, integrity, and results.",
          imageUrl: 'assets/standard-hero1/background-image1.jpg',
          backgroundColor: '#ffffff',
          textColor: '#333333',
        },
        contact: {
          title: 'Contact Us',
          subtitle: 'Get in touch with us',
          address: '123 Business Street\nAnytown, ST 12345',
          phone: '(123) 456-7890',
          email: 'info@yourbusiness.com',
          formTitle: 'Send a Message',
          formSubject: 'New message from your website',
          formButtonText: 'Send Message',
        },
      },
    },
    footer: {
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      copyrightText: '© 2025 Your Company',
      logoUrl: '',
      tagline: '',
      address: '',
      phone: '',
      email: '',
      showSocialLinks: true,
      menuItems: [],
      socialUrls: {},
      socialLinks: [],
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
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        // Create objects along the path if they don't exist
        if (!data || data[part] === undefined) {
          console.warn(
            `Cannot find data at path part: "${part}" in path: "${selected.path}". Current data:`,
            data
          );
          missingParts = true;
          break;
        }
        data = data[part];
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
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
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

      // Get the final part of the path
      const lastPart = pathParts[pathParts.length - 1];

      // Make sure we have an object to return
      if (!data[lastPart]) {
        console.log('Creating empty object for last path part:', lastPart);
        data[lastPart] = {};
      }

      // Special handling for hero section
      if (lastPart === 'hero1') {
        console.log(
          'Hero section selected. Data before potentially fixing:',
          data[lastPart]
        );

        // Check if we have a backgroundImage in custom or default state
        const heroData = this.customizations()?.pages?.home?.hero1;
        if (heroData && heroData.backgroundImage) {
          console.log(
            'Found backgroundImage in nested customizations, ensuring it is passed to editor'
          );
          if (!data[lastPart].backgroundImage) {
            data[lastPart].backgroundImage = heroData.backgroundImage;
          }
        }

        // Ensure background type is set
        if (!data[lastPart].backgroundType) {
          data[lastPart].backgroundType = 'image';
        }
      }

      // Special handling for about section
      if (lastPart === 'about') {
        console.log(
          'About section selected. Data before potentially fixing:',
          data[lastPart]
        );

        // Check if we have an imageUrl in custom or default state
        const aboutData = this.customizations()?.pages?.home?.about;
        if (aboutData && aboutData.imageUrl) {
          console.log(
            'Found imageUrl in nested customizations, ensuring it is passed to editor'
          );
          if (!data[lastPart].imageUrl || data[lastPart].imageUrl === '') {
            data[lastPart].imageUrl = aboutData.imageUrl;
          }
        }

        // Ensure all required fields are set
        if (!data[lastPart].storyTitle) {
          data[lastPart].storyTitle = aboutData?.storyTitle || 'Our Story';
        }
        if (!data[lastPart].storyText) {
          data[lastPart].storyText =
            aboutData?.storyText || 'Our story text here.';
        }
        if (!data[lastPart].missionTitle) {
          data[lastPart].missionTitle =
            aboutData?.missionTitle || 'Our Mission';
        }
        if (!data[lastPart].missionText) {
          data[lastPart].missionText =
            aboutData?.missionText || 'Our mission text here.';
        }
      }

      console.log(
        'Selected component data for path:',
        selected.path,
        data[lastPart]
      );

      return {
        key: selected.key,
        name: selected.name,
        path: selected.path,
        data: data[lastPart],
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

        // Handle template operations
        const templateId = params['templateId'];
        const mode = params['mode'] || 'view';
        const newTemplate = params['newTemplate'] === 'true';

        if (newTemplate) {
          // Handle new template creation
          console.log('Creating new template');
          this.hasStartedBuilding.set(true);
          this.currentStep.set(2); // business type selection
          this.showBusinessTypeSelector.set(true);

          // Automatically switch to fullscreen edit mode
          setTimeout(() => {
            if (!this.isFullscreen()) {
              this.toggleFullscreen();
            }
          }, 300);
        } else if (templateId) {
          // Handle existing template editing or viewing
          console.log(`Loading template ${templateId} in ${mode} mode`);

          // TODO: Load the template data from API
          this.hasStartedBuilding.set(true);

          if (mode === 'edit') {
            // Automatically enter edit mode (fullscreen)
            setTimeout(() => {
              this.editBuilding();
            }, 300);
          } else if (mode === 'view') {
            // Enter view-only mode
            setTimeout(() => {
              this.isViewOnlyStateService.setIsOnlyViewMode(true);
              if (!this.isFullscreen()) {
                this.toggleFullscreen();
              }
            }, 300);
          }
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
    // Check for business type in URL regardless of authentication status
    const urlBusinessType = this.route.snapshot.queryParams['businessType'];

    if (urlBusinessType) {
      console.log('Business type provided in URL:', urlBusinessType);
      this.businessType.set(urlBusinessType);
      this.showBusinessTypeSelector.set(false);

      // Load themes for this business type
      this.loadThemesForBusinessType(urlBusinessType);
    }

    // Check if user is authenticated
    if (this.isAuthenticated()) {
      console.log('User is authenticated - checking for template ID');

      // Check if template ID is provided in URL
      const templateId = this.route.snapshot.queryParams['templateId'];

      if (templateId) {
        console.log('Template ID found:', templateId);

        // Show loading overlay
        this.showLoadingOverlay.set(true);
        this.loadingOverlayClass.set('active');

        // Load template from API
        if (!this.userTemplateService) {
          console.error('UserTemplateService not initialized');
          this.showLoadingOverlay.set(false);
          return;
        }

        this.userTemplateService.getUserTemplateById(templateId).subscribe({
          next: (template) => {
            if (template && template.config) {
              console.log('Loaded user template from API:', template);

              // Store the template ID for future updates
              this.currentUserTemplateId = template.id;

              // Set business type based on template data
              if (template.template?.templateType?.key) {
                const templateType = template.template.templateType.key;
                this.businessType.set(templateType);

                // Load themes for this business type if not already loaded
                if (!urlBusinessType) {
                  this.loadThemesForBusinessType(templateType);
                }
              }

              // Parse the config string to get customizations
              try {
                const customizationsData = JSON.parse(template.config);

                // Apply the loaded customizations
                this.applyCustomizations(customizationsData);

                // Update last saved state to track changes
                this.lastSavedState.set(structuredClone(customizationsData));
                this.currentEditingState.set(
                  structuredClone(customizationsData)
                );
              } catch (e) {
                console.error('Error parsing template config:', e);
                this.confirmationService.showConfirmation(
                  'Error parsing template configuration. Using default settings.',
                  'error',
                  5000
                );
              }

              // Set appropriate flags for editing flow
              this.hasStartedBuilding.set(true);
              this.hasSavedChangesFlag.set(true);
              this.currentStep.set(3); // Move to editing step

              // Hide loading overlay
              setTimeout(() => {
                this.showLoadingOverlay.set(false);
                this.loadingOverlayClass.set('');
              }, 500);
            } else {
              console.warn('Template has no config:', template);
              this.showLoadingOverlay.set(false);
            }
          },
          error: (error) => {
            console.error('Error loading template from API:', error);
            this.confirmationService.showConfirmation(
              'Failed to load template: ' + (error.message || 'Unknown error'),
              'error',
              5000
            );
            this.showLoadingOverlay.set(false);
          },
        });
      } else {
        // No template ID provided - show business type selector if not already set
        if (!urlBusinessType) {
          this.currentStep.set(2); // Step 2: Business Type Selection
          this.showBusinessTypeSelector.set(true);
        } else {
          // Business type is set but no template - move to step 3 (Customize)
          this.currentStep.set(3);
        }
      }
    } else {
      // User is not authenticated - redirect to login page
      console.log('User is not authenticated - redirecting to login');

      // Save the current URL as the return URL
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
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

      // Store current state in selectionStateService for potential auth flow redirects
      this.selectionStateService.saveSelections(type, this.currentPlan());

      // Always show the business type selector in compact mode when in fullscreen
      if (!this.isFullscreen()) {
        // If not in fullscreen, hide selector after choosing
        this.showBusinessTypeSelector.set(false);
      }
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
            const themeToSelect = themes[0].id;
            console.log(`Auto-selecting theme ID ${themeToSelect}`);
            this.loadTheme(themeToSelect);
          } else {
            console.log('No themes available for this business type and plan');

            // Try to use default theme for current plan
            this.loadTheme(this.defaultThemeId());
          }
        },
        error: (err) => {
          console.error('Error loading themes for business type:', err);
          // On error, load default theme
          this.loadTheme(this.defaultThemeId());
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

    // Use business config service to get menu items
    const menuItems = this.businessConfigService.getMenuItemsForBusinessType(
      businessType,
      plan
    );

    // Update the customizations with the new menu items
    this.customizations.update((current) => {
      return {
        ...current,
        header: {
          ...current.header,
          menuItems: menuItems,
        },
      };
    });
  }

  // ======== SESSION STATE MANAGEMENT ========
  /**
   * Clean up session storage usage
   * In the new fully-authenticated flow, we don't need to store customizations in sessionStorage
   */
  private cleanupSessionStorage(): void {
    // Remove all stored customization-related data from session storage
    sessionStorage.removeItem('currentCustomizations');
    sessionStorage.removeItem('savedCustomizations');
    sessionStorage.removeItem('hasCompletedCheckout');
    sessionStorage.removeItem('hasStartedBuilding');

    // Keep only essential session data like selectedTemplateId if it exists
    const templateId = sessionStorage.getItem('selectedTemplateId');
    if (templateId) {
      console.log('Preserving selected template ID:', templateId);
    }
  }

  /**
   * Check if template ID is stored in session storage
   * Used for creating vs updating templates
   */
  hasStoredTemplateId(): boolean {
    return !!sessionStorage.getItem('selectedTemplateId');
  }

  /**
   * Start building new website
   */
  startBuilding(): void {
    console.log('Starting building process');
    this.showLoadingOverlay.set(true);

    // Clean up any old session storage data
    this.cleanupSessionStorage();

    // Set view mode to editing
    this.isViewOnlyStateService.setIsOnlyViewMode(false);

    // Set building flag
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

    // Give time for themes to load before entering fullscreen
    setTimeout(() => {
      console.log('3 seconds passed, now toggling fullscreen');

      // Load default theme for the selected plan
      this.loadTheme(this.defaultThemeId());

      // Store default state before any edits
      this.lastSavedState.set(structuredClone(this.customizations()));

      // Also cache the current state for potential restore
      this.currentEditingState.set(structuredClone(this.customizations()));

      this.loadingOverlayClass.set('fade-out');

      this.showLoadingOverlay.set(false);
      this.toggleFullscreen();
    }, 2100);
  }

  /**
   * Re-enter edit mode from main screen (Continue Editing)
   */
  editBuilding(): void {
    console.log('🔍 editBuilding called - continuing editing');

    // Set loading overlay for visual feedback
    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('transition-overlay');

    // IMPORTANT: Reset view-only flag to ensure we're in edit mode
    this.isViewOnlyStateService.setIsOnlyViewMode(false);

    // Set the flag to prevent theme from overriding saved customizations
    this.preventThemeOverride.set(true);

    // Check if we have a template ID and load it
    const templateId =
      this.currentUserTemplateId ||
      sessionStorage.getItem('selectedTemplateId');
    if (templateId) {
      // If we have a template ID, load it from the API
      this.loadStoredCustomizations();
    } else {
      // No template ID - use the default theme
      console.log('🔍 No template ID found - loading default theme');
      this.preventThemeOverride.set(false);
      this.loadTheme(this.defaultThemeId());
    }

    // Update URL parameters to indicate we're in edit mode
    this.updateUrlParams({ viewOnly: 'false', mode: 'edit' });

    // Enter fullscreen mode after a short delay to allow theme loading
    setTimeout(() => {
      // Remove loading overlay
      this.showLoadingOverlay.set(false);

      // Enter fullscreen mode if not already in it
      if (!this.isFullscreen()) {
        this.toggleFullscreen();
      }
    }, 800);

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
   * Load template customizations from API
   */
  loadStoredCustomizations(): void {
    // Check authentication first
    if (!this.isAuthenticated()) {
      console.log('User not authenticated, cannot load customizations');
      return;
    }

    // Get template ID from route params or stored ID
    const templateId =
      this.route.snapshot.queryParams['templateId'] ||
      this.currentUserTemplateId ||
      sessionStorage.getItem('selectedTemplateId');

    if (!templateId) {
      console.log('No template ID found, cannot load customizations');
      return;
    }

    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('active');

    // Load template from API
    if (!this.userTemplateService) {
      console.error('UserTemplateService not initialized');
      this.showLoadingOverlay.set(false);
      return;
    }

    this.userTemplateService.getUserTemplateById(templateId).subscribe({
      next: (template) => {
        if (template && template.config) {
          console.log('Loaded user template from API:', template);

          // Store the template ID for future updates
          this.currentUserTemplateId = template.id;

          // Parse the config string to get customizations
          try {
            const customizationsData = JSON.parse(template.config);

            // Set business type based on template data
            if (template.template?.templateType?.key) {
              this.businessType.set(template.template.templateType.key);
            }

            // Apply the loaded customizations
            this.applyCustomizations(customizationsData);

            // Update last saved state to track changes
            this.lastSavedState.set(structuredClone(customizationsData));
            this.currentEditingState.set(structuredClone(customizationsData));
          } catch (e) {
            console.error('Error parsing template config:', e);
            this.confirmationService.showConfirmation(
              'Error parsing template configuration. Using default settings.',
              'error',
              5000
            );
          }

          // Set appropriate flags for editing flow
          this.hasStartedBuilding.set(true);
          this.hasSavedChangesFlag.set(true);
          this.currentStep.set(3); // Move to editing step

          // Hide loading overlay
          setTimeout(() => {
            this.showLoadingOverlay.set(false);
            this.loadingOverlayClass.set('');
          }, 500);
        } else {
          console.warn('Template has no config:', template);
          this.showLoadingOverlay.set(false);
        }
      },
      error: (error) => {
        console.error('Error loading template from API:', error);
        this.confirmationService.showConfirmation(
          'Failed to load template: ' + (error.message || 'Unknown error'),
          'error',
          5000
        );
        this.showLoadingOverlay.set(false);
      },
    });
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

  upgradeNow(): void {
    this.selectPlan('premium');
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
    // Check if user is authenticated
    if (!this.isAuthenticated()) {
      this.confirmationService.showConfirmation(
        'Please log in or sign up to publish your website.',
        'info',
        4000
      );
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    // Check if we have a currentUserTemplateId
    if (!this.currentUserTemplateId) {
      // Try to save first
      this.confirmationService.showConfirmation(
        'Please save your changes before publishing.',
        'info',
        3000
      );
      return;
    }

    // Show loading state
    this.confirmationService.showConfirmation(
      'Preparing to publish your website...',
      'info',
      3000
    );

    // First get a default subscription based on plan type
    const planMapping: Record<string, 'BASIC' | 'ADVANCED'> = {
      standard: 'BASIC',
      premium: 'ADVANCED',
    };

    // We need to update this mapping once backend is updated
    const subscriptionType = planMapping[this.currentPlan()];

    if (!this.subscriptionService) {
      console.error('SubscriptionService not initialized');
      return;
    }

    this.subscriptionService
      .getDefaultSubscription(subscriptionType)
      .pipe(
        switchMap((subscription) => {
          // Now we have the subscription, let's create and publish the build
          if (!this.userBuildService) {
            throw new Error('UserBuildService not initialized');
          }

          if (!this.currentUserTemplateId) {
            throw new Error('No user template ID found');
          }

          return this.userBuildService.buildAndPublishTemplate(
            this.currentUserTemplateId,
            subscription.id
          );
        })
      )
      .subscribe({
        next: (build) => {
          console.log('Build completed successfully:', build);

          // Set flag for completed checkout
          sessionStorage.setItem('hasCompletedCheckout', 'true');

          // Update step to 4 (final step)
          this.currentStep.set(4);

          // Store the published URL
          if (build.address?.address) {
            sessionStorage.setItem('publishedUrl', build.address.address);

            // Show success message with the URL
            this.confirmationService.showConfirmation(
              `Your website has been successfully published! You can view it at ${build.address.address}`,
              'success',
              6000
            );

            // Open the published URL in a new tab
            window.open(build.address.address, '_blank');
          } else {
            // Show success message without URL
            this.confirmationService.showConfirmation(
              'Your website has been successfully published!',
              'success',
              4000
            );
          }
        },
        error: (error) => {
          console.error('Error publishing website:', error);
          this.confirmationService.showConfirmation(
            'Failed to publish your website: ' +
              (error.message || 'Unknown error'),
            'error',
            5000
          );
        },
      });
  }

  // ======== SAVE & RESET ACTIONS ========
  /**
   * Save customizations
   * For authenticated users - save to backend
   */
  saveAllChanges(): void {
    console.log('Saving customizations:', this.customizations());

    if (this.isAuthenticated()) {
      // Use the userTemplateService to save to backend
      const templateId = sessionStorage.getItem('selectedTemplateId') || '1'; // Default to template ID 1 if not set
      const templateName = 'My Webcraft Website'; // TODO: Get from user input

      if (!this.userTemplateService) {
        console.error('UserTemplateService not initialized');
        return;
      }

      // Create a deep copy of customizations to modify before saving
      const customizationsToSave = structuredClone(this.customizations());

      // Clean up video data which might exceed API limits
      this.sanitizeCustomizationsForStorage(customizationsToSave);

      this.userTemplateService
        .saveUserTemplate(
          templateId,
          templateName,
          customizationsToSave,
          this.currentUserTemplateId
        )
        .subscribe({
          next: (savedTemplate) => {
            console.log(
              'Template saved successfully to backend:',
              savedTemplate
            );

            // Store the user template ID for future updates
            this.currentUserTemplateId = savedTemplate.id;

            // Set flags to indicate successful save
            this.hasStartedBuilding.set(true);
            this.hasSavedChangesFlag.set(true);

            // Update progress step
            this.currentStep.set(4);

            // Update lastSavedState to track what was saved
            this.lastSavedState.set(structuredClone(this.customizations()));
            this.currentEditingState.set(
              structuredClone(this.customizations())
            );

            // Show confirmation message
            this.confirmationService.showConfirmation(
              'Your website changes have been saved successfully!',
              'success',
              4000
            );

            // Exit fullscreen mode if needed
            if (this.isFullscreen()) {
              this.toggleFullscreen();
            }
          },
          error: (error) => {
            console.error('Error saving template to backend:', error);
            this.confirmationService.showConfirmation(
              'Failed to save your website: ' +
                (error.message || 'Unknown error'),
              'error',
              5000
            );
          },
        });
    } else {
      // For unauthenticated users, redirect to login
      this.confirmationService.showConfirmation(
        'Please log in or sign up to save your website.',
        'info',
        4000
      );
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
    }

    // Exit fullscreen mode
    if (this.isFullscreen()) {
      this.toggleFullscreen();
    }
  }

  /**
   * Helper method to sanitize customizations for API storage
   * Removes large data URLs and other problematic data
   */
  private sanitizeCustomizationsForStorage(
    customizations: Customizations
  ): void {
    // Handle video data in hero sections
    if (customizations.pages?.home?.hero1?.backgroundVideo) {
      const videoSrc = customizations.pages.home.hero1.backgroundVideo;

      // If it's a data URL (usually very large), replace with a flag
      if (typeof videoSrc === 'string' && videoSrc.startsWith('data:video')) {
        console.log('Removing large video data URL before API storage');
        // Mark with a placeholder
        (customizations.pages.home.hero1 as any)._videoPlaceholder =
          'VIDEO_DATA_PLACEHOLDER';
        delete customizations.pages.home.hero1.backgroundVideo;
      }
    }

    // TODO: Process other large images if needed
    // This would involve uploading them through the attachment API
    // and replacing the data URLs with references to the uploaded files
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

      // remove loading overlay
      this.showLoadingOverlay.set(false);
      this.loadingOverlayClass.set('');

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
      // Use the business config service to ensure all required objects exist
      return this.businessConfigService.ensureCompleteCustomizationStructure(
        current,
        this.businessType(),
        this.currentPlan()
      );
    });
  }

  private generateDefaultTheme(businessType: string, planType: string): any {
    return {
      id: 1,
      name: 'Default theme',
      cssContent: '',
      businessType: businessType,
      customizations: this.businessConfigService.generateDefaultCustomizations(
        businessType,
        planType as 'standard' | 'premium'
      ),
    };
  }

  private applyTheme(theme: ThemeData): void {
    // Process customizations
    if (theme.customizations) {
      // Update global customizations signal
      this.customizations.set(theme.customizations);
    }

    console.log('Applied theme:', theme.name);
  }

  /**
   * Initialize menu items based on business type
   */
  private initializeMenuItemsByBusinessType(): Array<{
    id: number;
    label: string;
    link: string;
  }> {
    return this.businessConfigService.getMenuItemsForBusinessType(
      this.businessType(),
      this.currentPlan()
    );
  }

  // In class definition after isSaving signal
  currentUserTemplateId: string | undefined;

  // Fix: Convert from property to signal
  currentScreenSize = signal<ScreenSize>(ScreenSize.DESKTOP);

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
        // In edit mode, we may need to refresh the UI
        console.log('🔍 Exiting edit mode');
        // No need to revert to saved customizations as we're using API now
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
      if (!this.showBusinessTypeSelector())
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

    // Then enter fullscreen to show the view
    if (!this.isFullscreen()) {
      this.toggleFullscreen();
    }
  }

  /**
   * Exit view-only mode and switch to edit mode
   * Enhanced to ensure complete state transition
   */
  exitViewOnly(): void {
    console.log('🔍 Exiting view-only mode');

    // Show loading overlay for visual feedback
    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('transition-overlay');

    // Reset view-only state
    this.isViewOnlyStateService.setIsOnlyViewMode(false);

    // Ensure we're in desktop view for editing
    if (this.currentScreenSize() !== ScreenSize.DESKTOP) {
      this.currentScreenSize.set(ScreenSize.DESKTOP);
    }

    // If we're in fullscreen, update URL params without full navigation
    if (this.isFullscreen()) {
      this.updateUrlParams({ viewOnly: 'false', mode: 'edit' });
    }

    // Hide loading overlay after a short delay
    setTimeout(() => {
      this.showLoadingOverlay.set(false);

      // Consider the user has just arrived at step 2 in the building process
      this.currentStep.set(2);

      // If user came from view-only with business type selected,
      // ensure the app knows we're editing with a type
      if (this.businessType()) {
        console.log('Business type already selected:', this.businessType());
      }
    }, 800);
  }

  /**
   * Helper method to update URL parameters without navigation
   */
  private updateUrlParams(params: { [key: string]: string }): void {
    // Get current params
    const urlTree = this.router.createUrlTree([], {
      queryParams: params,
      queryParamsHandling: 'merge',
    });

    // Update URL without navigation
    this.location.go(urlTree.toString());
  }

  /**
   * Called when loading overlay animation completes
   */
  onLoadingOverlayFinished(): void {
    // Remove the overlay by setting the controlling signal to false
    this.showLoadingOverlay.set(false);
  }
}
