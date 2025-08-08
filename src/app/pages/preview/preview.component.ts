import {
  Component,
  inject,
  signal,
  computed,
  effect,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// Services
import { ThemeColorsService } from '../../core/services/theme/theme-colors.service';
import { ScrollService } from '../../core/services/shared/scroll/scroll.service';
import { ConfirmationService } from '../../core/services/shared/confirmation/confirmation.service';
import { UserTemplateService } from '../../core/services/template/user-template.service';
import { AuthService } from '../../core/services/auth/auth.service';
import {
  ViewManagementService,
  ANIMATION_DURATIONS,
} from '../../core/services/ui/view-management.service';
import { TemplateInitializationService } from '../../core/services/template/template-initialization.service';
import { ImageService } from '../../core/services/shared/image/image.service';

// Components
import { ThemeSwitcherComponent } from './components/theme-switcher/theme-switcher.component';
import {
  FontOption,
  FontSelectorComponent,
} from './components/font-selector/font-selector.component';
import { ComponentCustomizerComponent } from './components/component-customizer/component-customizer.component';
import { StandardStructureComponent } from './standard-structure/standard-structure.component';
import { PlanBadgeComponent } from '../../shared/components/plan-badge/plan-badge.component';
import { BuildStepsComponent } from '../../shared/components/build-steps/build-steps.component';
import { FloatingCheckoutButtonComponent } from '../../shared/components/floating-checkout-button/floating-checkout-button.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BusinessTypeSelectorComponent } from './components/business-type-selector/business-type-selector.component';
import { TemplateNameInputComponent } from './components/template-name-input/template-name-input.component';
import { WebcraftLoadingComponent } from '../../shared/components/webcraft-loading/webcraft-loading.component';

// Models
import { Customizations } from '../../core/models/website-customizations';
import { BUSINESS_TYPES } from '../../core/models/business-types';
import {
  InitialTemplateData,
  TemplateState,
} from '../../core/models/initial-template-data.model';

// Types
import type { UserTemplate } from '../../core/services/template/user-template.service';
import type { Template } from '../../core/services/template/template.service';

/**
 * PreviewComponent - Clean, maintainable website builder interface
 *
 * SIMPLIFIED FLOW:
 * 1. User selects business type
 * 2. Preview page loads
 * 3. User clicks "Start Crafting"
 * 4. Template naming modal appears
 * 5. Template is created
 * 6. Fullscreen editing mode opens
 *
 * This refactored version separates concerns clearly and follows a linear flow.
 */
@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    ThemeSwitcherComponent,
    FontSelectorComponent,
    ComponentCustomizerComponent,
    StandardStructureComponent,
    CommonModule,
    PlanBadgeComponent,
    BuildStepsComponent,
    FloatingCheckoutButtonComponent,
    IconComponent,
    BusinessTypeSelectorComponent,
    TemplateNameInputComponent,
    WebcraftLoadingComponent,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('builderAnchor', { read: ElementRef }) builderAnchor!: ElementRef;

  // ======== CORE SERVICES ========
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);
  private userTemplateService = inject(UserTemplateService);
  private templateInitializationService = inject(TemplateInitializationService);
  private themeColorsService = inject(ThemeColorsService);
  private confirmationService = inject(ConfirmationService);
  public viewManagementService = inject(ViewManagementService);
  public isViewOnlyStateService = inject(ScrollService);
  private modalStateService = inject(ScrollService);
  private imageService = inject(ImageService);

  // ======== TEMPLATE STATE ========
  templateState = signal<TemplateState>({
    id: null,
    name: 'Untitled Template',
    baseId: null,
    businessType: '',
    businessTypeName: '',
    plan: 'standard',
  });

  // ======== UI STATE ========
  /** Current step in the building process */
  currentStep = signal<number>(1);

  /** Whether to show business type selector */
  showBusinessTypeSelector = signal<boolean>(false);

  /** Whether to show template naming modal */
  showTemplateNameInput = signal<boolean>(false);

  /** Whether user has started building */
  hasStartedBuilding = signal<boolean>(false);

  /** Loading overlay state */
  showLoadingOverlay = signal<boolean>(false);
  loadingOverlayClass = signal<string>('');

  // ======== TEMPLATE DATA ========
  /** Current template ID (null for new templates) */
  currentUserTemplateId = signal<string | null>(null);

  /** Current template name */
  currentTemplateName = signal<string | null>(null);

  /** Whether the current template is published */
  isTemplatePublished = signal<boolean>(false);

  /** Business type key */
  businessType = signal<string>('');

  /** Business type display name */
  businessTypeDisplayName = signal<string>('');

  /** Current plan */
  currentPlan = signal<'standard' | 'premium'>('standard');

  /** Current page for premium multi-page */
  currentPage = signal<string>('home');

  /** Template customizations */
  customizations = signal<Customizations | null>(null);

  /** Selected font */
  selectedFont = signal<FontOption | null>(null);

  /** Available themes */
  availableThemes = signal<any[]>([]);

  /** Selected base template ID */
  selectedBaseTemplateId = signal<string | null>(null);

  /** Component currently being edited */
  selectedComponent = signal<{
    key: string;
    name: string;
    path?: string;
  } | null>(null);

  // ======== COMPUTED PROPERTIES ========
  /** Whether user is authenticated */
  isAuthenticated = computed(() => this.authService.isAuthenticated());

  /** Whether user has saved changes */
  hasSavedChanges = computed(() => !!this.currentUserTemplateId());

  /** Whether publish button should be shown (only for unpublished templates) */
  shouldShowPublishButton = computed(
    () => !!this.currentUserTemplateId() && !this.isTemplatePublished()
  );

  /** Whether this is first-time creation (template created but never saved) */
  isFirstTimeCreation = signal<boolean>(false);

  /** Whether we're in the initial template creation flow (before template is created) */
  isInTemplateCreationFlow = signal<boolean>(false);

  /** Whether editing is allowed */
  isEditingAllowed = computed(() =>
    this.viewManagementService.isEditingAllowed()
  );

  /** Default theme ID based on plan */
  defaultThemeId = computed(() =>
    this.currentPlan() === 'standard' ? '1' : '4'
  );

  /** Selected component customization data */
  selectedCustomization = computed(() => {
    const selected = this.selectedComponent();
    const customizations = this.customizations();

    if (!selected || !customizations) return null;

    try {
      if (selected.path) {
        // Handle path-based selection (e.g., "pages.home.hero1")
        const pathParts = selected.path.split('.');
        let current: any = customizations;

        for (const part of pathParts) {
          if (!current[part]) {
            return { ...selected, data: {} };
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

  // ======== COMPONENT LIFECYCLE ========
  constructor() {
    // Effect to handle modal state
    this.modalStateService.setModalOpen(false);

    // Effect to update theme colors when plan changes
    this.themeColorsService.setPlan(this.currentPlan());

    // Watch for fullscreen state changes to reset preview position when exiting
    let previousFullscreenState: boolean | null = null;
    let isInitialized = false;

    effect(() => {
      const currentFullscreenState = this.viewManagementService.isFullscreen();

      // Skip the first run to avoid interference during initialization
      if (!isInitialized) {
        previousFullscreenState = currentFullscreenState;
        isInitialized = true;
        return;
      }

      // Only reset preview position if we're actually exiting fullscreen
      // and we're not in the middle of showing a modal
      if (
        previousFullscreenState === true &&
        currentFullscreenState === false &&
        !this.showTemplateNameInput() &&
        !this.showBusinessTypeSelector()
      ) {
        setTimeout(() => {
          this.resetPreviewContentPosition();
        }, 100); // Small delay to ensure DOM has updated
      }

      previousFullscreenState = currentFullscreenState;
    });
  }

  ngOnInit(): void {
    this.initializeFromRoute();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.viewManagementService.registerBuilderAnchor(this.builderAnchor);
  }

  // ======== INITIALIZATION ========
  /**
   * Initialize component from route parameters
   * This is the main initialization method that determines the flow
   */
  private initializeFromRoute(): void {
    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('active');

    this.templateInitializationService
      .initializeFromRouteParameters()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialData: InitialTemplateData) => {
          this.applyInitialData(initialData);
          this.determineInitialFlow(initialData);
        },
        error: (err) => {
          console.error('Initialization error:', err);
          this.handleInitializationError(err);
        },
      });
  }

  /**
   * Apply initial data to component signals
   */
  private applyInitialData(initialData: InitialTemplateData): void {
    // Clean malformed objectIds from customizations data (fix for legacy data)
    let cleanedCustomizations = initialData.customizations;
    if (cleanedCustomizations) {
      cleanedCustomizations = this.imageService.cleanMalformedObjectIds(
        cleanedCustomizations
      );
    }

    // Set all signals from initial data
    this.currentUserTemplateId.set(initialData.currentUserTemplateId);
    this.currentTemplateName.set(initialData.currentTemplateName);
    this.isTemplatePublished.set(initialData.isPublished || false);
    this.businessType.set(initialData.businessType);
    this.businessTypeDisplayName.set(initialData.businessTypeName);
    this.currentPlan.set(initialData.plan);
    this.currentPage.set('home');
    this.currentStep.set(initialData.currentStep);
    this.customizations.set(cleanedCustomizations); // Use cleaned customizations

    // Set theme-related data
    this.availableThemes.set(initialData.availableThemes || []);
    this.selectedBaseTemplateId.set(initialData.selectedBaseTemplateId);
    if (initialData.selectedFont) {
      // Ensure fallback is always a string
      const font = {
        ...initialData.selectedFont,
        fallback: initialData.selectedFont.fallback || 'sans-serif',
      };
      this.selectedFont.set(font);
    }

    // Update theme colors service
    this.themeColorsService.setPlan(initialData.plan);

    // Update consolidated state
    this.templateState.set({
      id: initialData.currentUserTemplateId,
      name: initialData.currentTemplateName || 'Untitled Template',
      baseId: initialData.selectedBaseTemplateId,
      businessType: initialData.businessType,
      businessTypeName: initialData.businessTypeName,
      plan: initialData.plan,
    });
  }

  /**
   * Determine the initial flow based on the data
   * This is simplified to avoid complex conditions
   */
  private determineInitialFlow(initialData: InitialTemplateData): void {
    // Check if we need to show business type selector
    if (!initialData.businessType) {
      this.showBusinessTypeSelector.set(true);
      this.hideLoading();
      return;
    }

    // If business type is selected but no template ID, ensure step is at least 2
    if (initialData.businessType && !initialData.currentUserTemplateId) {
      this.currentStep.set(Math.max(2, initialData.currentStep));
    }

    // Check if this is an existing template in edit mode
    if (
      initialData.currentUserTemplateId &&
      initialData.initialMode === 'edit'
    ) {
      this.enterEditMode();
      return;
    }

    // Check if this is view-only mode
    if (
      initialData.currentUserTemplateId &&
      initialData.initialMode === 'view'
    ) {
      this.enterViewMode();
      return;
    }

    // Default: Show preview page (new template flow)
    this.hideLoading();
  }

  /**
   * Handle initialization errors
   */
  private handleInitializationError(error: any): void {
    if (error.authRedirect) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    let message = 'Failed to initialize website builder.';
    if (error.status === 404) {
      message = 'Template not found. Please check the URL.';
    } else if (error.status === 401 || error.status === 403) {
      message = 'You are not authorized to access this template.';
    }

    this.confirmationService.showConfirmation(message, 'error', 5000);
    this.hideLoading();
  }

  // ======== BUSINESS TYPE SELECTION ========
  /**
   * Handle business type selection
   */
  handleBusinessTypeSelection(type: string): void {
    console.log('Business type selected:', type);

    this.businessType.set(type);
    this.businessTypeDisplayName.set(this.getBusinessTypeDisplayName(type));
    this.showBusinessTypeSelector.set(false);

    // Initialize customizations for this business type
    this.initializeCustomizations(type);

    // Load themes for this business type
    this.loadThemes(type);

    // Update URL - make sure to clear any existing templateId
    this.updateUrlParams({
      businessType: type,
      step: '2',
      templateId: null, // Clear any existing template ID
      mode: null, // Clear any existing mode
      newTemplate: null, // Clear any existing newTemplate flag
    });

    this.currentStep.set(2);
  }

  /**
   * Get business type display name
   */
  private getBusinessTypeDisplayName(businessTypeKey: string): string {
    return this.templateInitializationService.getBusinessTypeDisplayName(
      businessTypeKey
    );
  }

  /**
   * Get business type icon filename (lowercase for asset path)
   */
  getBusinessTypeIcon(businessTypeKey: string): string {
    // Convert uppercase backend key to lowercase for asset filename
    return businessTypeKey.toLowerCase();
  }

  // ======== TEMPLATE NAMING FLOW ========
  /**
   * Start building - show template naming modal
   */
  startBuilding(): void {
    console.log('Starting building process');

    // Check authentication
    if (!this.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    // Check business type
    if (!this.businessType()) {
      this.confirmationService.showConfirmation(
        'Please select a business type before starting',
        'warning',
        3000
      );
      return;
    }

    // Force template creation flow - always show naming modal for new templates
    // This ensures the modal shows even if there's some stale template ID
    const hasActualSavedTemplate =
      this.currentUserTemplateId() && !this.isInTemplateCreationFlow();

    if (!hasActualSavedTemplate) {
      console.log('Showing template naming modal for new template');
      this.isInTemplateCreationFlow.set(true);
      this.showTemplateNameInput.set(true);
      this.hasStartedBuilding.set(true);
      this.currentStep.set(3);

      // Clear URL params for new template creation
      this.updateUrlParams({
        templateId: null,
        mode: null,
      });
      return;
    }

    // For existing templates, enter edit mode directly
    console.log('Entering edit mode for existing template');
    this.enterEditMode();
  }

  /**
   * Handle template name confirmation
   */
  handleTemplateNameConfirmed(templateName: string): void {
    console.log('Template name confirmed:', templateName);

    this.showTemplateNameInput.set(false);
    this.currentTemplateName.set(templateName);
    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('active');

    // Create template
    this.createTemplate(templateName);
  }

  /**
   * Handle template name cancellation
   */
  handleTemplateNameCanceled(): void {
    console.log('Template name input canceled');

    this.showTemplateNameInput.set(false);
    this.hasStartedBuilding.set(false);
    this.currentStep.set(2);

    // Clear the template creation flow flag
    this.isInTemplateCreationFlow.set(false);
  }

  // ======== TEMPLATE CREATION ========
  /**
   * Create a new template
   */
  private createTemplate(templateName: string): void {
    const customizations = this.customizations();
    const baseTemplateId =
      this.selectedBaseTemplateId() || this.availableThemes()[0]?.id;

    // DEBUGGING: Log the values to identify the issue
    console.log('[CREATE TEMPLATE DEBUG] Template creation data:', {
      templateName,
      customizations: !!customizations,
      customizationsKeys: customizations ? Object.keys(customizations) : null,
      selectedBaseTemplateId: this.selectedBaseTemplateId(),
      availableThemes: this.availableThemes(),
      availableThemesCount: this.availableThemes().length,
      firstThemeId: this.availableThemes()[0]?.id,
      finalBaseTemplateId: baseTemplateId,
      businessType: this.businessType(),
      currentPlan: this.currentPlan(),
      isAuthenticated: this.isAuthenticated(),
    });

    if (!customizations || !baseTemplateId) {
      console.error('[CREATE TEMPLATE DEBUG] Creation failed - missing data:', {
        hasCustomizations: !!customizations,
        hasBaseTemplateId: !!baseTemplateId,
        selectedBaseTemplateId: this.selectedBaseTemplateId(),
        availableThemesLength: this.availableThemes().length,
      });

      this.confirmationService.showConfirmation(
        this.availableThemes().length === 0
          ? 'No base templates available. Please select a business type again or try later.'
          : 'Unable to create template. Please try again.',
        'error',
        3000
      );
      // CRITICAL FIX: Immediately clear loading overlay on error too
      this.showLoadingOverlay.set(false);
      this.loadingOverlayClass.set('');
      return;
    }

    this.userTemplateService
      .createUserTemplate(
        baseTemplateId,
        templateName,
        structuredClone(customizations)
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (createdTemplate) => {
          this.currentUserTemplateId.set(createdTemplate.id);
          this.currentTemplateName.set(createdTemplate.name);

          // New templates are always unpublished (draft status)
          this.isTemplatePublished.set(false);

          // Mark as first-time creation (can still change themes)
          this.isFirstTimeCreation.set(true);

          // Clear the template creation flow flag
          this.isInTemplateCreationFlow.set(false);

          this.confirmationService.showConfirmation(
            `Template "${templateName}" created successfully!`,
            'success',
            2000
          );

          // Update URL
          this.updateUrlParams({
            templateId: createdTemplate.id,
            mode: 'edit',
            newTemplate: null,
          });

          // Enter edit mode after creation
          setTimeout(() => {
            this.enterEditMode();
          }, 500);
        },
        error: (error) => {
          console.error('Error creating template:', error);
          this.confirmationService.showConfirmation(
            'Failed to create template: ' +
              (error.error?.message || 'Unknown error'),
            'error',
            5000
          );
          this.showTemplateNameInput.set(true);
          // CRITICAL FIX: Immediately clear loading overlay on error too
          this.showLoadingOverlay.set(false);
          this.loadingOverlayClass.set('');

          // Keep the creation flow flag so user can try again
          // this.isInTemplateCreationFlow.set(false);
        },
      });
  }

  // ======== VIEW MODE MANAGEMENT ========
  /**
   * Enter fullscreen edit mode
   */
  private enterEditMode(): void {
    console.log('Entering edit mode');

    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('active');
    this.isViewOnlyStateService.setIsOnlyViewMode(false);

    this.updateUrlParams({
      mode: 'edit',
      viewOnly: 'false',
    });

    if (!this.viewManagementService.isFullscreen()) {
      this.viewManagementService.setFullscreen(true);
    }

    setTimeout(() => {
      this.hideLoading();
    }, ANIMATION_DURATIONS.FULLSCREEN_TRANSITION);
  }

  /**
   * Enter fullscreen view mode
   */
  private enterViewMode(): void {
    console.log('Entering view mode');

    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('active');
    this.isViewOnlyStateService.setIsOnlyViewMode(true);

    this.updateUrlParams({
      mode: 'view',
      viewOnly: 'true',
    });

    if (!this.viewManagementService.isFullscreen()) {
      this.viewManagementService.setFullscreen(true);
    }

    setTimeout(() => {
      this.hideLoading();
    }, ANIMATION_DURATIONS.FULLSCREEN_TRANSITION);
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen(): void {
    const isCurrentlyFullscreen = this.viewManagementService.isFullscreen();

    if (isCurrentlyFullscreen) {
      // Capture current scroll position before exiting fullscreen
      this.viewManagementService.setDesiredRestoreScrollPosition(
        window.scrollY
      );

      // Close sidebar when exiting fullscreen
      this.selectedComponent.set(null);

      // Reset the preview content scroll position so buttons are visible
      this.resetPreviewContentPosition();

      this.viewManagementService.setFullscreen(false);
    } else {
      // Store current scroll position when entering fullscreen
      this.viewManagementService.setDesiredRestoreScrollPosition(
        window.scrollY
      );
      this.viewManagementService.setFullscreen(true);
    }
  }

  /**
   * Exit view-only mode
   */
  exitViewOnly(): void {
    this.isViewOnlyStateService.setIsOnlyViewMode(false);
    this.updateUrlParams({ viewOnly: 'false', mode: 'edit' });
  }

  /**
   * Public method for template - enter edit mode
   */
  editBuilding(): void {
    this.enterEditMode();
  }

  /**
   * Public method for template - enter view mode
   */
  openViewOnly(): void {
    this.enterViewMode();
  }

  // ======== CUSTOMIZATION MANAGEMENT ========
  /**
   * Initialize customizations for business type
   */
  private initializeCustomizations(businessType: string): void {
    const { customizations, font } =
      this.templateInitializationService.getDefaultsForTypeAndPlan(
        businessType,
        this.currentPlan()
      );

    this.customizations.set(customizations);
    if (font) {
      this.selectedFont.set(font as FontOption);
    }
  }

  /**
   * Load themes for business type
   */
  private loadThemes(businessType: string): void {
    console.log(
      '[PREVIEW DEBUG] Loading themes for:',
      businessType,
      'plan:',
      this.currentPlan()
    );

    this.templateInitializationService
      .getThemesForTypeAndPlan(businessType, this.currentPlan())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (themes) => {
          console.log(
            '[PREVIEW DEBUG] Themes received:',
            themes.length,
            themes
          );
          this.availableThemes.set(themes);
          if (themes.length > 0) {
            this.selectedBaseTemplateId.set(themes[0].id);
            console.log(
              '[PREVIEW DEBUG] Selected base template ID:',
              themes[0].id
            );
          } else {
            console.warn(
              '[PREVIEW DEBUG] No themes received from backend. Clearing selection.'
            );
            this.availableThemes.set([] as any[]);
            this.selectedBaseTemplateId.set(null);
          }
        },
        error: (error) => {
          console.error('[PREVIEW DEBUG] Error loading themes:', error);
          console.log(
            '[PREVIEW DEBUG] Theme loading failed. Clearing selection.'
          );
          this.availableThemes.set([] as any[]);
          this.selectedBaseTemplateId.set(null);
        },
      });
  }

  /**
   * Handle component selection for editing
   */
  handleComponentSelection(component: {
    key: string;
    name: string;
    path?: string;
  }): void {
    if (!this.isEditingAllowed()) {
      this.confirmationService.showConfirmation(
        'Editing is not available in mobile preview mode.',
        'info',
        3000
      );
      return;
    }

    const currentComponent = this.selectedComponent();
    if (currentComponent && currentComponent.key === component.key) {
      this.selectedComponent.set(null);
    } else {
      this.selectedComponent.set(component);
    }
  }

  /**
   * Handle component updates
   */
  handleComponentUpdate(update: any): void {
    const selected = this.selectedComponent();
    if (!selected) return;

    this.customizations.update((current) => {
      if (!current) return current;

      const updated = structuredClone(current);

      if (selected.path) {
        // Handle path-based updates
        const pathParts = selected.path.split('.');
        let target: any = updated;

        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          if (!target[part]) target[part] = {};
          target = target[part];
        }

        const lastPart = pathParts[pathParts.length - 1];
        if (!target[lastPart]) target[lastPart] = {};

        // For menu data, directly replace the entire object to preserve structure
        if (selected.path === 'pages.home.menu' || selected.key === 'menu') {
          // Ensure the menu object structure is preserved
          const existingMenu = target[lastPart] || {};
          target[lastPart] = { ...existingMenu, ...update };
        } else {
          target[lastPart] = { ...target[lastPart], ...update };
        }
      } else {
        // Handle direct key updates
        const key = selected.key;
        if (key === 'header') {
          // Special handling for header updates
          const existingHeader = (updated as any)[key] || {};
          (updated as any)[key] = { ...existingHeader, ...update };
        } else if (key === 'menu') {
          // Special handling for menu updates
          const existingMenu = (updated as any)[key] || {};
          (updated as any)[key] = { ...existingMenu, ...update };
        } else {
          // For other components, use the original logic
          const existingData = (updated as any)[key] || {};
          const mergedData = { ...existingData, ...update };
          (updated as any)[key] = mergedData;
        }
      }

      return updated;
    });
  }

  // ======== TEMPLATE OPERATIONS ========
  /**
   * Save template changes
   */
  saveAllChanges(): void {
    const customizations = this.customizations();
    const templateId = this.currentUserTemplateId();
    const templateName = this.currentTemplateName();

    if (!customizations || !templateId || !templateName) {
      this.confirmationService.showConfirmation(
        'Unable to save: Missing template data',
        'error',
        3000
      );
      return;
    }

    // Create a deep clone for saving
    const customizationsToSave = structuredClone(customizations);

    this.userTemplateService
      .updateUserTemplate(templateId, templateName, customizationsToSave)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Clear first-time creation flag after first save
          this.isFirstTimeCreation.set(false);

          this.confirmationService.showConfirmation(
            'Changes saved successfully!',
            'success',
            3000
          );

          // CRITICAL FIX: Immediately clear loading overlay to show correct buttons
          // The button condition is `hasStartedBuilding() && !showLoadingOverlay()`
          // hideLoading() uses fadeOut animation, keeping showLoadingOverlay=true during fade
          // This caused "Start Crafting" to show instead of "Continue Editing"/"View Mode"
          this.showLoadingOverlay.set(false);
          this.loadingOverlayClass.set('');

          // Exit fullscreen after saving (with delay to ensure state is preserved)
          setTimeout(() => {
            if (this.viewManagementService.isFullscreen()) {
              this.toggleFullscreen();
            }
          }, 100); // Small delay to ensure template state is stable
        },
        error: (error) => {
          console.error('Error saving template:', error);
          this.confirmationService.showConfirmation(
            'Failed to save: ' + (error.error?.message || 'Unknown error'),
            'error',
            5000
          );
          // CRITICAL FIX: Immediately clear loading overlay on error too
          this.showLoadingOverlay.set(false);
          this.loadingOverlayClass.set('');
        },
      });
  }

  /**
   * Reset customizations
   */
  resetCustomizations(): void {
    if (!confirm('Are you sure you want to reset all changes?')) {
      return;
    }

    const businessType = this.businessType();
    if (businessType) {
      // Show loading during reset
      this.showLoadingOverlay.set(true);
      this.loadingOverlayClass.set('active');

      // Reset to default customizations
      this.initializeCustomizations(businessType);

      // Reset selected base template to first available
      const availableThemes = this.availableThemes();
      if (availableThemes.length > 0) {
        this.selectedBaseTemplateId.set(availableThemes[0].id);
      }

      // Keep first-time creation flag if this is a new template
      if (!this.currentUserTemplateId()) {
        this.isFirstTimeCreation.set(true);
      } else {
        this.isFirstTimeCreation.set(false);
      }

      // Hide loading
      setTimeout(() => {
        this.hideLoading();
        this.confirmationService.showConfirmation(
          'Template reset to default settings',
          'success',
          2000
        );
      }, 500);
    }
  }

  // ======== THEME AND FONT MANAGEMENT ========
  /**
   * Load theme and apply its configuration
   */
  loadTheme(theme: any): void {
    const themeId = typeof theme === 'object' ? theme.id : theme;

    if (!themeId) {
      console.warn('No valid theme ID provided');
      return;
    }

    // Prevent loading the same theme twice
    if (this.selectedBaseTemplateId() === themeId) {
      console.log(`Theme ${themeId} is already selected`);
      return;
    }

    console.log(`Loading theme with ID: ${themeId}`);
    this.selectedBaseTemplateId.set(themeId);

    // Only load and apply theme configuration during first-time creation
    // or when user has no template ID (new template flow)
    if (!this.currentUserTemplateId() || this.isFirstTimeCreation()) {
      this.loadAndApplyThemeConfig(themeId);
    }
  }

  /**
   * Load and apply theme configuration from API
   */
  private loadAndApplyThemeConfig(themeId: string): void {
    console.log(`Fetching and applying theme config for ID: ${themeId}`);

    // Show loading state
    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('active');

    this.templateInitializationService
      .fetchBaseTemplateConfig(themeId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config) => {
          console.log('Theme config loaded:', config);

          // Apply customizations if available
          if (config.customizations) {
            this.customizations.set(config.customizations);
            console.log('Applied theme customizations');
          }

          // Apply font if available
          if (config.font) {
            this.selectedFont.set(config.font as FontOption);
            console.log('Applied theme font:', config.font);
          }

          // Hide loading state
          this.hideLoading();

          // Show success message
          this.confirmationService.showConfirmation(
            'Theme applied successfully!',
            'success',
            2000
          );
        },
        error: (error) => {
          console.error('Error loading theme config:', error);

          // Hide loading state
          this.hideLoading();

          // Show error message
          this.confirmationService.showConfirmation(
            'Failed to load theme configuration. Please try again.',
            'error',
            3000
          );
        },
      });
  }

  /**
   * Handle font updates
   */
  handleFontUpdate(font: FontOption): void {
    this.selectedFont.set(font);

    this.customizations.update((current) => {
      if (!current) return current;

      const updated = structuredClone(current);
      updated.fontConfig = {
        fontId: font.id,
        family: font.family,
        fallback: font.fallback || 'sans-serif',
      };

      return updated;
    });
  }

  // ======== VIEW MODE ACCESSORS ========
  isFullscreen(): boolean {
    return this.viewManagementService.isFullscreen();
  }

  viewMode(): 'view-desktop' | 'view-mobile' {
    return this.viewManagementService.viewMode();
  }

  isMobileView(): boolean {
    return this.viewManagementService.isMobileView();
  }

  toggleView(mode: 'view-desktop' | 'view-mobile'): void {
    if (mode === 'view-mobile' && this.selectedComponent()) {
      this.selectedComponent.set(null);
    }
    this.viewManagementService.setViewMode(mode);
  }

  // ======== UTILITY METHODS ========
  /**
   * Reset preview content scroll position to top
   * This ensures the overlay buttons are visible when exiting fullscreen
   */
  private resetPreviewContentPosition(): void {
    if (this.builderAnchor?.nativeElement) {
      // Scroll the preview wrapper content to top
      this.builderAnchor.nativeElement.scrollTop = 0;

      // Also scroll any child elements that might have scroll position
      const scrollableElements =
        this.builderAnchor.nativeElement.querySelectorAll(
          '[style*="overflow"], .scrollable, .preview-content'
        );

      scrollableElements.forEach((element: Element) => {
        if (element instanceof HTMLElement) {
          element.scrollTop = 0;
        }
      });

      console.log('Reset preview content scroll position to top');
    }
  }

  /**
   * Update URL parameters
   */
  private updateUrlParams(params: { [key: string]: string | null }): void {
    const urlTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
    this.location.replaceState(urlTree.toString());
  }

  /**
   * Hide loading overlay
   */
  private hideLoading(): void {
    this.loadingOverlayClass.set('fadeOut');
  }

  /**
   * Handle loading overlay finished
   */
  onLoadingOverlayFinished(): void {
    if (this.loadingOverlayClass() === 'fadeOut') {
      this.showLoadingOverlay.set(false);
      this.loadingOverlayClass.set('');
    }
  }

  /**
   * Select plan
   */
  selectPlan(plan: 'standard' | 'premium'): void {
    this.currentPlan.set(plan);
    this.themeColorsService.setPlan(plan);
    this.updateUrlParams({ plan });
  }

  /**
   * Upgrade to premium
   */
  upgradeNow(): void {
    this.selectPlan('premium');
  }

  /**
   * Update template name
   */
  updateTemplateName(newName: string): void {
    if (newName?.trim()) {
      this.currentTemplateName.set(newName.trim());
    }
  }

  /**
   * Publish template
   */
  publishTemplate(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    const templateId = this.currentUserTemplateId();
    if (!templateId) {
      this.confirmationService.showConfirmation(
        'Please save your template before publishing.',
        'info',
        3000
      );
      return;
    }

    this.router.navigate(['/subscription-selection'], {
      queryParams: {
        templateId,
        templateName: this.currentTemplateName(),
        templatePlan: this.currentPlan(),
        templateType: this.businessType(),
      },
    });
  }
}
