# Auto Website Builder Refactoring Summary

This document summarizes the comprehensive refactoring of the Auto Website Builder components to implement an authenticated-users-only workflow, eliminate session storage, and enforce UI/UX constraints.

## 🔑 Key Changes Overview

1. **Authentication-Only Flow**: Implemented a strict authentication check in PreviewComponent's `ngOnInit`, redirecting to login automatically.
2. **Removed sessionStorage**: Eliminated all sessionStorage usage in favor of API calls for data persistence.
3. **Mobile Editing Restrictions**: Added `isEditingAllowed` signal and UI changes to disable editing in mobile view.
4. **Context Immutability**: Added `isBusinessTypeReadonly` signal to prevent business type changes in fullscreen or editing mode.
5. **Enhanced State Management**: Converted properties to signals for better reactivity and state tracking.
6. **API-Based Data Flow**: Implemented exclusive reliance on API calls for template operations.
7. **Improved Error Handling**: Added comprehensive error handling for API operations.

## 🧩 Component Changes

### BusinessTypeSelectorComponent

1. **Added `isDisabled` Input**:

   ```typescript
   @Input() isDisabled: boolean = false;
   ```

2. **Removed SelectionStateService Dependency**:

   - Removed the injection, methods, and related code.
   - Eliminated selection state persistence in non-authenticated mode.

3. **Enhanced Selection Handling**:

   ```typescript
   selectBusinessType(type: string): void {
     if (this.isDisabled) return;

     this.selectedBusinessType = type;
     this.businessTypeSelected.emit(type);
     this.dropdownOpen = false;
   }
   ```

4. **Conditional UI Elements**:

   ```html
   <div class="business-types-dropdown" *ngIf="dropdownOpen && !isDisabled"></div>
   ```

5. **Added Disabled Styling**:
   ```scss
   .business-type-selector.disabled {
     opacity: 0.7;
     pointer-events: none;
   }
   ```

### PreviewComponent

1. **Core Property Changes**:

   - Added signals:
     ```typescript
     customizations = signal<Customizations | null>(null);
     selectedBaseTemplateId = signal<string | null>(null);
     currentUserTemplateId = signal<string | null>(null);
     currentTemplateName = signal<string>("My Website");
     businessTypeDisplayName = signal<string>("");
     ```
   - Removed properties:
     ```typescript
     // Removed: currentScreenSize, ScreenSize enum
     ```
   - Added computed properties:
     ```typescript
     isEditingAllowed = computed(() => this.viewMode() === "view-desktop");
     isBusinessTypeReadonly = computed(() => this.currentUserTemplateId() !== null || this.isFullscreen());
     ```

2. **Authentication Enforcement**:

   ```typescript
   if (!this.authService.isAuthenticated()) {
     console.log("User is not authenticated - redirecting to login");
     this.router.navigate(["/auth/login"], {
       queryParams: { returnUrl: this.router.url },
     });
     return;
   }
   ```

3. **Route Parameter Handling**:

   ```typescript
   private parseRouteParameters(): void {
     this.route.queryParams.subscribe(params => {
       // Determine operation mode (edit existing, create new, or show selector)
       const templateId = params['templateId'];
       const newTemplate = params['newTemplate'] === 'true';
       // Initialize based on mode...
     });
   }
   ```

4. **API-Based Template Operations**:

   - Loading:
     ```typescript
     this.userTemplateService.getUserTemplateById(templateId).subscribe({...});
     ```
   - Saving:
     ```typescript
     this.userTemplateService.saveUserTemplate(
       baseTemplateId || '',
       templateName,
       customizationsToSave,
       currentTemplateId || undefined
     ).subscribe({...});
     ```
   - Resetting:
     ```typescript
     // For existing templates - reload from API
     this.userTemplateService.getUserTemplateById(this.currentUserTemplateId()!).subscribe({...});
     // For new templates - regenerate defaults
     this.initializeDefaultCustomizations();
     ```

5. **Mobile Editing Restrictions**:
   ```typescript
   handleComponentSelection(selected: {...}): void {
     // Prevent component selection if in mobile view
     if (this.viewMode() === 'view-mobile') {
       this.confirmationService.showConfirmation(
         'Editing is not available in mobile preview mode...',
         'info',
         3000
       );
       return;
     }
     // Continue with normal selection...
   }
   ```

## 🖼️ Required HTML Changes

### BusinessTypeSelectorComponent.html

1. **Added disabled class handling**:

   ```html
   <div class="business-type-selector" [class.disabled]="isDisabled"></div>
   ```

2. **Disabled dropdown in compact mode**:
   ```html
   <div class="business-types-dropdown" *ngIf="dropdownOpen && !isDisabled"></div>
   ```

### PreviewComponent.html

1. **Pass isDisabled to BusinessTypeSelectorComponent**:

   ```html
   <app-business-type-selector [isDisabled]="isBusinessTypeReadonly()" ...></app-business-type-selector>
   ```

2. **Add isEditingEnabled to Structure Components**:

   ```html
   <app-standard-structure [isEditingEnabled]="isEditingAllowed()" ...></app-standard-structure>
   ```

3. **Mobile Editing Warning Banner**:
   ```html
   <div class="mobile-edit-warning" *ngIf="viewMode() === 'view-mobile' && !isViewOnlyStateService.isOnlyViewMode()">
     <div class="warning-content">
       <app-icon name="info" width="18" height="18"></app-icon>
       <span>Editing is not available in mobile preview. Switch to desktop view to edit.</span>
     </div>
     <button class="btn btn--primary btn--small" (click)="toggleView('view-desktop')">
       <app-icon name="desktop" width="16" height="16"></app-icon>
       Switch to Desktop
     </button>
   </div>
   ```

## 🧠 Architectural Implications

1. **API Service Method Assumptions**:

   - `UserTemplateService.getUserTemplateById()`
   - `UserTemplateService.saveUserTemplate()`
   - `TemplateService.searchTemplates()`
   - `TemplateService.getTemplatePlanId()`
   - `TemplateService.convertPlanType()`
   - `TemplateService.getTemplateById()` (may need implementation)
   - `BusinessConfigService.generateDefaultCustomizations()`
   - `BusinessConfigService.ensureCompleteCustomizationStructure()`

2. **Authentication Flow**:

   - Authentication now a hard requirement for entering the PreviewComponent.
   - Login/auth guard redirects protect all template operations.

3. **Editing and Permission Model**:
   - Editing is restricted in mobile view mode.
   - Business type changes are restricted for existing templates and in fullscreen mode.
   - Theme selections and appearance settings have proper permission controls.

## 🛠️ Implementation Notes

1. The `getTemplateById` method may need to be implemented in the `TemplateService` if it doesn't exist.
2. Structure components (StandardStructureComponent and PremiumStructureComponent) need their interfaces updated to include the `isEditingEnabled` property.
3. The new CSS styles for mobile warning banners and template info should be added to the appropriate SCSS files.

This refactoring ensures a robust, authenticated-only workflow that relies exclusively on API calls for data persistence, along with enforcing appropriate UI and editing constraints.
