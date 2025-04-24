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
import { Subject, switchMap } from 'rxjs';
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
import { AuthService } from '../../core/services/auth/auth.service';
import { SelectionStateService } from '../../core/services/selection/selection-state.service';
import { TemplateService } from '../../core/services/template/template.service';
// Fixed import directly from service to avoid module resolution issues
import type { UserTemplate } from '../../core/services/template/user-template.service';
import type { Template } from '../../core/services/template/template.service';
import { BUSINESS_TYPES } from '../../core/models/business-types';

/**
 * PreviewComponent is the main interface for the website builder.
 * It allows authenticated users to customize website templates and view their changes
 * in both desktop and mobile layouts.
 *
 * This component handles the following workflows:
 * 1. Editing an existing template (loaded from API with templateId)
 * 2. Creating a new template (with predefined businessType and plan)
 * 3. Viewing a template in view-only mode
 *
 * All data persistence is handled via API calls with no reliance on sessionStorage.
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
  private templateService = inject(TemplateService);
  private renderer = inject(Renderer2);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private location = inject(Location);
  private modalStateService = inject(ScrollService);
  public isViewOnlyStateService = inject(ScrollService);
  private destroy$ = new Subject<void>();
  private themeColorsService = inject(ThemeColorsService);
  private businessConfigService = inject(BusinessConfigService);
  private userTemplateService = inject(UserTemplateService);
  private userBuildService = inject(UserBuildService);
  private subscriptionService = inject(SubscriptionService);
  private authService = inject(AuthService);
  private selectionStateService = inject(SelectionStateService);

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

  // Template identification state
  currentUserTemplateId = signal<string | null>(null);
  currentTemplateName = signal<string | null>(null);
  selectedBaseTemplateId = signal<string | null>(null);
  businessTypeDisplayName = signal<string>('');

  // UI state
  selectedComponent = signal<{
    key: string;
    name: string;
    path?: string;
  } | null>(null);

  // Product configuration
  currentPlan = signal<'standard' | 'premium'>('standard');
  businessType = signal<string>(''); // Selected business type
  showBusinessTypeSelector = signal<boolean>(false); // Control visibility of business type selector
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
  defaultThemeId = computed(() =>
    this.currentPlan() === 'standard' ? '1' : '4'
  );

  // Flag to prevent theme service from overriding user customizations
  private preventThemeOverride = signal<boolean>(false);

  // Check if editing is allowed (disabled when in mobile view)
  isEditingAllowed = computed(() => this.viewMode() === 'view-desktop');

  // Readonly state for preventing changes to businessType after creation
  isBusinessTypeReadonly = computed(
    () => this.currentUserTemplateId() !== null || this.isFullscreen()
  );

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

    // Otherwise use the key directly with type assertion
    const customData = (this.customizations() as any)[selected.key];

    console.log('Selected component data for key:', selected.key, customData);

    return {
      key: selected.key,
      name: selected.name,
      data: customData,
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

    // Handle window resize for mobile view detection
    window.addEventListener('resize', this.updateIsMobile.bind(this));

    // Add fullscreen change event listener
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);

    // Initial class application for fullscreen state
    if (this.isFullscreen()) {
      document.body.classList.add('fullscreen-mode');
    }

    // Don't require authentication for initial preview view
    // Only check authentication when starting to build or accessing specific functionality

    // Parse route parameters to determine the operation mode
    this.parseRouteParameters();
  }

  /**
   * Parse route parameters to determine operation mode and initialize component state
   */
  private parseRouteParameters(): void {
    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('active');

    this.route.queryParams.subscribe((params) => {
      console.log('Processing route parameters:', params);

      // Set plan from params or default to standard
      const plan = params['plan'] || 'standard';
      this.currentPlan.set(plan as 'standard' | 'premium');

      // Update consolidated state
      this.templateState.update((state) => ({
        ...state,
        plan: plan as 'standard' | 'premium',
      }));

      // Set step from URL if provided, otherwise it will be calculated based on context
      const urlStep = params['step'] ? parseInt(params['step'], 10) : null;

      // Handle business type from params
      const urlBusinessType = params['businessType'];
      if (urlBusinessType) {
        console.log(`Business type found in URL: ${urlBusinessType}`);
        this.businessType.set(urlBusinessType);

        // Set business type display name
        this.setBusinessTypeDisplayName(urlBusinessType);

        // Update consolidated state
        this.templateState.update((state) => ({
          ...state,
          businessType: urlBusinessType,
          businessTypeName: this.businessTypeDisplayName(),
        }));

        // Always hide the selector when business type is in URL
        this.showBusinessTypeSelector.set(false);
      }

      // Determine the operation mode
      const templateId = params['templateId'];
      const newTemplate = params['newTemplate'] === 'true';
      const mode = params['mode'] || 'edit';

      // Check if authentication is required for this operation
      const requiresAuth = templateId || newTemplate || mode === 'edit';

      if (requiresAuth && !this.authService.isAuthenticated()) {
        console.log(
          'Authentication required for this operation - showing preview without editing'
        );
        // Don't redirect yet, allow preview and redirect only when they try to edit
        this.showLoadingOverlay.set(false);
        return;
      }

      // Set steps based on operation mode
      if (templateId) {
        // Edit or view existing template mode - should be on step 3 or 4
        console.log(`Loading template ${templateId} in ${mode} mode`);
        // If step isn't explicitly provided, set to editing step (3) or completed step (4)
        if (!urlStep) {
          this.currentStep.set(params['mode'] === 'view' ? 3 : 4);
        } else {
          this.currentStep.set(urlStep);
        }
        this.loadExistingTemplate(templateId, mode);
      } else if (newTemplate) {
        // New template creation mode - should be on step 3
        console.log(
          'Creating new template with business type:',
          urlBusinessType
        );
        this.currentStep.set(urlStep || 3); // Default to step 3 if not specified
        this.initializeNewTemplate(urlBusinessType);
      } else if (urlBusinessType) {
        // Just a business type selection but no template action yet
        // Still proceed with initialization to ensure proper UI state
        console.log('Business type selected but no template action specified');
        this.loadThemesForBusinessType(urlBusinessType);
        this.hasStartedBuilding.set(true);
        this.currentStep.set(urlStep || 3); // Business type selection + plan are done
        this.showLoadingOverlay.set(false);
      } else {
        // No template ID, creation flag, or business type - show business type selector
        console.log(
          'No template parameters found, showing business type selector'
        );
        this.currentStep.set(urlStep || 2); // Business type selection step
        this.showBusinessTypeSelector.set(true);
        this.showLoadingOverlay.set(false);
      }

      // Update URL with current step if not already there
      if (this.currentStep() && !urlStep) {
        this.updateUrlParams({ step: this.currentStep().toString() });
      }
    });
  }

  /**
   * Load an existing template from the API with improved error handling
   */
  private loadExistingTemplate(templateId: string, mode: string): void {
    // Show loading state
    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('active');

    console.log(`Loading template with ID ${templateId} in ${mode} mode`);

    this.userTemplateService
      .getUserTemplateById(templateId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (template) => {
          console.log('Loaded user template from API:', template);

          if (!template) {
            this.handleTemplateLoadError('Template not found');
            return;
          }

          // Store the template ID and name regardless of whether config parsing succeeds
          this.currentUserTemplateId.set(template.id);
          this.currentTemplateName.set(template.name);

          // Update consolidated state
          this.templateState.update((state) => ({
            ...state,
            id: template.id,
            name: template.name,
          }));

          // Set business type based on template data
          if (template.template?.templateType?.key) {
            const templateType = template.template.templateType.key;
            this.businessType.set(templateType);

            // Update consolidated state
            this.templateState.update((state) => ({
              ...state,
              businessType: templateType,
            }));

            // Get the display name for the business type
            this.setBusinessTypeDisplayName(templateType);

            // Load themes for this business type
            this.loadThemesForBusinessType(templateType);
          }

          // Process the config if available
          if (template.config) {
            try {
              // Safely parse the config string
              const configStr = template.config.trim();
              console.log(
                'Template config string:',
                configStr.substring(0, 100) + '...'
              );

              let customizationsData;
              // Make sure it's a valid JSON string before parsing
              if (configStr.startsWith('{') && configStr.endsWith('}')) {
                customizationsData = JSON.parse(configStr);
              } else {
                throw new Error('Invalid config format');
              }

              // Apply the loaded customizations
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

              // Update tracking state
              this.lastSavedState.set(structuredClone(customizationsData));
              this.currentEditingState.set(structuredClone(customizationsData));

              console.log(
                'Successfully loaded and applied template configuration'
              );

              // Set appropriate flags for editing flow
              this.hasStartedBuilding.set(true);
              this.hasSavedChangesFlag.set(true);
              this.currentStep.set(3); // Move to editing step

              // Switch to appropriate mode after a short delay
              setTimeout(() => {
                if (mode === 'edit') {
                  this.editBuilding();
                } else if (mode === 'view') {
                  this.openViewOnly();
                }

                // Hide loading state inside the timeout to ensure smooth transition
                this.showLoadingOverlay.set(false);
              }, 300);
            } catch (e) {
              console.error('Error processing template config:', e);

              // Even if config parsing fails, initialize with defaults and proceed
              this.initializeDefaultCustomizations();

              this.confirmationService.showConfirmation(
                'Error processing template configuration. Using default settings.',
                'warning',
                5000
              );

              // Hide loading and set the appropriate mode
              this.showLoadingOverlay.set(false);

              // Still allow editing even with default settings
              this.hasStartedBuilding.set(true);

              // Switch to appropriate mode with default settings
              setTimeout(() => {
                if (mode === 'edit') {
                  this.editBuilding();
                } else if (mode === 'view') {
                  this.openViewOnly();
                }
              }, 300);
            }
          } else {
            console.warn('Template has no config:', template);
            this.initializeDefaultCustomizations();
            this.confirmationService.showConfirmation(
              'Template has no configuration data. Using default settings.',
              'warning',
              3000
            );

            // Hide loading and set the appropriate mode
            this.showLoadingOverlay.set(false);

            // Still allow editing even with default settings
            this.hasStartedBuilding.set(true);

            // Switch to appropriate mode with default settings
            setTimeout(() => {
              if (mode === 'edit') {
                this.editBuilding();
              } else if (mode === 'view') {
                this.openViewOnly();
              }
            }, 300);
          }
        },
        error: (error) => {
          this.handleTemplateLoadError(error);
        },
      });
  }

  /**
   * Handle template loading errors with consistent messaging
   */
  private handleTemplateLoadError(error: any): void {
    console.error('Error loading template from API:', error);
    this.confirmationService.showConfirmation(
      'Failed to load template: ' + (error.message || 'Unknown error'),
      'error',
      5000
    );
    this.showLoadingOverlay.set(false);

    // Initialize with defaults so user can still work with the template
    this.initializeDefaultCustomizations();
    this.hasStartedBuilding.set(true);
  }

  /**
   * Initialize state for creating a new template with improved handling
   */
  private initializeNewTemplate(businessType?: string): void {
    // Show loading while we initialize
    this.showLoadingOverlay.set(true);

    // If business type is provided, initialize with it
    if (businessType) {
      // Set in both individual signals and consolidated state
      this.businessType.set(businessType);

      // Get business type display name
      const businessTypeObj = this.businessTypes.find(
        (t) => t.id === businessType
      );

      const displayName = businessTypeObj
        ? businessTypeObj.name
        : businessType.charAt(0).toUpperCase() + businessType.slice(1);

      this.businessTypeDisplayName.set(displayName);

      // Update consolidated state
      this.templateState.update((state) => ({
        ...state,
        businessType: businessType,
        businessTypeName: displayName,
        name: `${displayName} Website`, // Use business type in the default name
      }));

      this.showBusinessTypeSelector.set(false);

      // Load themes for this business type
      this.loadThemesForBusinessType(businessType);

      // Set to customization step
      this.currentStep.set(3);

      // Update URL with step
      this.updateUrlParams({ step: '3' });
    } else {
      // Show business type selector since no type is provided
      this.showBusinessTypeSelector.set(true);
      this.currentStep.set(2);

      // Update URL with step
      this.updateUrlParams({ step: '2' });
    }

    // Initialize customizations with defaults - will use business type if set
    this.initializeDefaultCustomizations();

    // Set flags for new template flow
    this.hasStartedBuilding.set(true);

    // Enter fullscreen edit mode after a brief delay
    setTimeout(() => {
      this.showLoadingOverlay.set(false);
      if (!this.isFullscreen()) {
        this.toggleFullscreen();
      }
    }, 500);
  }

  /**
   * Set the business type display name from the key
   */
  private setBusinessTypeDisplayName(businessTypeKey: string): void {
    const businessTypeObj = this.businessTypes.find(
      (type) => type.id === businessTypeKey
    );
    if (businessTypeObj) {
      this.businessTypeDisplayName.set(businessTypeObj.name);
    } else {
      // Fall back to the key with first letter capitalized if no match
      this.businessTypeDisplayName.set(
        businessTypeKey.charAt(0).toUpperCase() + businessTypeKey.slice(1)
      );
    }
  }

  /**
   * Initialize customizations with default values for the selected business type
   */
  private initializeDefaultCustomizations(): void {
    const businessTypeKey = this.businessType();
    const plan = this.currentPlan();

    if (businessTypeKey) {
      // Use BusinessConfigService to generate appropriate defaults
      const defaultCustomizations =
        this.businessConfigService.generateDefaultCustomizations(
          businessTypeKey,
          plan
        );

      this.customizations.set(defaultCustomizations);

      // Set initial font from the default customizations
      if (defaultCustomizations.fontConfig) {
        this.selectedFont.set({
          id: defaultCustomizations.fontConfig.fontId,
          family: defaultCustomizations.fontConfig.family,
          fallback: defaultCustomizations.fontConfig.fallback,
        });
      }

      // Save these as the initial state
      this.lastSavedState.set(structuredClone(defaultCustomizations));
      this.currentEditingState.set(structuredClone(defaultCustomizations));
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

  // ======== BUSINESS TYPE HANDLING ========
  /**
   * Load themes filtered by business type
   */
  loadThemesForBusinessType(businessTypeKey: string): void {
    console.log(`Loading themes for business type key: ${businessTypeKey}`);

    // Always set loading state first
    this.availableThemes.set([]);

    // First, we need to get the template type ID that corresponds to the business type key
    this.templateService.getAllTemplateTypes().subscribe({
      next: (templateTypes) => {
        // Find the template type with matching key
        const templateType = templateTypes.find(
          (type) => type.key === businessTypeKey
        );

        if (!templateType) {
          console.error(
            `No template type found for business type key: ${businessTypeKey}`
          );
          this.availableThemes.set([]);
          this.confirmationService.showConfirmation(
            'Error finding template type. Please try again.',
            'error',
            3000
          );
          return;
        }

        console.log(
          `Found template type ID: ${templateType.id} for business type key: ${businessTypeKey}`
        );

        // Get plan ID based on current plan
        const planType = this.templateService.convertPlanType(
          this.currentPlan()
        );

        this.templateService.getTemplatePlanId(planType).subscribe({
          next: (planId) => {
            // Now search using the actual template type ID from the API
            this.templateService
              .searchTemplates(templateType.id, planId, 0, 5)
              .subscribe({
                next: (response) => {
                  console.log(
                    `Received ${
                      response.content.length
                    } templates for type ID ${
                      templateType.id
                    } with plan ${this.currentPlan()}`
                  );

                  // Save templates to signal
                  this.availableThemes.set(response.content);

                  // If we have templates and no base template ID is selected yet, select the first one
                  // Only auto-select if we don't have an existing template ID (new creation flow)
                  if (
                    response.content.length > 0 &&
                    !this.selectedBaseTemplateId() &&
                    !this.currentUserTemplateId()
                  ) {
                    const firstTemplateId = response.content[0].id;
                    console.log(
                      `Auto-selecting template ID ${firstTemplateId}`
                    );
                    this.selectedBaseTemplateId.set(firstTemplateId);
                    this.loadBaseTemplate(firstTemplateId);
                  }
                },
                error: (err) => {
                  console.error(
                    'Error loading templates for business type:',
                    err
                  );
                  // Set empty array to avoid undefined errors
                  this.availableThemes.set([]);
                  this.confirmationService.showConfirmation(
                    'Error loading templates. Please try again.',
                    'error',
                    3000
                  );
                },
              });
          },
          error: (err) => {
            console.error('Error getting plan ID:', err);
            this.confirmationService.showConfirmation(
              'Error loading plan information. Please try again.',
              'error',
              3000
            );
          },
        });
      },
      error: (err) => {
        console.error('Error loading template types:', err);
        this.confirmationService.showConfirmation(
          'Error loading template types. Please try again.',
          'error',
          3000
        );
        this.availableThemes.set([]);
      },
    });
  }

  /**
   * Load base template from API
   *
   * NOTE: This method assumes TemplateService.getTemplateById() exists in the API.
   * If missing, implement it in TemplateService to fetch a Template by ID from endpoint:
   * GET /template/{templateId}
   */
  loadBaseTemplate(templateId: string): void {
    console.log(`Loading base template with ID ${templateId}`);

    // Check if we have a current user template ID (editing existing template)
    if (this.currentUserTemplateId()) {
      console.log(
        'Skipping base template load since we are editing an existing template'
      );
      return;
    }

    // Check if we should prevent template from overriding saved customizations
    if (this.preventThemeOverride()) {
      console.log('🛡️ Template override prevention active - skipping');
      return;
    }

    this.templateService.getTemplateById(templateId).subscribe({
      next: (template: Template) => {
        console.log('Base template loaded successfully:', template);

        // Store the template ID
        this.selectedBaseTemplateId.set(template.id);

        // Get business type from template if not already set
        if (!this.businessType() && template.templateType?.key) {
          this.businessType.set(template.templateType.key);
          this.setBusinessTypeDisplayName(template.templateType.key);
        }

        // Parse config if available
        if (template.config) {
          try {
            const templateCustomizations = JSON.parse(template.config);

            if (!this.customizations()) {
              // No existing customizations, use template as base
              this.customizations.set(templateCustomizations);

              // Update font if available
              if (templateCustomizations.fontConfig) {
                const fontConfig = templateCustomizations.fontConfig;
                this.selectedFont.set({
                  id: fontConfig.fontId,
                  family: fontConfig.family,
                  fallback: fontConfig.fallback,
                });
              }

              // Update tracking state
              this.lastSavedState.set(structuredClone(templateCustomizations));
              this.currentEditingState.set(
                structuredClone(templateCustomizations)
              );
            } else {
              // Existing customizations - only apply theme and structural elements
              // but preserve user content changes
              this.customizations.update((current) => {
                if (!current) return templateCustomizations;

                // Create a merged customization object preserving user content
                // This is a simplified merge - a more complex merge might be needed
                const merged = structuredClone(templateCustomizations);

                // Preserve user content from existing customizations
                if (current.pages?.home?.hero1) {
                  merged.pages.home.hero1.title =
                    current.pages.home.hero1.title;
                  merged.pages.home.hero1.subtitle =
                    current.pages.home.hero1.subtitle;
                }

                if (current.pages?.home?.about) {
                  merged.pages.home.about.title =
                    current.pages.home.about.title;
                  merged.pages.home.about.subtitle =
                    current.pages.home.about.subtitle;
                  merged.pages.home.about.storyText =
                    current.pages.home.about.storyText;
                  merged.pages.home.about.missionText =
                    current.pages.home.about.missionText;
                }

                return merged;
              });
            }
          } catch (e) {
            console.error('Error parsing template config:', e);
            // If we can't parse the config, initialize with defaults
            this.initializeDefaultCustomizations();
          }
        } else {
          // No config, initialize with defaults
          this.initializeDefaultCustomizations();
        }
      },
      error: (err: Error) => {
        console.error('Error loading base template:', err);
        // Initialize with defaults if template loading fails
        this.initializeDefaultCustomizations();
      },
    });
  }

  /**
   * Handle business type selection from the selector component
   */
  handleBusinessTypeSelection(type: string): void {
    console.log('Business type selected:', type);

    // If business type changed, update it
    if (this.businessType() !== type) {
      // Update both individual signals and template state
      this.businessType.set(type);

      // Get business type display name
      const businessTypeObj = this.businessTypes.find((t) => t.id === type);

      const displayName = businessTypeObj
        ? businessTypeObj.name
        : type.charAt(0).toUpperCase() + type.slice(1);

      this.businessTypeDisplayName.set(displayName);

      // Clear the current available themes to force reload
      this.availableThemes.set([]);
      this.selectedBaseTemplateId.set(null);

      // Demonstrate updating the consolidated state directly
      // In a fully refactored approach, we would only use this method:
      this.templateState.update((state) => ({
        ...state,
        businessType: type,
        businessTypeName: displayName,
        baseId: null,
      }));

      // Load themes for this business type
      this.loadThemesForBusinessType(type);

      // Update URL to reflect business type (without navigation)
      this.updateUrlParams({
        businessType: type,
        step: '3', // Update step to 3 when business type is selected
      });

      // Initialize with default customizations for this business type
      this.initializeDefaultCustomizations();

      // Advance to step 3 (Customize) after selecting business type
      this.currentStep.set(3);

      // Hide selector after choosing in non-fullscreen mode
      if (!this.isFullscreen()) {
        this.showBusinessTypeSelector.set(false);
      }
    }
  }

  /**
   * Helper method to update URL parameters without navigation
   */
  private updateUrlParams(params: { [key: string]: string | null }): void {
    // Get current params and filter out null values
    const cleanParams: { [key: string]: string } = {};

    // Process params to handle null values (removes the parameter)
    Object.keys(params).forEach((key) => {
      if (params[key] !== null) {
        cleanParams[key] = params[key] as string;
      }
    });

    // Create URL tree with cleaned params
    const urlTree = this.router.createUrlTree([], {
      queryParams: cleanParams,
      queryParamsHandling: 'merge',
    });

    // Update URL without navigation
    this.location.go(urlTree.toString());
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
   * Start building a new website
   */
  startBuilding(): void {
    console.log('Starting building process');

    // Check authentication before starting build process
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated - redirecting to login');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.showLoadingOverlay.set(true);

    // Set view mode to editing
    this.isViewOnlyStateService.setIsOnlyViewMode(false);

    // Set building flag
    this.hasStartedBuilding.set(true);

    // Check if we have a business type selected
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
      console.log('Toggling fullscreen');

      // Initialize customizations if not already done
      if (!this.customizations()) {
        this.initializeDefaultCustomizations();
      }

      // Store current state for potential restore
      this.lastSavedState.set(structuredClone(this.customizations()));
      this.currentEditingState.set(structuredClone(this.customizations()));

      this.loadingOverlayClass.set('fade-out');
      this.showLoadingOverlay.set(false);
      this.toggleFullscreen();
    }, 1000);
  }

  /**
   * Re-enter edit mode from main screen (Continue Editing)
   */
  editBuilding(): void {
    console.log('🔍 editBuilding called - continuing editing');

    // Set loading overlay for visual feedback
    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('transition-overlay');

    // Reset view-only flag to ensure we're in edit mode
    this.isViewOnlyStateService.setIsOnlyViewMode(false);

    // Set the flag to prevent theme from overriding saved customizations
    this.preventThemeOverride.set(true);

    // Update URL parameters to indicate we're in edit mode
    this.updateUrlParams({
      viewOnly: 'false',
      mode: 'edit',
      step: '4', // Update step when editing
    });

    // Enter fullscreen mode
    if (!this.isFullscreen()) {
      this.toggleFullscreen();

      // Keep loading visible for a bit after entering fullscreen to ensure smooth transition
      setTimeout(() => {
        this.showLoadingOverlay.set(false);
      }, 600);
    } else {
      // If already in fullscreen, just hide the loading after a short delay
      setTimeout(() => {
        this.showLoadingOverlay.set(false);
      }, 300);
    }

    // Keep prevention active for a short time
    setTimeout(() => {
      console.log('🔍 Theme override prevention disabled after initialization');
      this.preventThemeOverride.set(false);
    }, 1000);
  }

  /**
   * Enter view-only mode without editing controls
   */
  openViewOnly(): void {
    // Set view mode flag
    this.isViewOnlyStateService.setIsOnlyViewMode(true);

    // Update URL parameters
    this.updateUrlParams({ viewOnly: 'true', mode: 'view' });

    // Then enter fullscreen to show the view
    if (!this.isFullscreen()) {
      this.toggleFullscreen();
    }
  }

  /**
   * Exit view-only mode and switch to edit mode
   */
  exitViewOnly(): void {
    console.log('🔍 Exiting view-only mode');

    // Show loading overlay for visual feedback
    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('transition-overlay');

    // Reset view-only state
    this.isViewOnlyStateService.setIsOnlyViewMode(false);

    // Ensure we're in desktop view for editing
    if (this.viewMode() !== 'view-desktop') {
      this.viewMode.set('view-desktop');
    }

    // Update URL params
    this.updateUrlParams({ viewOnly: 'false', mode: 'edit' });

    // Hide loading overlay after a short delay
    setTimeout(() => {
      this.showLoadingOverlay.set(false);
    }, 500);
  }

  /**
   * Apply global CSS styles from a template
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

      // Add fullscreen class to body
      document.body.classList.add('fullscreen-mode');
    } else {
      // EXITING FULLSCREEN
      console.log('🔍 Exiting fullscreen mode');

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

      // Remove fullscreen class from body
      document.body.classList.remove('fullscreen-mode');
    }
  }

  /**
   * Handle fullscreen change events from browser
   */
  handleFullscreenChange = (): void => {
    if (!document.fullscreenElement && this.isFullscreen()) {
      // Browser exited fullscreen - update our state
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

      // Remove fullscreen class from body
      document.body.classList.remove('fullscreen-mode');
    }
  };

  /**
   * Update mobile view signal on window resize
   */
  updateIsMobile(): void {
    const isNowMobile = window.innerWidth <= 768;
    if (this.isMobileView() !== isNowMobile) {
      this.isMobileView.set(isNowMobile);

      // If switching to mobile, ensure we're in desktop view mode
      // since editing is not allowed in mobile view
      if (isNowMobile && this.viewMode() === 'view-mobile') {
        this.viewMode.set('view-desktop');
      }
    }
  }

  /**
   * Toggle between desktop and mobile view modes
   */
  toggleView(mode: 'view-desktop' | 'view-mobile'): void {
    // If switching to mobile view, close any open component editor
    if (mode === 'view-mobile' && this.selectedComponent()) {
      this.selectedComponent.set(null);
    }

    this.viewMode.set(mode);
  }

  // ======== VIEWING & EDITING MODES ========
  /**
   * Called when loading overlay animation completes
   */
  onLoadingOverlayFinished(): void {
    // Remove the overlay by setting the controlling signal to false
    this.showLoadingOverlay.set(false);
  }

  /**
   * Save all customizations to the API with improved error handling
   */
  saveAllChanges(): void {
    if (!this.customizations()) {
      this.confirmationService.showConfirmation(
        'No customizations to save',
        'error',
        3000
      );
      return;
    }

    // Check if we have a business type - it's required for template creation/update
    if (!this.businessType()) {
      this.confirmationService.showConfirmation(
        'Please select a business type before saving',
        'warning',
        3000
      );
      return;
    }

    console.log('Saving customizations to API');

    // Show loading state
    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('active');

    // Create a deep copy of customizations to modify before saving
    const customizationsToSave = structuredClone(this.customizations());

    // Remove any problematic data (like large data URLs)
    this.sanitizeCustomizationsForStorage(customizationsToSave);

    // Check if this is a new template (first save)
    const isNewTemplate = !this.currentUserTemplateId();

    // If this is a new template, we should prompt for a name
    let templateName =
      this.currentTemplateName() ||
      `${this.businessTypeDisplayName() || 'My'} Website`;

    if (isNewTemplate) {
      // For simplicity, we'll use the browser's prompt
      // In a production app, this would be a proper modal dialog
      const suggestedName = templateName;
      const userProvidedName = prompt(
        'Enter a name for your template:',
        suggestedName
      );

      // If user cancels, abort the save
      if (userProvidedName === null) {
        this.showLoadingOverlay.set(false);
        return;
      }

      // Use user provided name if not empty, otherwise keep the original
      templateName = userProvidedName?.trim() || templateName;

      // Update the template name
      this.currentTemplateName.set(templateName);

      // Update consolidated state
      this.templateState.update((state) => ({
        ...state,
        name: templateName,
      }));
    }

    // Determine if we're creating or updating a template
    const currentTemplateId = this.currentUserTemplateId();
    let baseTemplateId = this.selectedBaseTemplateId();

    // If we're creating a new template but don't have a selected base template ID,
    // try to get the first available template ID from availableThemes
    if (isNewTemplate && !baseTemplateId && this.availableThemes().length > 0) {
      baseTemplateId = this.availableThemes()[0].id;
      console.log(`Using first available template ID: ${baseTemplateId}`);
    }

    console.log(
      `Saving template with ${isNewTemplate ? 'creation' : 'update'} mode:`
    );
    console.log(`- Name: ${templateName}`);
    console.log(`- Current ID: ${currentTemplateId || 'N/A'}`);
    console.log(`- Base Template ID: ${baseTemplateId || 'N/A'}`);
    console.log(`- Business Type: ${this.businessType()}`);

    if (isNewTemplate && !baseTemplateId) {
      this.confirmationService.showConfirmation(
        'Unable to save: No base template ID available for creation. Please select a template first.',
        'error',
        3000
      );
      this.showLoadingOverlay.set(false);
      return;
    }

    // Make sure baseTemplateId is valid for creation
    if (
      isNewTemplate &&
      (!baseTemplateId ||
        baseTemplateId === 'undefined' ||
        baseTemplateId === 'null')
    ) {
      this.confirmationService.showConfirmation(
        'Invalid base template selected. Please try selecting a template again.',
        'error',
        3000
      );
      this.showLoadingOverlay.set(false);
      return;
    }

    // Save to the API
    this.userTemplateService
      .saveUserTemplate(
        baseTemplateId || '', // Use base template ID for creation
        templateName,
        customizationsToSave,
        currentTemplateId || undefined // Use current ID for updates
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (savedTemplate) => {
          console.log('Template saved successfully:', savedTemplate);

          // Update template ID and name in both approaches
          this.currentUserTemplateId.set(savedTemplate.id);
          this.currentTemplateName.set(savedTemplate.name);

          // Update consolidated state
          this.templateState.update((state) => ({
            ...state,
            id: savedTemplate.id,
            name: savedTemplate.name,
          }));

          // Update state flags
          this.hasStartedBuilding.set(true);
          this.hasSavedChangesFlag.set(true);

          // Update last saved state for change tracking
          this.lastSavedState.set(structuredClone(this.customizations()));
          this.currentEditingState.set(structuredClone(this.customizations()));

          // Update progress step
          this.currentStep.set(4);

          // Update URL to include the template ID without refreshing
          this.updateUrlParams({
            templateId: savedTemplate.id,
            mode: 'edit',
            newTemplate: null, // Remove the newTemplate flag
          });

          // Hide loading state
          this.showLoadingOverlay.set(false);

          // Show success message
          this.confirmationService.showConfirmation(
            `Your website ${
              isNewTemplate ? 'has been created' : 'changes have been saved'
            } successfully!`,
            'success',
            3000
          );

          // Exit fullscreen mode if active
          if (this.isFullscreen()) {
            this.toggleFullscreen();
          }
        },
        error: (error) => {
          console.error('Error saving template:', error);
          console.error(
            'Error details:',
            error.error?.message || error.message
          );
          console.error('Error status:', error.status);
          console.error('Error response:', error.error);

          // Hide loading state
          this.showLoadingOverlay.set(false);

          // Show error message
          this.confirmationService.showConfirmation(
            'Failed to save your website: ' +
              (error.error?.message || error.message || 'Unknown error'),
            'error',
            5000
          );
        },
      });
  }

  /**
   * Reset customizations to their last saved state or defaults
   */
  resetCustomizations(): void {
    // Ask for confirmation first
    if (
      !confirm(
        'Are you sure you want to reset all changes? This will start a new template with the same business type and plan.'
      )
    ) {
      return;
    }

    // Show loading state
    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('active');

    // Preserve current business type and plan
    const currentBusinessType = this.businessType();
    const currentPlan = this.currentPlan();

    // Clear template ID and name to start fresh
    this.currentUserTemplateId.set(null);
    this.currentTemplateName.set(null);

    // Manually update the browser URL by completely removing the template-related parameters
    // This is more thorough than just setting them to null with updateUrlParams
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('templateId');
    currentUrl.searchParams.delete('mode');
    currentUrl.searchParams.delete('viewOnly');
    // Make sure we keep or set the business type and plan
    currentUrl.searchParams.set('businessType', currentBusinessType);
    currentUrl.searchParams.set('plan', currentPlan);
    currentUrl.searchParams.set('newTemplate', 'true');

    // Use history API to update URL without navigation
    window.history.replaceState({}, '', currentUrl.toString());

    // Set flag to create new template
    this.hasStartedBuilding.set(false);
    this.hasSavedChangesFlag.set(false);

    // Initialize with defaults for the current business type
    this.initializeDefaultCustomizations();

    // Reset selected component
    this.selectedComponent.set(null);

    // Reset view mode
    this.isViewOnlyStateService.setIsOnlyViewMode(false);

    // Hide loading and exit fullscreen mode
    this.showLoadingOverlay.set(false);
    if (this.isFullscreen()) {
      this.toggleFullscreen();
    }

    // Show confirmation
    this.confirmationService.showConfirmation(
      'Template has been reset. You can now start creating a new template.',
      'info',
      3000
    );
  }

  /**
   * Handle errors during reset operation
   */
  private handleResetError(message: string): void {
    console.error(message);
    this.showLoadingOverlay.set(false);

    // Show error message
    this.confirmationService.showConfirmation(message, 'error', 3000);

    // Fallback to default customizations
    this.initializeDefaultCustomizations();
    this.selectedComponent.set(null);
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
      const videoSrc = customizations.pages?.home.hero1.backgroundVideo;

      // If it's a data URL (usually very large), replace with a flag
      if (typeof videoSrc === 'string' && videoSrc.startsWith('data:video')) {
        console.log('Removing large video data URL before API storage');
        // Mark with a placeholder
        (customizations.pages?.home.hero1 as any)._videoPlaceholder =
          'VIDEO_DATA_PLACEHOLDER';
        delete customizations.pages?.home.hero1.backgroundVideo;
      }
    }

    // Process other large images if needed
    // This would involve uploading them through the attachment API
    // and replacing the data URLs with references to the uploaded files
  }

  /**
   * Check if user has saved changes
   */
  hasSavedChanges(): boolean {
    return this.hasSavedChangesFlag();
  }

  /**
   * Select a plan (standard or premium) with improved state handling
   */
  selectPlan(plan: 'standard' | 'premium'): void {
    // Update both individual signal and consolidated state
    this.currentPlan.set(plan);

    // Update consolidated state
    this.templateState.update((state) => ({
      ...state,
      plan: plan,
    }));

    // If user changes plan after starting, we need to update the theme
    if (this.hasStartedBuilding()) {
      // Reset base template ID since plan changed
      this.selectedBaseTemplateId.set(null);

      // Update consolidated state
      this.templateState.update((state) => ({
        ...state,
        baseId: null,
      }));

      // Load new themes for the business type with new plan
      const currentBusinessType = this.businessType();
      if (currentBusinessType) {
        this.loadThemesForBusinessType(currentBusinessType);
      }
    }

    // Update current step if we're just starting
    if (this.currentStep() === 1) {
      this.currentStep.set(2);
    }

    // Update URL to reflect plan change
    this.updateUrlParams({ plan });
  }

  /**
   * Upgrade from standard to premium plan
   */
  upgradeNow(): void {
    this.selectPlan('premium');
  }

  /**
   * Proceed to checkout after saving website changes
   * This creates a build and publishes the website
   */
  proceedToCheckout(): void {
    // Ensure we have a currentUserTemplateId
    if (!this.currentUserTemplateId()) {
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

    // Map to backend subscription type
    const subscriptionType = planMapping[this.currentPlan()];

    this.subscriptionService
      .getDefaultSubscription(subscriptionType)
      .pipe(
        switchMap((subscription) => {
          // Now create and publish the build
          return this.userBuildService.buildAndPublishTemplate(
            this.currentUserTemplateId()!,
            subscription.id
          );
        })
      )
      .subscribe({
        next: (build) => {
          console.log('Build completed successfully:', build);

          // Update step to 4 (final step)
          this.currentStep.set(4);

          // Show success message with the URL if available
          if (build.address?.address) {
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

  // Add this property at the beginning of the class, after the state signals

  // Local reference to business types for display names
  private businessTypes = BUSINESS_TYPES;

  /**
   * Ensures all required customization structure objects exist
   * Creates any missing paths in the customization object
   */
  private ensureCompleteCustomizationStructure(): void {
    this.customizations.update((current) => {
      const updated = structuredClone(current || {});

      // Ensure pages structure exists
      if (!updated.pages) {
        updated.pages = {};
      }

      // Ensure home page structure exists
      if (!updated.pages.home) {
        updated.pages.home = {};
      }

      // Ensure key sections exist
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
        };
      }

      if (!updated.pages.home.about) {
        updated.pages.home.about = {
          title: 'About Us',
          subtitle: 'Our Story',
          storyTitle: 'Our Story',
          storyText:
            'We are dedicated to providing exceptional service and quality.',
          missionTitle: 'Our Mission',
          missionText:
            'Our mission is to provide high-quality services that exceed expectations.',
          imageUrl: 'assets/standard-hero1/background-image1.jpg',
          backgroundColor: '#ffffff',
          textColor: '#333333',
        };
      }

      // Ensure other required structures
      if (!updated.header) {
        updated.header = {
          backgroundColor: '#161b33',
          textColor: '#f5f5f5',
          logoUrl: '',
          menuItems: [
            { id: 1, label: 'Home', link: '/' },
            { id: 2, label: 'About', link: '/about' },
            { id: 3, label: 'Contact', link: '/contact' },
          ],
        };
      }

      if (!updated.footer) {
        updated.footer = {
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
        };
      }

      return updated;
    });
  }

  /**
   * Handle component selection from the structure components
   */
  handleComponentSelection(component: {
    key: string;
    name: string;
    path?: string;
  }): void {
    console.log('Component selected for editing:', component);
    this.selectedComponent.set(component);
  }

  /**
   * Handle component updates from the customizer
   */
  handleComponentUpdate(update: {
    key: string;
    data: any;
    path?: string;
  }): void {
    console.log('Updating component with new data:', update);

    this.customizations.update((current) => {
      if (!current) return current;

      const updated = structuredClone(current);

      // If there's a path, update the nested structure
      if (update.path) {
        const pathParts = update.path.split('.');
        let target = updated as any;

        // Navigate to the parent object
        for (let i = 0; i < pathParts.length - 1; i++) {
          if (!target[pathParts[i]]) {
            target[pathParts[i]] = {};
          }
          target = target[pathParts[i]];
        }

        // Update the final property
        const lastPart = pathParts[pathParts.length - 1];
        target[lastPart] = update.data;
      } else {
        // Otherwise update the top-level property using a type assertion
        // Since we're using string keys, we need to assert the type
        (updated as any)[update.key] = update.data;
      }

      // Update the current editing state
      this.currentEditingState.set(structuredClone(updated));

      return updated;
    });
  }

  /**
   * Apply a theme/font update
   */
  loadTheme(theme: any): void {
    console.log('Loading theme:', theme);

    // Store the base template ID
    if (theme.id) {
      this.selectedBaseTemplateId.set(theme.id);
      this.loadBaseTemplate(theme.id);
    }
  }

  /**
   * Handle font selection
   */
  handleFontUpdate(font: FontOption): void {
    console.log('Updating font to:', font);

    this.selectedFont.set(font);

    // Update the customizations with the new font
    this.customizations.update((current) => {
      if (!current) return current;

      const updated = structuredClone(current);
      if (!updated.fontConfig) {
        updated.fontConfig = {
          fontId: font.id,
          family: font.family,
          fallback: font.fallback || 'sans-serif',
        };
      } else {
        updated.fontConfig.fontId = font.id;
        updated.fontConfig.family = font.family;
        updated.fontConfig.fallback = font.fallback || 'sans-serif';
      }

      return updated;
    });
  }

  // Consolidated template state
  templateState = signal<TemplateState>({
    id: null,
    name: 'Untitled Template',
    baseId: null,
    businessType: '',
    businessTypeName: '',
    plan: 'standard',
  });

  // Effect to keep consolidated state in sync with individual signals
  private setupTemplateStateSync = effect(
    () => {
      this.templateState.set({
        id: this.currentUserTemplateId(),
        name: this.currentTemplateName() || 'Untitled Template',
        baseId: this.selectedBaseTemplateId(),
        businessType: this.businessType(),
        businessTypeName: this.businessTypeDisplayName(),
        plan: this.currentPlan(),
      });
    },
    { allowSignalWrites: true }
  );
}

// Define a structured interface for template state management
interface TemplateState {
  id: string | null;
  name: string;
  baseId: string | null;
  businessType: string;
  businessTypeName: string;
  plan: 'standard' | 'premium';
}
