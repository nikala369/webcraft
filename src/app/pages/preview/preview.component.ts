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
import { CommonModule, UpperCasePipe } from '@angular/common';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject, switchMap } from 'rxjs';

// Services
import { ThemeService } from '../../core/services/theme/theme.service';
import { ThemeColorsService } from '../../core/services/theme/theme-colors.service';
import { ScrollService } from '../../core/services/shared/scroll/scroll.service';
import { ConfirmationService } from '../../core/services/shared/confirmation/confirmation.service';
import { BusinessConfigService } from '../../core/services/business-config/business-config.service';
import { UserTemplateService } from '../../core/services/template/user-template.service';
import { UserBuildService } from '../../core/services/build/user-build.service';
import { SubscriptionService } from '../../core/services/subscription/subscription.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { SelectionStateService } from '../../core/services/selection/selection-state.service';
import { TemplateService } from '../../core/services/template/template.service';

// Components
import { ThemeSwitcherComponent } from './components/theme-switcher/theme-switcher.component';
import {
  FontOption,
  FontSelectorComponent,
} from './components/font-selector/font-selector.component';
import { PreviewViewToggleComponent } from './components/preview-view-toggle/preview-view-toggle.component';
import { ComponentCustomizerComponent } from './components/component-customizer/component-customizer.component';
import { PremiumStructureComponent } from './premium-structure/premium-structure.component';
import { StandardStructureComponent } from './standard-structure/standard-structure.component';
import { PlanBadgeComponent } from '../../shared/components/plan-badge/plan-badge.component';
import { FeaturesSectionComponent } from '../../shared/components/features-section/features-section.component';
import { CheckoutPanelComponent } from '../../shared/components/checkout-panel/checkout-panel.component';
import { BuildStepsComponent } from '../../shared/components/build-steps/build-steps.component';
import { FloatingCheckoutButtonComponent } from '../../shared/components/floating-checkout-button/floating-checkout-button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BusinessTypeSelectorComponent } from './components/business-type-selector/business-type-selector.component';
import { WebcraftLoadingComponent } from '../../shared/components/webcraft-loading/webcraft-loading.component';

// Models
import {
  Customizations,
  ThemeData,
} from '../../core/models/website-customizations';
import {
  BUSINESS_TYPE_MENU_ITEMS,
  BUSINESS_TYPES,
} from '../../core/models/business-types';
// Types
import type { UserTemplate } from '../../core/services/template/user-template.service';
import type { Template } from '../../core/services/template/template.service';

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

  /**
   * Template state management using consolidated signal pattern
   * This represents the single source of truth for template state
   */
  templateState = signal<TemplateState>({
    id: null,
    name: 'Untitled Template',
    baseId: null,
    businessType: '',
    businessTypeName: '',
    plan: 'standard',
  });

  // ---- View and UI State ----
  /** Controls whether the mobile view is active */
  isMobileView = signal(window.innerWidth <= 768);

  /** Controls desktop vs mobile preview mode */
  viewMode = signal<'view-desktop' | 'view-mobile'>('view-desktop');

  /** Whether fullscreen mode is active */
  private fullscreenState = signal(false);
  isFullscreen = this.fullscreenState.asReadonly();

  /** Position to restore after exiting fullscreen */
  private preFullscreenScrollPosition = 0;

  /** Whether the business type selector should be shown */
  showBusinessTypeSelector = signal<boolean>(false);

  /** Selected component for customization in the editor */
  selectedComponent = signal<{
    key: string;
    name: string;
    path?: string;
  } | null>(null);

  // ---- Authentication and Build State ----
  /** Whether the user is authenticated */
  isAuthenticated = computed(() => this.authService.isAuthenticated());

  /** Whether the user has started building their website */
  hasStartedBuilding = signal<boolean>(false);

  /** Whether the user has saved changes */
  private hasSavedChangesFlag = signal<boolean>(false);

  /** Progress step in the website building flow */
  currentStep = signal<number>(1);

  // ---- Template Identification ----
  /** ID of the current user template (if editing existing) */
  currentUserTemplateId = signal<string | null>(null);

  /** Name of the current template */
  currentTemplateName = signal<string | null>(null);

  /** ID of the selected base template */
  selectedBaseTemplateId = signal<string | null>(null);

  /** Display name for the selected business type */
  businessTypeDisplayName = signal<string>('');

  // ---- Product Configuration ----
  /** Current plan (standard or premium) */
  currentPlan = signal<'standard' | 'premium'>('standard');

  /** Selected business type key */
  businessType = signal<string>('');

  /** Current page being edited */
  currentPage = signal<string>('home');

  /** Selected font for the template */
  selectedFont = signal<FontOption | null>(null);

  // ---- Customization State ----
  /** Latest customizations being edited */
  customizations = signal<Customizations | null>(null);

  /** Previously saved state for comparison */
  private lastSavedState = signal<Customizations | null>(null);

  /** Current editing state for tracking changes */
  private currentEditingState = signal<Customizations | null>(null);

  // ---- Loading State ----
  /** Controls the visibility of the loading overlay */
  showLoadingOverlay = signal<boolean>(false);

  /** CSS class for the loading overlay */
  loadingOverlayClass = signal<string>('');

  // ---- Themes and Settings ----
  /** Available themes for the current business type */
  availableThemes = signal<any[]>([]);

  /** Default theme ID based on plan */
  defaultThemeId = computed(() =>
    this.currentPlan() === 'standard' ? '1' : '4'
  );

  /** Flag to prevent theme service from overriding user customizations */
  private preventThemeOverride = signal<boolean>(false);

  // ---- Computed UI State ----
  /** Whether editing is allowed (disabled in mobile view) */
  isEditingAllowed = computed(() => this.viewMode() === 'view-desktop');

  /** Whether the business type can be changed */
  isBusinessTypeReadonly = computed(
    () => this.currentUserTemplateId() !== null || this.isFullscreen()
  );

  /**
   * Reference to business types for display name mapping
   */
  private businessTypes = BUSINESS_TYPES;

  // ======== COMPUTED STATE ========

  /**
   * Provides the component data for the currently selected component
   * Handles complex path traversal and special component-specific logic
   */
  selectedCustomization = computed(() => {
    const selected = this.selectedComponent();
    const customizations = this.customizations();

    if (!selected || !customizations) {
      console.log('No selection or customizations available');
      return null;
    }

    try {
      // Handle path-based selection
      if (selected.path) {
        const pathParts = selected.path.split('.');
        let current: any = customizations;

        for (const part of pathParts) {
          if (!current[part]) {
            console.warn(`Missing path segment: ${part} in ${selected.path}`);
            return null;
          }
          current = current[part];
        }
        return { ...selected, data: current };
      }

      // Handle direct key access
      return {
        ...selected,
        data: customizations[selected.key as keyof Customizations],
      };
    } catch (error) {
      console.error('Error accessing customization data:', error);
      return null;
    }
  });

  // ======== LIFECYCLE HOOKS ========
  /**
   * Initialize effects and state synchronization
   */
  constructor() {
    // Effect to open sidebar when component is selected
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

    // Effect to keep consolidated state in sync with individual signals
    effect(
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

  /**
   * Set up event listeners and initialize component based on route parameters
   */
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

    // Parse route parameters to determine the operation mode
    this.parseRouteParameters();
  }

  /**
   * Remove event listeners and clean up subscriptions
   */
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

  // ======== ROUTE PARAMETER HANDLING ========
  /**
   * Parse route parameters to determine operation mode and initialize component state
   */
  private parseRouteParameters(): void {
    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('active');

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        console.log(
          '[parseRouteParameters] Processing route parameters:',
          params
        );

        // --- Parameter Extraction ---
        const templateId = params['templateId'] || null;
        const isCreatingNew = params['newTemplate'] === 'true';
        const urlBusinessType = params['businessType'] || null;
        const urlPlan = (params['plan'] || 'standard') as
          | 'standard'
          | 'premium';
        const urlMode = params['mode'] || 'edit'; // Default to edit unless specified
        const urlStep = params['step'] ? parseInt(params['step'], 10) : null;

        // --- State Initialization based on Params ---
        console.log(
          `[parseRouteParameters] Mode determination: templateId=${templateId}, isCreatingNew=${isCreatingNew}, urlBusinessType=${urlBusinessType}, urlPlan=${urlPlan}`
        );

        // Always set plan first
        this.currentPlan.set(urlPlan);
        this.templateState.update((state) => ({ ...state, plan: urlPlan }));

        // **Priority 1: Editing/Viewing Existing Template**
        if (templateId) {
          console.log(
            `[parseRouteParameters] Mode: Load Existing Template (ID: ${templateId}, Mode: ${urlMode})`
          );
          if (!this.authService.isAuthenticated()) {
            this.handleAuthRedirect('edit an existing website');
            return; // Stop further processing until authenticated
          }
          // Load existing template - this function will handle setting the step and hiding loading overlay
          this.loadExistingTemplate(templateId, urlMode);

          // **Priority 2: Creating New Template (Requires Business Type)**
        } else if (isCreatingNew && urlBusinessType) {
          console.log(
            `[parseRouteParameters] Mode: Initialize New Template (Type: ${urlBusinessType}, Plan: ${urlPlan})`
          );
          if (!this.authService.isAuthenticated()) {
            this.handleAuthRedirect('create a new website');
            return; // Stop further processing until authenticated
          }
          // Initialize new template - this function handles step and loading overlay
          this.initializeNewTemplate(urlBusinessType); // Pass only business type

          // **Priority 3: Theme Selection / Initial Customization Start (Business Type known, but no template yet)**
        } else if (urlBusinessType) {
          console.log(
            `[parseRouteParameters] Mode: Business Type Selected (Type: ${urlBusinessType}, Plan: ${urlPlan}) - Ready for theme/customization`
          );
          this.businessType.set(urlBusinessType);
          this.setBusinessTypeDisplayName(urlBusinessType);
          this.templateState.update((state) => ({
            ...state,
            businessType: urlBusinessType,
            businessTypeName: this.businessTypeDisplayName(),
          }));
          this.loadThemesForBusinessType(urlBusinessType); // Preload themes
          this.hasStartedBuilding.set(true); // User has selected type/plan
          this.currentStep.set(urlStep || 3); // Default to customization step
          this.showBusinessTypeSelector.set(false); // Hide selector
          this.initializeDefaultCustomizations(); // Ensure defaults are ready
          this.showLoadingOverlay.set(false); // Ready to show theme selection/preview

          // **Fallback: Business Type Selection**
        } else {
          console.log(
            '[parseRouteParameters] Mode: Business Type Selection (No template/type specified)'
          );
          this.currentStep.set(urlStep || 2); // Default to business type selection step
          this.showBusinessTypeSelector.set(true); // Show selector
          this.initializeDefaultCustomizations(); // Ensure defaults are ready even if not shown yet
          this.showLoadingOverlay.set(false); // Hide loading, show selector
        }

        // Update URL with the determined step if it wasn't already set correctly
        // Let loading functions handle step updates for load/new flows
        if (!templateId && !isCreatingNew && urlStep !== this.currentStep()) {
          this.updateUrlParams({ step: this.currentStep().toString() });
        }
      });
  }

  // Helper for handling authentication redirect
  private handleAuthRedirect(action: string): void {
    console.warn(
      `[handleAuthRedirect] Authentication required to ${action}. Redirecting to login.`
    );
    this.showLoadingOverlay.set(false); // Hide loading before redirect
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: this.router.url },
      queryParamsHandling: 'merge',
    });
  }

  // ======== TEMPLATE MANAGEMENT ========
  /**
   * Load an existing template from the API
   * @param templateId ID of the template to load
   * @param mode View or edit mode
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
          this.currentTemplateName.set(template.template.name);

          // Update consolidated state
          this.templateState.update((state) => ({
            ...state,
            id: template.id,
            name: template.template.name,
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
              console.log('Customizations set:', this.customizations());

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
              this.updateLastSavedState();

              console.log(
                'Successfully loaded and applied template configuration'
              );

              // Set appropriate flags for editing flow
              this.hasStartedBuilding.set(true);
              this.hasSavedChangesFlag.set(true); // Indicate existing saved state
              this.currentStep.set(mode === 'view' ? 3 : 4); // SET STEP HERE (Customize or Done)
            } catch (e) {
              console.error('Error processing template config:', e);

              // Even if config parsing fails, initialize with defaults and proceed
              this.initializeDefaultCustomizations();
              this.confirmationService.showConfirmation(
                'Error processing template configuration. Using default settings.',
                'warning',
                5000
              );
              this.hasStartedBuilding.set(true); // Still allow editing with defaults
              this.currentStep.set(3); // SET STEP HERE (Default to Customize on error)
            }
          } else {
            console.warn('Template has no config:', template);
            this.initializeDefaultCustomizations();
            this.confirmationService.showConfirmation(
              'Template has no configuration data. Using default settings.',
              'warning',
              3000
            );
            this.hasStartedBuilding.set(true); // Allow editing with defaults
            this.currentStep.set(3); // SET STEP HERE (Default to Customize)
          }

          // UI transitions AFTER setting state and step
          this.showBusinessTypeSelector.set(false); // Ensure selector is hidden
          setTimeout(() => {
            if (mode === 'edit') {
              this.editBuilding(); // This handles fullscreen toggle
            } else if (mode === 'view') {
              this.openViewOnly(); // This handles fullscreen toggle
            }
            // Hide loading overlay *after* potential fullscreen transition starts
            this.showLoadingOverlay.set(false);
          }, 300); // Short delay for potential UI transition
        },
        error: (error) => {
          this.handleTemplateLoadError(error); // This handles loading overlay
          this.currentStep.set(3); // Default step on error
        },
      });
  }

  /**
   * Handle template loading errors
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
   * Initialize state for creating a new template
   */
  private initializeNewTemplate(businessType: string): void {
    console.log(
      `[initializeNewTemplate] Initializing for type: ${businessType}`
    );
    // Set business type and display name
    this.businessType.set(businessType);
    this.setBusinessTypeDisplayName(businessType);
    this.templateState.update((state) => ({
      ...state,
      businessType: businessType,
      businessTypeName: this.businessTypeDisplayName(),
      name: `${this.businessTypeDisplayName()} Website`,
    }));
    this.showBusinessTypeSelector.set(false); // Hide selector

    // Load themes for this business type (will trigger loadBaseTemplate for the first theme)
    this.loadThemesForBusinessType(businessType);

    // Initialize customizations with defaults for this type
    // Note: loadBaseTemplate might overwrite this shortly if a theme has config
    this.initializeDefaultCustomizations();

    // Set flags and step for new template flow
    this.hasStartedBuilding.set(true);
    this.hasSavedChangesFlag.set(false); // No saved changes yet
    this.currentStep.set(3); // SET STEP HERE (Start at Customize)

    // Update URL params immediately
    this.updateUrlParams({
      businessType: businessType,
      plan: this.currentPlan(),
      newTemplate: 'true', // Keep this flag
      step: '3',
      templateId: null, // Ensure no conflicting templateId
      mode: null, // Ensure no conflicting mode
    });

    // Enter fullscreen edit mode after a brief delay
    setTimeout(() => {
      this.showLoadingOverlay.set(false); // Hide loading before fullscreen
      if (!this.isFullscreen()) {
        this.toggleFullscreen();
      }
    }, 500);
  }

  /**
   * Load base template from API
   */
  loadBaseTemplate(templateId: string): void {
    console.log(
      `[loadBaseTemplate] Attempting to load base template ID: ${templateId}`
    );

    // --- Conditions to Prevent Loading ---
    // 1. If we are editing an existing user template, don't load a base template over it.
    if (this.currentUserTemplateId()) {
      console.log(
        '[loadBaseTemplate] Skipping: Already editing an existing user template.'
      );
      return;
    }
    // 2. If override prevention is active (e.g., during initial load of existing template)
    if (this.preventThemeOverride()) {
      console.log(
        '[loadBaseTemplate] Skipping: Theme override prevention is active.'
      );
      return;
    }

    // --- Fetch Base Template Config ---
    this.templateService.getTemplateById(templateId).subscribe({
      next: (template: Template) => {
        console.log(
          '[loadBaseTemplate] Base template data received:',
          template
        );

        this.selectedBaseTemplateId.set(template.id); // Track which base is selected

        // Set business type ONLY if not already set (don't override user/URL choice)
        if (!this.businessType() && template.templateType?.key) {
          console.log(
            `[loadBaseTemplate] Setting business type from template: ${template.templateType.key}`
          );
          this.businessType.set(template.templateType.key);
          this.setBusinessTypeDisplayName(template.templateType.key);
          this.templateState.update((state) => ({
            ...state,
            businessType: template.templateType.key,
            businessTypeName: this.businessTypeDisplayName(),
          }));
        }

        // --- Apply Configuration ---
        if (template.config) {
          try {
            const templateCustomizations = JSON.parse(template.config);
            console.log(
              '[loadBaseTemplate] Parsed template customizations:',
              templateCustomizations
            );

            // **Decision Point: Replace or Ignore?**
            // We replace the customizations ONLY if we are in the initial new template flow
            // (no currentUserTemplateId) and haven't saved anything yet.
            // If the user switches themes after making edits but before saving,
            // the new theme config REPLACES the old one entirely.
            if (!this.currentUserTemplateId()) {
              // Only apply if creating new
              console.log(
                '[loadBaseTemplate] Applying base template config (replacing existing).'
              );
              this.customizations.set(templateCustomizations);

              // Update font if available in the template config
              if (templateCustomizations.fontConfig) {
                const fontConfig = templateCustomizations.fontConfig;
                this.selectedFont.set({
                  id: fontConfig.fontId,
                  family: fontConfig.family,
                  fallback: fontConfig.fallback,
                });
              } else {
                // Reset font if the new template doesn't specify one
                this.selectedFont.set(null);
              }

              // Update tracking state to reflect the newly loaded base state
              this.updateLastSavedState();
            } else {
              console.log(
                '[loadBaseTemplate] Ignoring base template config (already editing/saved).'
              );
            }
          } catch (e) {
            console.error(
              '[loadBaseTemplate] Error parsing template config:',
              e
            );
            // Fallback to defaults ONLY if customizations are currently null
            if (!this.customizations()) {
              this.initializeDefaultCustomizations();
            }
          }
        } else {
          console.warn(
            '[loadBaseTemplate] Base template has no config. Initializing defaults if needed.'
          );
          // Initialize with defaults ONLY if customizations are currently null
          if (!this.customizations()) {
            this.initializeDefaultCustomizations();
          }
        }
      },
      error: (err: Error) => {
        console.error('[loadBaseTemplate] Error loading base template:', err);
        // Initialize with defaults ONLY if customizations are currently null
        if (!this.customizations()) {
          this.initializeDefaultCustomizations();
        }
      },
    });
  }

  // ======== BUSINESS TYPE MANAGEMENT ========
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

      // Update the state with the default customizations
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
      this.updateLastSavedState();
    } else {
      // If no business type, set an empty customization object
      const emptyCustomizations: Customizations = {
        fontConfig: {
          fontId: 1,
          family: 'Arial',
          fallback: 'sans-serif',
        },
        header: {
          backgroundColor: '#161b33',
          textColor: '#f5f5f5',
          menuItems: [],
        },
        pages: { home: {} },
        footer: {
          backgroundColor: '#1a1a1a',
          textColor: '#ffffff',
          copyrightText: '© 2025 Your Company',
          showSocialLinks: false,
          menuItems: [],
          socialLinks: [],
        },
      };
      this.customizations.set(emptyCustomizations);
    }
  }

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

  // ======== URL AND NAVIGATION UTILITIES ========
  /**
   * Helper method to update URL parameters without navigation
   */
  private updateUrlParams(params: { [key: string]: string | null }): void {
    const urlTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
    // replaceState updates the address bar without adding a new history entry
    this.location.replaceState(urlTree.toString());
  }

  /**
   * Check if template ID is stored in session storage
   * Used for creating vs updating templates
   */
  hasStoredTemplateId(): boolean {
    return !!sessionStorage.getItem('selectedTemplateId');
  }

  // ======== VIEW MODE MANAGEMENT ========
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
      const currentCustomizations = this.customizations();
      if (currentCustomizations) {
        this.updateLastSavedState();
      }

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

  /**
   * Called when loading overlay animation completes
   */
  onLoadingOverlayFinished(): void {
    // Remove the overlay by setting the controlling signal to false
    this.showLoadingOverlay.set(false);
  }

  // ======== TEMPLATE SAVING & EDITING ========
  /**
   * Save all customizations to the API
   */
  saveAllChanges(): void {
    const currentCustomizations = this.customizations();
    if (!currentCustomizations) {
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
    const customizationsToSave = structuredClone(currentCustomizations);

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
          this.updateLastSavedState();

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
   * Reset customizations to last-saved or defaults, clear out templateId/mode/viewOnly,
   * keep businessType & plan, and flip into "newTemplate" flow.
   */
  resetCustomizations(): void {
    if (
      !confirm(
        'Are you sure you want to reset? This will discard unsaved changes and start a new template using the current Business Type and Plan.'
      )
    ) {
      return;
    }

    console.log('[resetCustomizations] Resetting template...');
    this.showLoadingOverlay.set(true); // Show loading during reset

    // Preserve essential settings
    const currentBusinessType = this.businessType();
    const currentPlan = this.currentPlan();

    // --- Clear Template Specific State ---
    this.currentUserTemplateId.set(null);
    this.currentTemplateName.set(null);
    this.selectedBaseTemplateId.set(null); // Clear selected base theme
    this.customizations.set(null); // Clear current customizations immediately
    this.lastSavedState.set(null);
    this.currentEditingState.set(null);
    this.selectedComponent.set(null); // Close customizer if open
    this.selectedFont.set(null); // Reset font

    // --- Reset Flags ---
    this.hasStartedBuilding.set(true); // Still considered "started" as type/plan are chosen
    this.hasSavedChangesFlag.set(false); // No saved changes for the new template
    this.preventThemeOverride.set(false); // Allow base theme loading

    // --- Initialize Defaults for New Template ---
    // This will generate defaults based on currentBusinessType and currentPlan
    // It will also trigger loadThemesForBusinessType -> loadBaseTemplate for the first theme
    this.initializeDefaultCustomizations();
    if (currentBusinessType) {
      this.loadThemesForBusinessType(currentBusinessType); // Ensure themes/base template load
    }

    // --- Update URL Parameters ---
    // Transition to the 'newTemplate=true' state
    this.updateUrlParams({
      templateId: null, // Remove
      mode: null, // Remove
      viewOnly: null, // Remove
      newTemplate: 'true', // Add
      businessType: currentBusinessType, // Keep
      plan: currentPlan, // Keep
      step: '3', // Set to customization step
    });

    // --- UI State ---
    this.currentStep.set(3); // Explicitly set step
    this.showBusinessTypeSelector.set(false); // Ensure selector is hidden
    this.isViewOnlyStateService.setIsOnlyViewMode(false); // Ensure not in view only mode

    // --- Exit Fullscreen & Hide Loading ---
    if (this.isFullscreen()) {
      this.toggleFullscreen();
    }

    // Hide loading after a short delay to allow state updates
    setTimeout(() => {
      this.showLoadingOverlay.set(false);
      this.confirmationService.showConfirmation(
        'Template reset. Starting new customization.',
        'info',
        3000
      );
    }, 300);
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

  // ======== PLAN AND PUBLISHING ========
  /**
   * Select a plan (standard or premium)
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

  // ======== COMPONENT INTERACTIONS ========
  /**
   * Handle component selection from the structure components
   */
  handleComponentSelection(component: {
    key: string;
    name: string;
    path?: string;
  }): void {
    console.log('Component selected for editing:', component);
    // Check if editing is allowed (mobile view restrictions)
    if (!this.isEditingAllowed()) {
      this.confirmationService.showConfirmation(
        'Editing is not available in mobile preview mode. Please switch to desktop view to edit.',
        'info',
        3000
      );
      return;
    }

    this.selectedComponent.set(component);
  }

  /**
   * Handle component updates from the customizer
   */
  handleComponentUpdate(update: any): void {
    const selected = this.selectedComponent();
    if (!selected) return;
    console.log('Updating component:', selected, 'with data:', update);

    if (selected.path) {
      const pathParts = selected.path.split('.');
      this.customizations.update((current) => {
        if (!current) {
          console.error('Cannot update - customizations is null');
          return current;
        }
        const updated = structuredClone(current);
        let target: any = updated;
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          if (!target[part]) target[part] = {};
          target = target[part];
        }
        const lastPart = pathParts[pathParts.length - 1];
        if (!target[lastPart]) target[lastPart] = {};
        target[lastPart] = { ...target[lastPart], ...update };
        console.log('Updated customizations at path:', selected.path);
        return updated;
      });
    } else {
      this.customizations.update((current) => {
        if (!current) {
          console.error('Cannot update - customizations is null');
          return current;
        }
        const key = selected.key as keyof Customizations;
        const updated = {
          ...current,
          [key]: {
            ...(current[key] || {}),
            ...update,
          },
        };
        console.log('Updated top-level customizations for key:', key);
        return updated;
      });
    }

    // Update editing state for change tracking
    const currentCustomizations = this.customizations();
    if (currentCustomizations) {
      this.updateLastSavedState();
    }
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

  /**
   * Update last saved state for change tracking
   */
  private updateLastSavedState(): void {
    const currentCustomizations = this.customizations();
    if (currentCustomizations) {
      this.lastSavedState.set(structuredClone(currentCustomizations));
      this.currentEditingState.set(structuredClone(currentCustomizations));
    }
  }
}

/**
 * Interface for template state management
 * This provides a structure for the consolidated state signal
 */
interface TemplateState {
  /** ID of the user template (null for new templates) */
  id: string | null;

  /** Display name of the template */
  name: string;

  /** ID of the base template used (for new templates) */
  baseId: string | null;

  /** Business type key */
  businessType: string;

  /** Display name of the business type */
  businessTypeName: string;

  /** Plan level (standard or premium) */
  plan: 'standard' | 'premium';
}
