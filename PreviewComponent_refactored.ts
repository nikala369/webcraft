/**
 * SUMMARY OF REFACTORING CHANGES FOR PreviewComponent
 * 
 * This document summarizes the key changes made to refactor the PreviewComponent
 * to adhere to the requirements for an authenticated-users-only workflow.
 */

/**
 * 1. STATE MANAGEMENT WITH SIGNALS
 * 
 * Added or modified signals to properly track template state:
 */
// Template and customization state
customizations = signal<Customizations | null>(null);
selectedBaseTemplateId = signal<string | null>(null); // NEW - for tracking base template ID
currentUserTemplateId = signal<string | null>(null); // Changed from property to signal
currentTemplateName = signal<string>('My Website'); // NEW - to track template name
businessTypeDisplayName = signal<string>(''); // NEW - for displaying business type name

// Removed signals
// Removed: currentScreenSize = signal<ScreenSize>(ScreenSize.DESKTOP);
// Removed: ScreenSize enum

// NEW computed signals for UI state
isEditingAllowed = computed(() => this.viewMode() === 'view-desktop');
isBusinessTypeReadonly = computed(() => 
  this.currentUserTemplateId() !== null || this.isFullscreen());

/**
 * 2. AUTHENTICATION HANDLING
 * 
 * Modified ngOnInit to require authentication:
 */
ngOnInit(): void {
  // Setup event listeners
  window.addEventListener('resize', this.updateIsMobile.bind(this));
  document.addEventListener('fullscreenchange', this.handleFullscreenChange);
  
  // Check if user is authenticated - require auth for all operations
  if (!this.authService.isAuthenticated()) {
    console.log('User is not authenticated - redirecting to login');
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: this.router.url },
    });
    return;
  }
  
  // Parse route parameters to determine the operation mode
  this.parseRouteParameters();
}

/**
 * 3. ROUTE PARAMETERS HANDLING
 * 
 * New method to parse route parameters and initialize component:
 */
private parseRouteParameters(): void {
  this.showLoadingOverlay.set(true);
  
  this.route.queryParams.subscribe(params => {
    // Set plan from params or default to standard
    const plan = params['plan'] || 'standard';
    this.currentPlan.set(plan as 'standard' | 'premium');
    
    // Determine the operation mode
    const templateId = params['templateId'];
    const newTemplate = params['newTemplate'] === 'true';
    const mode = params['mode'] || 'edit';
    
    // Handle business type from params
    const urlBusinessType = params['businessType'];
    if (urlBusinessType) {
      this.businessType.set(urlBusinessType);
    }
    
    // Initialize based on operation mode
    if (templateId) {
      // Edit or view existing template mode
      this.loadExistingTemplate(templateId, mode);
    } else if (newTemplate) {
      // New template creation mode
      this.initializeNewTemplate(urlBusinessType);
    } else {
      // No template ID or creation flag - show business type selector
      this.currentStep.set(2); // Business type selection step
      this.showBusinessTypeSelector.set(true);
      this.showLoadingOverlay.set(false);
    }
  });
}

/**
 * 4. LOADING EXISTING TEMPLATES
 * 
 * New method to load existing templates from API:
 */
private loadExistingTemplate(templateId: string, mode: string): void {
  this.loadingOverlayClass.set('active');
  
  this.userTemplateService.getUserTemplateById(templateId).subscribe({
    next: (template) => {
      if (template && template.config) {
        // Store the template ID and name
        this.currentUserTemplateId.set(template.id);
        this.currentTemplateName.set(template.name);

        // Set business type based on template data
        if (template.template?.templateType?.key) {
          const templateType = template.template.templateType.key;
          this.businessType.set(templateType);
          
          // Get the display name for the business type
          this.setBusinessTypeDisplayName(templateType);
          
          // Load themes for this business type
          this.loadThemesForBusinessType(templateType);
        }

        // Parse the config string to get customizations
        try {
          const customizationsData = JSON.parse(template.config);
          this.customizations.set(customizationsData);
          
          // Update tracking state
          this.lastSavedState.set(structuredClone(customizationsData));
          this.currentEditingState.set(structuredClone(customizationsData));
          
          // Set appropriate flags for editing flow
          this.hasStartedBuilding.set(true);
          this.hasSavedChangesFlag.set(true);
          this.currentStep.set(3); // Move to editing step
          
          // Switch to appropriate mode
          if (mode === 'edit') {
            setTimeout(() => this.editBuilding(), 300);
          } else if (mode === 'view') {
            setTimeout(() => this.openViewOnly(), 300);
          }
        } catch (e) {
          console.error('Error parsing template config:', e);
          this.confirmationService.showConfirmation(
            'Error parsing template configuration. Using default settings.',
            'error',
            5000
          );
        }
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
 * 5. THEME LOADING
 * 
 * Improved theme loading for a business type:
 */
loadThemesForBusinessType(businessType: string): void {
  console.log(`Loading themes for business type: ${businessType}`);

  // Always set loading state first
  this.availableThemes.set([]);

  // Get plan ID based on current plan
  const planType = this.templateService.convertPlanType(this.currentPlan());
  
  this.templateService.getTemplatePlanId(planType).subscribe({
    next: (planId) => {
      // Search for templates with the given business type and plan
      this.templateService.searchTemplates(businessType, planId).subscribe({
        next: (response) => {
          // Save templates to signal
          this.availableThemes.set(response.content);

          // If we have templates and no base template ID is selected yet, select the first one
          if (response.content.length > 0 && !this.selectedBaseTemplateId()) {
            const firstTemplateId = response.content[0].id;
            this.selectedBaseTemplateId.set(firstTemplateId);
            this.loadBaseTemplate(firstTemplateId);
          }
        },
        error: (err) => {
          console.error('Error loading templates for business type:', err);
          this.availableThemes.set([]);
        },
      });
    }
  });
}

/**
 * 6. SAVING CHANGES
 * 
 * Updated save logic to use API only:
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
  
  // Show loading state
  this.showLoadingOverlay.set(true);
  
  // Create a deep copy of customizations to modify before saving
  const customizationsToSave = structuredClone(this.customizations());
  
  // Sanitize data for API storage
  this.sanitizeCustomizationsForStorage(customizationsToSave);
  
  // Get the template name
  const templateName = this.currentTemplateName() || 
    `${this.businessTypeDisplayName() || 'My'} Website`;
    
  // Determine if we're creating or updating
  const currentTemplateId = this.currentUserTemplateId();
  const baseTemplateId = this.selectedBaseTemplateId();
  
  // Save to the API
  this.userTemplateService
    .saveUserTemplate(
      baseTemplateId || '', // Base template ID for creation
      templateName,
      customizationsToSave,
      currentTemplateId || undefined // Current ID for updates
    )
    .subscribe({
      next: (savedTemplate) => {
        // Update template ID and name
        this.currentUserTemplateId.set(savedTemplate.id);
        this.currentTemplateName.set(savedTemplate.name);
        
        // Update state flags
        this.hasStartedBuilding.set(true);
        this.hasSavedChangesFlag.set(true);
        
        // Show success and exit fullscreen
        this.confirmationService.showConfirmation(
          'Your website changes have been saved successfully!',
          'success',
          3000
        );
        
        if (this.isFullscreen()) {
          this.toggleFullscreen();
        }
      },
      error: (error) => {
        console.error('Error saving template:', error);
        this.confirmationService.showConfirmation(
          'Failed to save your website: ' + (error.message || 'Unknown error'),
          'error',
          5000
        );
      }
    });
}

/**
 * 7. MOBILE EDITING RESTRICTIONS
 * 
 * Added restrictions for editing in mobile view:
 */
handleComponentSelection(selected: {
  key: string;
  name: string;
  path?: string;
}): void {
  // Prevent component selection if in mobile view
  if (this.viewMode() === 'view-mobile') {
    this.confirmationService.showConfirmation(
      'Editing is not available in mobile preview mode. Please switch to desktop view to edit.',
      'info',
      3000
    );
    return;
  }
  
  // Continue with normal selection...
}

/**
 * 8. BUSINESS TYPE CONTEXT IMMUTABILITY
 * 
 * Added a computed signal to control when business type can be changed:
 */
// In the class properties
isBusinessTypeReadonly = computed(() => 
  this.currentUserTemplateId() !== null || this.isFullscreen());

// This should be used in the template:
// <app-business-type-selector [isDisabled]="isBusinessTypeReadonly()">

/**
 * 9. HTML TEMPLATE CHANGES NEEDED
 * 
 * The PreviewComponent HTML needs these key changes:
 * 
 * 1. Pass isDisabled to BusinessTypeSelectorComponent:
 *    <app-business-type-selector
 *      [isDisabled]="isBusinessTypeReadonly()"
 *      [currentPlan]="currentPlan()"
 *      [selectedBusinessType]="businessType()"
 *      [compactMode]="true"
 *      (businessTypeSelected)="handleBusinessTypeSelection($event)"
 *    >
 *    </app-business-type-selector>
 * 
 * 2. Disable component selection in mobile view:
 *    <app-standard-structure
 *      [isMobileLayout]="viewMode() === 'view-mobile' || isMobileView()"
 *      [isMobileView]="viewMode()"
 *      [currentPage]="currentPage()"
 *      [selectedFont]="selectedFont()"
 *      [customizations]="customizations"
 *      [currentPlan]="currentPlan()"
 *      [businessType]="businessType()"
 *      [isEditingEnabled]="isEditingAllowed()"
 *      (componentSelected)="handleComponentSelection($event)"
 *    >
 *    </app-standard-structure>
 */

/**
 * 10. SERVICE METHOD ASSUMPTIONS
 * 
 * The refactored code assumes these service methods exist:
 * 
 * - UserTemplateService.getUserTemplateById(templateId: string): Observable<UserTemplate>
 * - UserTemplateService.saveUserTemplate(templateId: string, name: string, config: Customizations, currentUserTemplateId?: string): Observable<UserTemplate>
 * - TemplateService.searchTemplates(templateTypeId?: string, templatePlanId?: string, page?: number, size?: number): Observable<PageResponse<TemplateSearch>>
 * - TemplateService.getTemplatePlanId(planType: 'BASIC' | 'PREMIUM'): Observable<string>
 * - TemplateService.convertPlanType(plan: 'standard' | 'premium'): 'BASIC' | 'PREMIUM'
 * - TemplateService.getTemplateById(templateId: string): Observable<Template> (NOTE: This might need to be implemented)
 * - BusinessConfigService.generateDefaultCustomizations(businessType: string, plan: 'standard' | 'premium'): Customizations
 * - BusinessConfigService.ensureCompleteCustomizationStructure(customizations: Customizations, businessType: string, plan: 'standard' | 'premium'): Customizations
 */ 