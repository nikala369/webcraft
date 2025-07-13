import { Injectable, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Services
import { UserTemplateService } from './user-template.service';
import { TemplateService } from './template.service';
import { AuthService } from '../auth/auth.service';
import { ConfirmationService } from '../shared/confirmation/confirmation.service';
import { BusinessConfigService } from '../business-config/business-config.service';

// Models
import { InitialTemplateData } from '../../models/initial-template-data.model';
import { Customizations } from '../../models/website-customizations';
import { BUSINESS_TYPES } from '../../models/business-types';
import { UserTemplate } from './user-template.service';
import { Template } from './template.service';

/**
 * Service responsible for initializing template data from route parameters.
 * This service extracts the complex route parameter parsing and template initialization
 * logic from PreviewComponent, improving separation of concerns and maintainability.
 */
@Injectable({
  providedIn: 'root',
})
export class TemplateInitializationService {
  // Service injections
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private userTemplateService = inject(UserTemplateService);
  private templateService = inject(TemplateService);
  private confirmationService = inject(ConfirmationService);
  private businessConfigService = inject(BusinessConfigService);
  private destroyRef = inject(DestroyRef);

  // Reference to business types for display name mapping
  private businessTypes = BUSINESS_TYPES;

  /**
   * Initialize template data from route parameters.
   * This method orchestrates the entire initialization sequence based on URL parameters.
   *
   * @returns Observable<InitialTemplateData> The complete initialization data
   */
  initializeFromRouteParameters(): Observable<InitialTemplateData> {
    return this.route.queryParams.pipe(
      take(1), // Only process params once during initialization
      map((params) => {
        // Extract core parameters
        const templateId = params['templateId'] || null;
        const isCreatingNew = params['newTemplate'] === 'true';
        const urlBusinessType = params['businessType'] || null;
        const urlPlan = (params['plan'] || 'standard') as
          | 'standard'
          | 'premium';
        const urlMode = params['mode'] || 'edit';
        const urlStep = params['step'] ? parseInt(params['step'], 10) : null;

        console.log(
          `[TemplateInitializationService] Determined: ` +
            `templateId=${templateId}, ` +
            `newTemplate=${isCreatingNew}, ` +
            `businessType=${urlBusinessType}, ` +
            `plan=${urlPlan}`
        );

        return {
          templateId,
          isCreatingNew,
          urlBusinessType,
          urlPlan,
          urlMode,
          urlStep,
        };
      }),
      switchMap((params) => {
        const {
          templateId,
          isCreatingNew,
          urlBusinessType,
          urlPlan,
          urlMode,
          urlStep,
        } = params;

        // Check authentication if needed
        if (templateId && !this.authService.isAuthenticated()) {
          return throwError(() =>
            this.createAuthError('edit an existing website', this.router.url)
          );
        }

        if (
          isCreatingNew &&
          urlBusinessType &&
          !this.authService.isAuthenticated()
        ) {
          return throwError(() =>
            this.createAuthError('create a new website', this.router.url)
          );
        }

        // --- Priority 1: load/edit existing template ---
        if (templateId) {
          return this.loadExistingTemplate(templateId, urlMode);
        }
        // --- Priority 2: creating a brand-new template ---
        else if (isCreatingNew && urlBusinessType) {
          return this.initializeNewTemplate(
            urlBusinessType,
            urlPlan,
            urlStep ?? 3
          );
        }
        // --- Priority 3: businessType specified, but no template ---
        else if (urlBusinessType) {
          // For unauthenticated preview with businessType
          if (!this.authService.isAuthenticated()) {
            console.log(
              `[TemplateInitializationService] Unauthenticated preview for businessType=${urlBusinessType}`
            );

            return of(
              this.createUnauthenticatedPreview(
                urlBusinessType,
                urlPlan,
                urlStep ?? 3
              )
            );
          }

          // For authenticated user with businessType selected
          return this.initializeWithBusinessType(
            urlBusinessType,
            urlPlan,
            urlStep ?? 3
          );
        }
        // --- Fallback: no info at all, show the selector ---
        else {
          return of(this.createInitialSelectorState(urlPlan, urlStep ?? 2));
        }
      })
    );
  }

  /**
   * Loads an existing template from the API.
   * @param templateId ID of the template to load
   * @param mode View or edit mode
   * @returns Observable<InitialTemplateData>
   */
  private loadExistingTemplate(
    templateId: string,
    mode: string
  ): Observable<InitialTemplateData> {
    console.log(
      `[TemplateInitializationService] Loading template with ID ${templateId} in ${mode} mode`
    );

    return this.userTemplateService.getUserTemplateById(templateId).pipe(
      switchMap((template) => {
        if (!template) {
          return throwError(
            () => new Error(`Template with ID ${templateId} not found`)
          );
        }

        // Get business type and load themes
        const templateType = template.template?.templateType?.key || '';
        let themesObs = of([]) as Observable<Template[]>;

        if (templateType) {
          themesObs = this.getThemesForTypeAndPlan(
            templateType,
            template.template?.templatePlan?.type === 'PREMIUM'
              ? 'premium'
              : 'standard'
          );
        }

        return forkJoin({
          template: of(template),
          themes: themesObs,
        });
      }),
      map(({ template, themes }) => {
        // Extract template data
        const templateType = template.template?.templateType?.key || '';
        const userTemplateName = template.name;
        const baseTemplateName = template.template?.name;
        const displayName =
          userTemplateName || baseTemplateName || 'Untitled Template';
        const businessTypeName = this.getBusinessTypeDisplayName(templateType);
        const templatePlan =
          template.template?.templatePlan?.type === 'PREMIUM'
            ? 'premium'
            : 'standard';

        // Set default state
        const result: InitialTemplateData = {
          currentUserTemplateId: template.id,
          currentTemplateName: displayName,
          customizations: null,
          businessType: templateType,
          businessTypeName,
          plan: templatePlan,
          currentStep: mode === 'view' ? 3 : 4,
          showBusinessTypeSelector: false,
          selectedFont: null,
          selectedBaseTemplateId: template.template?.id || null,
          availableThemes: themes,
          hasStartedBuilding: true,
          hasSavedChangesFlag: true,
          isPublished: template.published || false,
          initialMode: mode as 'edit' | 'view',
        };

        // Process customizations
        if (template.config) {
          try {
            const configStr = template.config.trim();
            console.log(
              '[TemplateInitializationService] Raw template.config:',
              configStr
            );

            const customizationsData = JSON.parse(configStr);
            result.customizations = customizationsData;

            // Set font if available
            if (customizationsData.fontConfig) {
              const { fontId, family, fallback } =
                customizationsData.fontConfig;
              result.selectedFont = { id: fontId, family, fallback };
            }

            console.log(
              '[TemplateInitializationService] Successfully loaded and applied template configuration'
            );
          } catch (e) {
            console.error(
              '[TemplateInitializationService] Error parsing template.config, falling back to defaults:',
              e
            );

            // Fallback to defaults
            const { customizations, font } = this.getDefaultsForTypeAndPlan(
              templateType,
              templatePlan
            );
            result.customizations = customizations;
            result.selectedFont = font;

            this.confirmationService.showConfirmation(
              'Could not parse your template configuration – using defaults.',
              'warning',
              5000
            );
          }
        } else {
          console.warn(
            '[TemplateInitializationService] Template has no config – using defaults'
          );

          // Initialize with defaults
          const { customizations, font } = this.getDefaultsForTypeAndPlan(
            templateType,
            templatePlan
          );
          result.customizations = customizations;
          result.selectedFont = font;

          this.confirmationService.showConfirmation(
            'Template has no configuration data. Using default settings.',
            'warning',
            3000
          );
        }

        return result;
      }),
      catchError((error) => {
        console.error(
          '[TemplateInitializationService] Error loading template from API:',
          error
        );

        // Create a more specific error with details about what failed
        const errorMessage =
          error.status === 404
            ? `Template with ID ${templateId} not found`
            : `Failed to load template: ${error.message || 'API error'}`;

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Initialize state for creating a new template.
   * @param businessType The business type key
   * @param plan The selected plan (standard or premium)
   * @param step The current step in the flow
   * @returns Observable<InitialTemplateData>
   */
  private initializeNewTemplate(
    businessType: string,
    plan: 'standard' | 'premium',
    step: number
  ): Observable<InitialTemplateData> {
    console.log(
      `[TemplateInitializationService] Initializing for type: ${businessType}`
    );

    const businessTypeName = this.getBusinessTypeDisplayName(businessType);
    const templateName = `${businessTypeName} Website`;

    // First load themes for this business type
    return this.getThemesForTypeAndPlan(businessType, plan).pipe(
      map((themes) => {
        // Initialize default customizations for this type
        const { customizations, font } = this.getDefaultsForTypeAndPlan(
          businessType,
          plan
        );

        // Create initial data
        const result: InitialTemplateData = {
          currentUserTemplateId: null,
          currentTemplateName: null, // Don't pre-set template name - let user choose in modal
          customizations,
          businessType: businessType,
          businessTypeName,
          plan,
          currentStep: step,
          showBusinessTypeSelector: false,
          selectedFont: font,
          selectedBaseTemplateId: themes.length > 0 ? themes[0].id : null,
          availableThemes: themes,
          hasStartedBuilding: false, // Don't auto-start building - user must click "Start Crafting"
          hasSavedChangesFlag: false,
          initialMode: 'edit' as 'edit' | 'view',
          isCreatingNew: true,
        };

        return result;
      })
      // No catchError here - let errors from getThemesForTypeAndPlan propagate up
    );
  }

  /**
   * Initialize data for an authenticated user with business type selected
   * @param businessType The business type key
   * @param plan The selected plan
   * @param step The current step
   * @returns Observable<InitialTemplateData>
   */
  private initializeWithBusinessType(
    businessType: string,
    plan: 'standard' | 'premium',
    step: number
  ): Observable<InitialTemplateData> {
    console.log(
      `[TemplateInitializationService] Business type selected=${businessType}, loading themes…`
    );

    const businessTypeName = this.getBusinessTypeDisplayName(businessType);

    // Load themes for this business type
    return this.getThemesForTypeAndPlan(businessType, plan).pipe(
      map((themes) => {
        // Initialize default customizations
        const { customizations, font } = this.getDefaultsForTypeAndPlan(
          businessType,
          plan
        );

        // Create initial data
        return {
          currentUserTemplateId: null,
          currentTemplateName: null,
          customizations,
          businessType,
          businessTypeName,
          plan,
          currentStep: step,
          showBusinessTypeSelector: false,
          selectedFont: font,
          selectedBaseTemplateId: themes.length > 0 ? themes[0].id : null,
          availableThemes: themes,
          hasStartedBuilding: false, // Don't auto-start building - user must click "Start Crafting"
          hasSavedChangesFlag: false,
          initialMode: 'edit' as 'edit' | 'view',
        };
      })
      // No catchError here - let errors from getThemesForTypeAndPlan propagate up
    );
  }

  /**
   * Create initial state for unauthenticated preview with businessType
   * @param businessType The business type key
   * @param plan The selected plan
   * @param step The current step
   */
  private createUnauthenticatedPreview(
    businessType: string,
    plan: 'standard' | 'premium',
    step: number
  ): InitialTemplateData {
    const businessTypeName = this.getBusinessTypeDisplayName(businessType);
    const { customizations, font } = this.getDefaultsForTypeAndPlan(
      businessType,
      plan
    );

    return {
      currentUserTemplateId: null,
      currentTemplateName: null,
      customizations,
      businessType,
      businessTypeName,
      plan,
      currentStep: step,
      showBusinessTypeSelector: false,
      selectedFont: font,
      selectedBaseTemplateId: null,
      availableThemes: [],
      hasStartedBuilding: false,
      hasSavedChangesFlag: false,
      initialMode: 'view' as 'edit' | 'view',
    };
  }

  /**
   * Create initial state showing the business type selector
   * @param plan The selected plan
   * @param step The current step
   */
  private createInitialSelectorState(
    plan: 'standard' | 'premium',
    step: number
  ): InitialTemplateData {
    const { customizations, font } = this.getDefaultsForTypeAndPlan('', plan);

    return {
      currentUserTemplateId: null,
      currentTemplateName: null,
      customizations,
      businessType: '',
      businessTypeName: '',
      plan,
      currentStep: step,
      showBusinessTypeSelector: true,
      selectedFont: font,
      selectedBaseTemplateId: null,
      availableThemes: [],
      hasStartedBuilding: false,
      hasSavedChangesFlag: false,
      initialMode: 'edit' as 'edit' | 'view',
    };
  }

  /**
   * Create an error object for authentication failures
   * @param action The action being attempted
   * @param returnUrl The URL to return to after login
   */
  private createAuthError(action: string, returnUrl: string): Error {
    console.warn(
      `[TemplateInitializationService] Authentication required to ${action}. Redirecting to login.`
    );

    const error = new Error(`Authentication required to ${action}`);
    (error as any).authRedirect = {
      action,
      returnUrl,
    };

    return error;
  }

  /**
   * Get the business type display name from the key
   * @param businessTypeKey The business type key
   * @returns The display name
   */
  getBusinessTypeDisplayName(businessTypeKey: string): string {
    const businessTypeObj = this.businessTypes.find(
      (type) => type.id === businessTypeKey
    );

    if (businessTypeObj) {
      return businessTypeObj.name;
    } else {
      // Fall back to the key with first letter capitalized if no match
      return businessTypeKey
        ? businessTypeKey.charAt(0).toUpperCase() + businessTypeKey.slice(1)
        : '';
    }
  }

  /**
   * Initialize customizations with default values for the selected business type
   * Public version to be called from PreviewComponent post-initialization
   *
   * @param businessTypeKey The business type key
   * @param plan The selected plan
   * @returns Default customizations and font
   */
  getDefaultsForTypeAndPlan(
    businessTypeKey: string,
    plan: 'standard' | 'premium'
  ): {
    customizations: Customizations;
    font: { id: number; family: string; fallback: string } | null;
  } {
    let customizations: Customizations;
    let font = null;

    if (businessTypeKey) {
      // Use BusinessConfigService to generate appropriate defaults
      customizations = this.businessConfigService.generateDefaultCustomizations(
        businessTypeKey,
        plan
      );

      // Extract font from the default customizations
      if (customizations.fontConfig) {
        font = {
          id: customizations.fontConfig.fontId,
          family: customizations.fontConfig.family,
          fallback: customizations.fontConfig.fallback || 'sans-serif',
        };
      }
    } else {
      // If no business type, set an empty customization object
      customizations = this.initializeEmptyCustomizations();
    }

    return { customizations, font };
  }

  /**
   * Initialize an empty customizations object
   * @returns Empty customizations object
   */
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
   * Load themes filtered by business type
   * Public method usable by PreviewComponent post-initialization
   *
   * @param businessTypeKey The business type key
   * @param plan The selected plan
   * @returns Observable of available themes
   */
  getThemesForTypeAndPlan(
    businessTypeKey: string,
    plan: 'standard' | 'premium'
  ): Observable<Template[]> {
    console.log(
      `[TemplateInitializationService] Loading themes for business type: ${businessTypeKey}`
    );

    // First, we need to get the template type ID that corresponds to the business type key
    return this.templateService.getAllTemplateTypes().pipe(
      switchMap((templateTypes) => {
        // Find the template type with matching key
        const templateType = templateTypes.find(
          (type) => type.key === businessTypeKey
        );

        if (!templateType) {
          console.error(
            `No template type found for business type key: ${businessTypeKey}`
          );
          this.confirmationService.showConfirmation(
            'Error finding template type. Please try again.',
            'error',
            3000
          );
          return throwError(
            () =>
              new Error(
                `No template type found for business type: ${businessTypeKey}`
              )
          );
        }

        // Get plan ID based on current plan
        return this.templateService
          .getTemplatePlanId(this.templateService.convertPlanType(plan))
          .pipe(
            switchMap((planId) => {
              // Now search using the actual template type ID from the API
              // todo .searchTemplates(templateType.id, planId, 0, 5)
              return this.templateService
                .searchTemplates(null, null, 0, 30)
                .pipe(
                  map((response) => response.content as unknown as Template[]),
                  catchError((err) => {
                    console.error(
                      'Error loading templates for business type:',
                      err
                    );
                    this.confirmationService.showConfirmation(
                      'Error loading templates. Please try again.',
                      'error',
                      3000
                    );
                    return throwError(
                      () =>
                        new Error(
                          `Failed to load templates for business type ${businessTypeKey}: ${
                            err.message || 'API error'
                          }`
                        )
                    );
                  })
                );
            }),
            catchError((err) => {
              console.error('Error getting plan ID for', plan, ':', err);
              this.confirmationService.showConfirmation(
                'Error loading plan information. Please try again.',
                'error',
                3000
              );
              return throwError(
                () =>
                  new Error(
                    `Failed to get plan ID for ${plan}: ${
                      err.message || 'API error'
                    }`
                  )
              );
            })
          );
      }),
      catchError((err) => {
        console.error('Error loading template types:', err);
        this.confirmationService.showConfirmation(
          'Error loading template types. Please try again.',
          'error',
          3000
        );
        return throwError(
          () =>
            new Error(
              `Failed to load template types: ${err.message || 'API error'}`
            )
        );
      })
    );
  }

  /**
   * Fetch a base template's configuration to be applied to a new template.
   * This method is exposed for use by PreviewComponent after initialization.
   *
   * @param templateId The base template ID
   * @returns Observable with customizations and font data
   */
  fetchBaseTemplateConfig(templateId: string): Observable<{
    customizations: Customizations | null;
    font: { id: number; family: string; fallback: string } | null;
  }> {
    console.log(
      `[TemplateInitializationService] Fetching base template config: ${templateId}`
    );

    return this.templateService.getTemplateById(templateId).pipe(
      map((template) => {
        const result = {
          customizations: null as Customizations | null,
          font: null as { id: number; family: string; fallback: string } | null,
        };

        if (template.config) {
          try {
            // Sanitize the config string before parsing
            const configStr = template.config.trim();

            // Parse the config
            if (configStr) {
              const parsedConfig = JSON.parse(configStr);
              result.customizations = parsedConfig;

              // Extract font if available
              if (parsedConfig.fontConfig) {
                const fontConfig = parsedConfig.fontConfig;
                result.font = {
                  id: fontConfig.fontId,
                  family: fontConfig.family,
                  fallback: fontConfig.fallback || 'sans-serif',
                };
              }
            }
          } catch (e) {
            console.error(
              '[TemplateInitializationService] Error parsing template config:',
              e
            );
            // Return null values to indicate error
            return { customizations: null, font: null };
          }
        } else {
          console.warn(
            '[TemplateInitializationService] No config found in template.'
          );
        }

        return result;
      }),
      catchError((err) => {
        console.error(
          `[TemplateInitializationService] Error loading base template ${templateId}:`,
          err
        );
        const errorMessage =
          err.status === 404
            ? `Base template with ID ${templateId} not found`
            : `Failed to load base template configuration: ${
                err.message || 'API error'
              }`;

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
