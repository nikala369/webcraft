import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  effect,
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
    ComponentCustomizerComponent,
    StandardStructureComponent,
    CommonModule,
    PlanBadgeComponent,
    BuildStepsComponent,
    FloatingCheckoutButtonComponent,
    IconComponent,
    BusinessTypeSelectorComponent,
    WebcraftLoadingComponent,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit, OnDestroy, AfterViewInit {
  // ViewChild for builderAnchor
  @ViewChild('builderAnchor', { read: ElementRef }) builderAnchor!: ElementRef;

  // ======== SERVICES INJECTION ========
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private location = inject(Location);
  private modalStateService = inject(ScrollService);
  public isViewOnlyStateService = inject(ScrollService);
  private destroy$ = new Subject<void>();
  private themeColorsService = inject(ThemeColorsService);
  private userTemplateService = inject(UserTemplateService);
  private authService = inject(AuthService);
  public viewManagementService = inject(ViewManagementService);
  private templateInitializationService = inject(TemplateInitializationService);

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

  public INITIAL_LOAD_SCROLL_TARGET_Y = 0;

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
  /**
   * Loading overlay signal for theme loading visual feedback
   */
  showLoadingOverlay = signal<boolean>(false);
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
  isEditingAllowed = computed(() =>
    this.viewManagementService.isEditingAllowed()
  );

  /** Whether the business type can be changed */
  isBusinessTypeReadonly = computed(
    () =>
      this.currentUserTemplateId() !== null ||
      this.viewManagementService.isFullscreen()
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
    // ─── 1) NEW-SITE FLOW GUARD ────────────────────────────────────
    const urlParams = this.route.snapshot.queryParams;
    const isNewFlow = urlParams['newTemplate'] === 'true';
    const hasBusinessType = !!urlParams['businessType'];

    // Check if we have a page from route data (for Premium navigation)
    const routeData = this.route.snapshot.data;
    if (routeData['page']) {
      console.log(
        '[PreviewComponent] Setting current page from route data:',
        routeData['page']
      );
      this.currentPage.set(routeData['page']);
    }

    // Subscribe to route changes for Premium page navigation
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data['page'] && data['page'] !== this.currentPage()) {
        console.log(
          '[PreviewComponent] Route data page changed to:',
          data['page']
        );
        this.currentPage.set(data['page']);
      }
    });

    // scroll from the previous page (e.g., the pricing page).
    window.scrollTo({
      top: this.INITIAL_LOAD_SCROLL_TARGET_Y,
      behavior: 'auto',
    }); // 'auto' is fine for instant scroll
    console.log(
      `[PreviewComponent] ngOnInit: Explicitly scrolled window to ${this.INITIAL_LOAD_SCROLL_TARGET_Y}px.`
    );

    // If it's a new template flow AND we already have a business type, don't show selector
    if (isNewFlow && hasBusinessType) {
      console.log(
        '[PreviewComponent] ngOnInit → new‐flow with businessType detected; proceeding with initialization'
      );
      // Proceed to normal initialization (don't return early)
    }
    // If it's just a new template flow without business type, show selector
    else if (isNewFlow && !hasBusinessType) {
      console.log(
        '[PreviewComponent] ngOnInit → new‐flow without businessType; showing selector'
      );
      this.showBusinessTypeSelector.set(true);
      this.loadingOverlayClass.set('fadeOut');
      return;
    }

    this.viewManagementService.resetStoredScrollPosition();

    // ─── 2) SHOW LOADER & INIT ─────────────────────────────────────
    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('active');

    this.templateInitializationService
      .initializeFromRouteParameters()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (initialData: InitialTemplateData) => {
          console.group('[PreviewComponent] ngOnInit Initialization Data');
          console.log('Received:', initialData);
          console.log('Plan from initialization:', initialData.plan);
          console.log(
            'Already fullscreen?',
            this.viewManagementService.isFullscreen()
          );
          console.groupEnd();

          this.applyInitialData(initialData);

          // ─── 3) SELECT FLOW ─────────────────────────────────────────
          if (initialData.initialMode === 'edit' && initialData.isCreatingNew) {
            // A) Fresh new template
            console.log(
              '[ngOnInit] Path A: New template → show selector, no fullscreen'
            );
            // Only show the business type selector if we don't already have a business type
            if (!initialData.businessType) {
              this.showBusinessTypeSelector.set(true);
            }
            this.loadingOverlayClass.set('fadeOut');
          } else if (
            initialData.initialMode === 'edit' &&
            !initialData.isCreatingNew &&
            !this.viewManagementService.isFullscreen()
          ) {
            // B) Editing an existing template
            console.log(
              '[ngOnInit] Path B: Edit existing → preparing for fullscreen'
            );
            this.viewManagementService.resetStoredScrollPosition();
            this.editBuilding();
          } else if (
            initialData.initialMode === 'view' &&
            !this.viewManagementService.isFullscreen()
          ) {
            // C) View-only preview
            console.log(
              '[ngOnInit] Path C: View-only → preparing for fullscreen'
            );
            this.viewManagementService.resetStoredScrollPosition();
            this.openViewOnly();
          } else {
            // D) Already fullscreen or unknown state
            console.log('[ngOnInit] Path D: Fallback → hiding loader');
            this.loadingOverlayClass.set('fadeOut');
          }
        },
        error: (err) => {
          console.error(
            '[PreviewComponent] ngOnInit initialization error:',
            err
          );
          if ((err as any).authRedirect) {
            return this.handleAuthRedirect((err as any).authRedirect.action);
          }

          let message = 'Failed to initialize website builder.';
          if (err.status === 404 || err.message?.includes('not found')) {
            message = `${err.message || 'Not found'}. Please check the URL.`;
          } else if (err.status === 401 || err.status === 403) {
            message = 'You are not authorized to access this template.';
          }
          this.confirmationService.showConfirmation(message, 'error', 5000);
          this.showLoadingOverlay.set(false);
        },
      });
  }

  /**
   * Remove event listeners and clean up subscriptions
   */
  ngOnDestroy(): void {
    // Event listener cleanup is now handled by ViewManagementService
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Helper for handling authentication redirect
   */
  private handleAuthRedirect(action: string): void {
    console.warn(
      `[PreviewComponent] Authentication required to ${action}. Redirecting to login.`
    );
    this.showLoadingOverlay.set(false); // Hide loading before redirect
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: this.router.url },
      queryParamsHandling: 'merge',
    });
  }

  // ======== BUSINESS TYPE MANAGEMENT ========
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
      const businessTypeName = this.getBusinessTypeDisplayName(type);
      this.businessTypeDisplayName.set(businessTypeName);

      // Clear the current available themes to force reload
      this.availableThemes.set([]);
      this.selectedBaseTemplateId.set(null);

      // Update consolidated state
      this.templateState.update((state) => ({
        ...state,
        businessType: type,
        businessTypeName,
        baseId: null,
      }));

      // Load themes for this business type
      this.loadThemesUsingService(type);

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
      if (!this.viewManagementService.isFullscreen()) {
        this.showBusinessTypeSelector.set(false);
      }
    }
  }

  /**
   * Get the business type display name from the key
   * Helper method that delegates to the TemplateInitializationService
   */
  private getBusinessTypeDisplayName(businessTypeKey: string): string {
    return this.templateInitializationService.getBusinessTypeDisplayName(
      businessTypeKey
    );
  }

  /**
   * Initialize customizations with default values for the selected business type
   */
  private initializeDefaultCustomizations(): void {
    const businessTypeKey = this.businessType();
    const plan = this.currentPlan();

    const { customizations, font } =
      this.templateInitializationService.getDefaultsForTypeAndPlan(
        businessTypeKey,
        plan
      );

    // Update the state with the default customizations
    this.customizations.set(customizations);

    // Set initial font from the default customizations
    if (font) {
      this.selectedFont.set(font as any);
    }

    // Save these as the initial state
    this.updateLastSavedState();
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

    // Show loading overlay
    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('active');

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
      this.loadThemesUsingService(currentBusinessType);

      // Update the step to Customize (3) since we have a business type
      this.currentStep.set(3);
    } else {
      // Still at business type selection (2)
      this.currentStep.set(2);
    }

    // Initialize customizations if not already done
    if (!this.customizations()) {
      this.initializeDefaultCustomizations();
    }

    // Store current state for potential restore
    const currentCustomizations = this.customizations();
    if (currentCustomizations) {
      this.updateLastSavedState();
    }

    // Update URL params to reflect that we're creating a new template
    this.updateUrlParams({
      newTemplate: 'true',
      businessType: currentBusinessType || null,
      plan: this.currentPlan(),
      step: this.currentStep().toString(),
    });

    // Give time for themes to load before entering fullscreen
    setTimeout(() => {
      console.log('Toggling fullscreen');
      this.loadingOverlayClass.set('fadeOut');
      this.toggleFullscreen(); // Use component's toggleFullscreen which uses the service
    }, 700); // Reduced from 1000ms for faster response
  }

  /**
   * Re-enter edit mode from main screen (Continue Editing)
   */
  editBuilding(): void {
    console.log('🔍 editBuilding called - continuing editing');

    // Set loading overlay for visual feedback
    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('active');

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

    // Enter fullscreen mode (initial entry): reset scroll capture, do NOT call toggleFullscreen
    if (!this.viewManagementService.isFullscreen()) {
      this.viewManagementService.resetStoredScrollPosition();
      this.viewManagementService.setFullscreen(true);
      setTimeout(() => {
        this.loadingOverlayClass.set('fadeOut');
      }, ANIMATION_DURATIONS.FULLSCREEN_TRANSITION);
    } else {
      setTimeout(() => {
        this.loadingOverlayClass.set('fadeOut');
      }, ANIMATION_DURATIONS.FADE_OUT);
    }

    // Keep prevention active for a short time
    setTimeout(() => {
      console.log('🔍 Theme override prevention disabled after initialization');
      this.preventThemeOverride.set(false);
    }, ANIMATION_DURATIONS.FULLSCREEN_TRANSITION + 400); // Extra time to ensure theme loads completely
  }

  /**
   * Enter view-only mode without editing controls
   */
  openViewOnly(): void {
    // Set loading overlay for visual feedback
    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('active');

    // Set view mode flag
    this.isViewOnlyStateService.setIsOnlyViewMode(true);

    // Update URL parameters
    this.updateUrlParams({ viewOnly: 'true', mode: 'view' });

    // Enter fullscreen mode (initial entry): reset scroll capture, do NOT call toggleFullscreen
    if (!this.viewManagementService.isFullscreen()) {
      this.viewManagementService.resetStoredScrollPosition();
      this.viewManagementService.setFullscreen(true);
      setTimeout(() => {
        this.loadingOverlayClass.set('fadeOut');
      }, ANIMATION_DURATIONS.FULLSCREEN_TRANSITION);
    } else {
      setTimeout(() => {
        this.loadingOverlayClass.set('fadeOut');
      }, ANIMATION_DURATIONS.FADE_OUT);
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
    if (this.viewManagementService.viewMode() !== 'view-desktop') {
      this.viewManagementService.setViewMode('view-desktop');
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
    const currentlyFullscreen = this.viewManagementService.isFullscreen();
    if (!currentlyFullscreen) {
      // ENTERING FULLSCREEN (locally toggled)
      console.log(
        '🔍 Entering fullscreen mode via PreviewComponent.toggleFullscreen'
      );

      // Explicitly capture current scroll for local toggle
      this.viewManagementService.setDesiredRestoreScrollPosition(
        window.scrollY
      );

      // This is a user-initiated toggle, so we want to preserve exact scroll position
      this.viewManagementService.setFullscreen(true);

      // UI adjustments for header (specific to PreviewComponent's context)
      const mainHeader = document.querySelector('.header') as HTMLElement;
      if (mainHeader) {
        mainHeader.style.zIndex = '500';
      }
    } else {
      // EXITING FULLSCREEN
      console.log(
        '🔍 Exiting fullscreen mode via PreviewComponent.toggleFullscreen'
      );

      // Clear tab memory when exiting fullscreen to start fresh next time
      sessionStorage.removeItem('webcraft_customizer_tab_memory');
      console.log('[TabMemory] Cleared tab memory on fullscreen exit');

      // Body overflow/class and scroll restoration are handled by ViewManagementService
      this.viewManagementService.setFullscreen(false);

      // UI adjustments for header (specific to PreviewComponent's context)
      const mainHeader = document.querySelector('.header') as HTMLElement;
      if (mainHeader) {
        mainHeader.style.zIndex = '1000';
      }

      // Reset scroll position for the internal preview wrapper (if applicable)
      const previewWrapper = document.querySelector('.preview-wrapper');
      if (previewWrapper) {
        previewWrapper.scrollTop = 0; // This is for the internal scroll of the preview element
      }
    }
  }

  /**
   * Called when loading overlay animation completes
   */
  onLoadingOverlayFinished(): void {
    // Only hide the overlay when fadeOut completes
    if (this.loadingOverlayClass() === 'fadeOut') {
      this.showLoadingOverlay.set(false);
      // Reset class for next time
      this.loadingOverlayClass.set('');
    }
  }

  // ======== TEMPLATE SAVING & EDITING ========
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
    this.loadingOverlayClass.set('active');

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

    // Initialize defaults for this business type and plan
    this.initializeDefaultCustomizations();

    // If we have a business type, reload themes
    if (currentBusinessType) {
      // Load themes for this business type using the template initialization service
      this.loadThemesUsingService(currentBusinessType, currentPlan);
    }

    // --- Update URL Parameters ---
    console.log('[resetCustomizations] Updating URL for new template flow');
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
    if (this.viewManagementService.isFullscreen()) {
      this.toggleFullscreen();
    }

    // Hide loading after a short delay to allow state updates
    setTimeout(() => {
      this.loadingOverlayClass.set('fadeOut');
    }, ANIMATION_DURATIONS.FULLSCREEN_TRANSITION);
  }

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
      this.loadingOverlayClass.set('fadeOut');
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
      this.loadingOverlayClass.set('fadeOut');
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

          // Hide loading state with fadeOut
          this.loadingOverlayClass.set('fadeOut');

          // Show success message
          this.confirmationService.showConfirmation(
            `Your website ${
              isNewTemplate ? 'has been created' : 'changes have been saved'
            } successfully!`,
            'success',
            3000
          );

          // Exit fullscreen mode if active
          if (this.viewManagementService.isFullscreen()) {
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

          // Hide loading state with fadeOut
          this.loadingOverlayClass.set('fadeOut');

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
    console.log('[selectPlan] Setting plan to:', plan);

    // Update both individual signal and consolidated state
    this.currentPlan.set(plan);

    // Explicitly update ThemeColorsService
    this.themeColorsService.setPlan(plan);

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
        this.loadThemesUsingService(currentBusinessType);
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
   * Apply a theme/font update from the theme switcher
   */
  loadTheme(theme: any): void {
    // Ensure theme is treated as a string ID
    const themeId = typeof theme === 'object' ? theme.id : theme;

    if (!themeId) {
      console.warn('[loadTheme] No valid theme ID provided');
      return;
    }

    this.selectedBaseTemplateId.set(themeId);

    // Determine if we are in the new template creation flow
    const isNewTemplateFlow =
      this.route.snapshot.queryParams['newTemplate'] === 'true' &&
      !this.currentUserTemplateId();

    if (isNewTemplateFlow) {
      console.log(
        `[loadTheme] New template flow: Loading theme ID: ${themeId}`
      );
      // In the new template flow, always load the selected theme's config.
      // Resetting prevent flag just in case.
      this.preventThemeOverride.set(false);
      this.loadBaseTemplate(themeId);
    } else if (this.currentUserTemplateId()) {
      // If editing an existing template, do NOT load the base template over it.
      console.log(
        `[loadTheme] Existing template flow: Storing theme ID: ${themeId}`
      );
    } else {
      // Fallback/Edge case: Not explicitly new, but no current ID - load the theme.
      console.warn(`[loadTheme] Edge case: Loading theme ID: ${themeId}`);
      this.preventThemeOverride.set(false);
      this.loadBaseTemplate(themeId);
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

  /**
   * Update template name from the editable input
   */
  updateTemplateName(newName: string): void {
    if (newName?.trim()) {
      console.log(`[updateTemplateName] Updating template name to: ${newName}`);
      this.currentTemplateName.set(newName.trim());

      // Update consolidated state
      this.templateState.update((state) => ({
        ...state,
        name: newName.trim(),
      }));
    }
  }

  /**
   * Publish the current template: redirect to subscription selection page
   */
  publishTemplate(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }
    const templateId = this.currentUserTemplateId();
    const templateName = this.currentTemplateName() || 'Website Template';
    const templatePlan = this.currentPlan() || 'standard';
    const templateType = this.businessType() || 'business';
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
        templateName,
        templatePlan,
        templateType,
      },
    });
  }

  // ======== VIEW MODE ACCESSOR METHODS ========
  // These methods delegate to the ViewManagementService for template usage

  /**
   * Check if fullscreen mode is active
   * Delegates to ViewManagementService
   */
  isFullscreen(): boolean {
    return this.viewManagementService.isFullscreen();
  }

  /**
   * Get the current view mode (desktop or mobile)
   * Delegates to ViewManagementService
   */
  viewMode(): 'view-desktop' | 'view-mobile' {
    return this.viewManagementService.viewMode();
  }

  /**
   * Check if the current view is mobile-sized
   * Delegates to ViewManagementService
   */
  isMobileView(): boolean {
    return this.viewManagementService.isMobileView();
  }

  /**
   * Toggle between desktop and mobile view modes
   * Delegates to ViewManagementService after handling component selection
   */
  toggleView(mode: 'view-desktop' | 'view-mobile'): void {
    // If switching to mobile view, close any open component editor
    if (mode === 'view-mobile' && this.selectedComponent()) {
      this.selectedComponent.set(null);
    }

    // Delegate to the view management service
    this.viewManagementService.setViewMode(mode);
  }

  /**
   * Apply initial data from the TemplateInitializationService to component signals.
   * This method takes the data from the service and sets up all the component state.
   */
  private applyInitialData(initialData: InitialTemplateData): void {
    console.log('[PreviewComponent] Setting plan to:', initialData.plan);

    // Set all signals from the initial data
    this.currentUserTemplateId.set(initialData.currentUserTemplateId);
    this.currentTemplateName.set(initialData.currentTemplateName);
    this.customizations.set(initialData.customizations);
    this.businessType.set(initialData.businessType);
    this.businessTypeDisplayName.set(initialData.businessTypeName);
    this.currentPlan.set(initialData.plan);

    // Ensure the ThemeColorsService knows about the plan too
    this.themeColorsService.setPlan(initialData.plan);

    this.currentStep.set(initialData.currentStep);
    this.showBusinessTypeSelector.set(initialData.showBusinessTypeSelector);

    // Properly cast the selectedFont to ensure fallback is always a string as required by FontOption
    if (initialData.selectedFont) {
      this.selectedFont.set({
        ...initialData.selectedFont,
        fallback: initialData.selectedFont.fallback || 'sans-serif',
      } as FontOption);
    } else {
      this.selectedFont.set(null);
    }

    this.selectedBaseTemplateId.set(initialData.selectedBaseTemplateId);
    this.availableThemes.set(initialData.availableThemes);
    this.hasStartedBuilding.set(initialData.hasStartedBuilding);
    this.hasSavedChangesFlag.set(initialData.hasSavedChangesFlag);

    // Update consolidated state
    this.templateState.set({
      id: initialData.currentUserTemplateId,
      name: initialData.currentTemplateName || 'Untitled Template',
      baseId: initialData.selectedBaseTemplateId,
      businessType: initialData.businessType,
      businessTypeName: initialData.businessTypeName,
      plan: initialData.plan,
    });

    // Update the last saved state if we have customizations
    if (
      initialData.customizations &&
      (initialData.hasSavedChangesFlag || initialData.currentUserTemplateId)
    ) {
      this.updateLastSavedState();
    }
  }

  private initializeEmptyCustomizations(): Customizations {
    return {
      fontConfig: {
        fontId: 1,
        family: 'Arial',
        fallback: 'sans-serif',
      },
      header: {
        backgroundColor: '#0dff00',
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
  }

  /**
   * Load themes for a specific business type using the TemplateInitializationService.
   */
  private loadThemesUsingService(
    businessType: string,
    plan?: 'standard' | 'premium'
  ): void {
    const currentPlan = plan || this.currentPlan();

    this.templateInitializationService
      .getThemesForTypeAndPlan(businessType, currentPlan)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (themes: Template[]) => {
          this.availableThemes.set(themes);

          // If no base template is selected and themes are available, select the first one
          if (!this.selectedBaseTemplateId() && themes.length > 0) {
            this.selectedBaseTemplateId.set(themes[0].id);

            // If we're in resetCustomizations flow, also load the base template
            if (!this.preventThemeOverride()) {
              this.loadBaseTemplate(themes[0].id);
            }
          }
        },
        error: (err) => {
          console.error('Error loading themes:', err);
          this.availableThemes.set([]);
        },
      });
  }

  /**
   * Load base template configuration from API and apply ONLY if creating a new template.
   * This version uses the TemplateInitializationService for fetching.
   */
  loadBaseTemplate(templateId: string): void {
    console.log(`[loadBaseTemplate] Loading base template ID: ${templateId}`);

    // Prevent loading if editing an existing user template or if override is flagged
    if (this.currentUserTemplateId()) {
      console.log(
        '[loadBaseTemplate] Skipping: Already editing user template.'
      );
      return;
    }
    if (this.preventThemeOverride()) {
      console.log(
        '[loadBaseTemplate] Skipping: Theme override prevention active.'
      );
      return;
    }

    // Show loading indicator for better UX
    this.showLoadingOverlay.set(true);
    this.loadingOverlayClass.set('active');

    // Store current selected base template ID for reference
    this.selectedBaseTemplateId.set(templateId);

    // Fetch the base template configuration using the service
    this.templateInitializationService
      .fetchBaseTemplateConfig(templateId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config) => {
          console.log('[loadBaseTemplate] Received config:', config);

          // Update customizations if they exist in the config
          if (config.customizations) {
            // Apply the customizations
            this.customizations.set(config.customizations);

            // Update the state to reflect the new customizations
            this.updateLastSavedState();
          }

          // Update font if it exists in the config
          if (config.font) {
            this.selectedFont.set({
              id: config.font.id,
              family: config.font.family,
              fallback: config.font.fallback,
            } as FontOption);
          }

          // Fade out the loading overlay
          this.loadingOverlayClass.set('fadeOut');
        },
        error: (err) => {
          console.error('[loadBaseTemplate] Error loading base template:', err);

          // Fade out the loading overlay on error
          this.loadingOverlayClass.set('fadeOut');

          // Inform the user
          this.confirmationService.showConfirmation(
            'Error loading base template: ' + (err.message || 'Unknown error'),
            'error',
            3000
          );
        },
      });
  }

  ngAfterViewInit(): void {
    // **register the real preview wrapper** for scroll restoration
    this.viewManagementService.registerBuilderAnchor(this.builderAnchor);
  }
}
