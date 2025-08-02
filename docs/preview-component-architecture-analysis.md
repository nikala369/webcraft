# 🏗️ PreviewComponent Architecture Analysis

## **📖 OVERVIEW**

The `PreviewComponent` is the central orchestrator of the Webcraft website building experience. This document provides a comprehensive analysis of its architecture, data flow patterns, and critical implementation details.

## **🎯 COMPONENT RESPONSIBILITIES**

### **Primary Functions**

1. **Template State Management**: Handles template creation, loading, and persistence
2. **Component Coordination**: Orchestrates communication between child components
3. **User Flow Control**: Manages business type selection, template naming, and editing flows
4. **Data Processing**: Handles customization updates and data cleaning
5. **UI State Management**: Controls loading states, fullscreen mode, and button visibility

### **Core Architecture Pattern**

```
PreviewComponent (Central Orchestrator)
├── TemplateInitializationService (Data Loading)
├── StandardStructureComponent (UI Rendering)
├── ComponentCustomizerComponent (Editing Interface)
├── UserTemplateService (Persistence)
└── ViewManagementService (UI State)
```

## **🔄 DATA FLOW ARCHITECTURE**

### **1. Initialization Flow**

```typescript
// Route → Template Initialization → Component State
ngOnInit() → initializeFromRoute() → applyInitialData() → Component Signals
```

#### **Critical Pattern: Signal-Based State Management**

```typescript
// Core state signals
currentUserTemplateId = signal<string | null>(null);
currentTemplateName = signal<string | null>(null);
customizations = signal<Customizations | null>(null);
businessType = signal<string>("");
hasStartedBuilding = signal<boolean>(false);
showLoadingOverlay = signal<boolean>(false);

// Computed properties for derived state
isAuthenticated = computed(() => this.authService.isAuthenticated());
hasSavedChanges = computed(() => !!this.currentUserTemplateId());
shouldShowPublishButton = computed(() => !!this.currentUserTemplateId() && !this.isTemplatePublished());
```

#### **Data Cleaning Pipeline**

```typescript
private applyInitialData(initialData: InitialTemplateData): void {
  // CRITICAL: Clean malformed data before applying to signals
  let cleanedCustomizations = initialData.customizations;
  if (cleanedCustomizations) {
    cleanedCustomizations = this.imageService.cleanMalformedObjectIds(cleanedCustomizations);
  }

  // Apply to reactive signals
  this.customizations.set(cleanedCustomizations);
  this.businessType.set(initialData.businessType);
  this.currentPlan.set(initialData.plan);
}
```

### **2. Template Creation Flow**

```typescript
// User Action → State Validation → Template Creation → Success Handling
startBuilding() → handleTemplateNameConfirmed() → createTemplate() → enterEditMode()
```

#### **Critical Pattern: State Isolation for Different Flows**

```typescript
startBuilding(): void {
  // Authentication check first
  if (!this.isAuthenticated()) {
    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
    return;
  }

  // Distinguish between new template creation and existing template editing
  const hasActualSavedTemplate = this.currentUserTemplateId() && !this.isInTemplateCreationFlow();

  if (!hasActualSavedTemplate) {
    // New template creation flow
    this.isInTemplateCreationFlow.set(true);
    this.showTemplateNameInput.set(true);
    this.hasStartedBuilding.set(true);
    this.currentStep.set(3);

    // Clear conflicting URL parameters
    this.updateUrlParams({ templateId: null, mode: null });
    return;
  }

  // Existing template editing flow
  this.enterEditMode();
}
```

#### **Error Handling Pattern**

```typescript
private createTemplate(templateName: string): void {
  const customizations = this.customizations();
  const baseTemplateId = this.selectedBaseTemplateId() || this.availableThemes()[0]?.id;

  // Comprehensive validation before API call
  if (!customizations || !baseTemplateId) {
    this.confirmationService.showConfirmation(
      'Unable to create template. Please try again.',
      'error',
      3000
    );
    // CRITICAL: Always clear loading state on error
    this.showLoadingOverlay.set(false);
    this.loadingOverlayClass.set('');
    return;
  }

  // Template creation with robust error handling
  this.userTemplateService.createUserTemplate(baseTemplateId, templateName, structuredClone(customizations))
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (createdTemplate) => {
        this.currentUserTemplateId.set(createdTemplate.id);
        this.isFirstTimeCreation.set(true);
        this.isInTemplateCreationFlow.set(false);

        // Update URL and enter edit mode
        this.updateUrlParams({ templateId: createdTemplate.id, mode: 'edit' });
        setTimeout(() => this.enterEditMode(), 500);
      },
      error: (error) => {
        console.error('Error creating template:', error);
        // CRITICAL: Clear loading state and allow retry
        this.showLoadingOverlay.set(false);
        this.loadingOverlayClass.set('');
        this.showTemplateNameInput.set(true);
      }
    });
}
```

### **3. Component Update Flow**

```typescript
// Child Component → PreviewComponent → Signal Update → Reactive UI
ComponentCustomizer → handleComponentUpdate() → customizations.update() → Template Re-render
```

#### **Critical Pattern: Path-Based vs Direct Updates**

```typescript
handleComponentUpdate(update: any): void {
  const selected = this.selectedComponent();
  if (!selected) return;

  this.customizations.update((current) => {
    if (!current) return current;
    const updated = structuredClone(current);

    if (selected.path) {
      // Handle nested component updates (e.g., pages.home.about)
      const pathParts = selected.path.split('.');
      let target: any = updated;
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!target[part]) target[part] = {};
        target = target[part];
      }
      const lastPart = pathParts[pathParts.length - 1];
      target[lastPart] = { ...target[lastPart], ...update };
    } else {
      // Handle top-level component updates (header, footer)
      updated[selected.key] = { ...updated[selected.key], ...update };
    }

    return updated;
  });
}
```

### **4. Save Operation Flow**

```typescript
// User Save → Data Validation → API Call → State Management → UI Update
saveAllChanges() → UserTemplateService → Success Handler → Loading Cleanup → Fullscreen Exit
```

#### **Critical Pattern: Immediate State Clearing**

```typescript
saveAllChanges(): void {
  const customizations = this.customizations();
  const templateId = this.currentUserTemplateId();
  const templateName = this.currentTemplateName();

  this.userTemplateService.updateUserTemplate(templateId, templateName, structuredClone(customizations))
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        this.isFirstTimeCreation.set(false);
        this.confirmationService.showConfirmation('Changes saved successfully!', 'success', 3000);

        // CRITICAL: Immediately clear loading overlay to show correct buttons
        // The button condition is `hasStartedBuilding() && !showLoadingOverlay()`
        // hideLoading() uses fadeOut animation, keeping showLoadingOverlay=true during fade
        // This caused "Start Crafting" to show instead of "Continue Editing"/"View Mode"
        this.showLoadingOverlay.set(false);
        this.loadingOverlayClass.set('');

        // Handle UI transitions with delay to ensure state stability
        setTimeout(() => {
          if (this.viewManagementService.isFullscreen()) {
            this.toggleFullscreen();
          }
        }, 100);
      },
      error: (error) => {
        console.error('Error saving template:', error);
        // CRITICAL: Also clear loading state on error
        this.showLoadingOverlay.set(false);
        this.loadingOverlayClass.set('');
      }
    });
}
```

## **🧩 COMPONENT INTEGRATION PATTERNS**

### **1. Child Component Communication**

#### **Component Selection Pattern**

```typescript
// StandardStructureComponent → PreviewComponent
handleComponentSelection(component: { key: string; name: string; path?: string }): void {
  const currentComponent = this.selectedComponent();
  if (currentComponent && currentComponent.key === component.key) {
    // Toggle off if same component clicked
    this.selectedComponent.set(null);
  } else {
    // Select new component
    this.selectedComponent.set(component);
  }
}
```

#### **Computed Customization Data Pattern**

```typescript
// Reactive data flow to child components
selectedCustomization = computed(() => {
  const selected = this.selectedComponent();
  const customizations = this.customizations();

  if (!selected || !customizations) return null;

  try {
    if (selected.path) {
      // Handle path-based selection (e.g., "pages.home.hero1")
      const pathParts = selected.path.split(".");
      let current: any = customizations;
      for (const part of pathParts) {
        if (!current[part]) return { ...selected, data: {} };
        current = current[part];
      }
      return { ...selected, data: current };
    }

    // Handle direct key access (e.g., "header", "footer")
    return {
      ...selected,
      data: customizations[selected.key as keyof Customizations],
    };
  } catch (error) {
    console.error("Error accessing customization data:", error);
    return null;
  }
});
```

### **2. Service Integration Patterns**

#### **ViewManagementService Integration**

```typescript
// Fullscreen state management with position restoration
toggleFullscreen(): void {
  const isCurrentlyFullscreen = this.viewManagementService.isFullscreen();

  if (isCurrentlyFullscreen) {
    // Capture scroll position before exiting
    this.viewManagementService.setDesiredRestoreScrollPosition(window.scrollY);
    this.selectedComponent.set(null); // Close sidebar
    this.resetPreviewContentPosition(); // Reset preview scroll
    this.viewManagementService.setFullscreen(false);
  } else {
    // Store position when entering
    this.viewManagementService.setDesiredRestoreScrollPosition(window.scrollY);
    this.viewManagementService.setFullscreen(true);
  }
}
```

#### **TemplateInitializationService Integration**

```typescript
// Route-based template initialization with error handling
private initializeFromRoute(): void {
  this.showLoadingOverlay.set(true);
  this.loadingOverlayClass.set('active');

  this.templateInitializationService.initializeFromRouteParameters()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (initialData: InitialTemplateData) => {
        this.applyInitialData(initialData);
        this.determineInitialFlow(initialData);
      },
      error: (err) => {
        console.error('Initialization error:', err);
        this.handleInitializationError(err);
      }
    });
}
```

## **⚡ PERFORMANCE OPTIMIZATION PATTERNS**

### **1. Memory Management**

#### **Subscription Cleanup**

```typescript
private destroy$ = new Subject<void>();

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}

// All subscriptions use takeUntil pattern
this.service.getData().pipe(takeUntil(this.destroy$)).subscribe(/*...*/);
```

#### **Deep Cloning for Immutability**

```typescript
// Prevent unintended mutations in shared data
this.userTemplateService.updateUserTemplate(
  templateId,
  templateName,
  structuredClone(customizations) // Deep clone prevents mutations
);
```

### **2. Change Detection Optimization**

#### **Computed Signals for Derived State**

```typescript
// Instead of functions, use computed signals for template bindings
isFullscreen(): boolean {
  return this.viewManagementService.isFullscreen(); // Function call
}

// Better: Computed signal (if service provides reactive state)
isFullscreen = computed(() => this.viewManagementService.isFullscreenSignal());
```

#### **OnPush Strategy Compatibility**

```typescript
// Effects to handle complex reactivity
constructor() {
  effect(() => {
    const currentFullscreenState = this.viewManagementService.isFullscreen();
    // Handle fullscreen state changes
    if (previousState !== currentFullscreenState) {
      this.resetPreviewContentPosition();
    }
  });
}
```

## **🔒 SECURITY & ERROR HANDLING PATTERNS**

### **1. Authentication Guards**

```typescript
// Consistent authentication checking across flows
private checkAuthenticationForAction(action: string): boolean {
  if (!this.isAuthenticated()) {
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: this.router.url }
    });
    return false;
  }
  return true;
}
```

### **2. Graceful Error Handling**

```typescript
// Comprehensive error handling with user feedback
private handleInitializationError(error: any): void {
  if (error.authRedirect) {
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl: this.router.url }
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
```

## **🎯 BUTTON STATE MANAGEMENT PATTERNS**

### **Template-Driven Button Visibility**

```html
<!-- Start Crafting Button (before building starts) -->
<button *ngIf="!hasStartedBuilding()" (click)="startBuilding()">Start Crafting</button>

<!-- Continue Editing / View Mode Buttons (after building starts) -->
<ng-container *ngIf="hasStartedBuilding() && !showLoadingOverlay()">
  <button (click)="editBuilding()">{{ currentUserTemplateId() ? "Continue Editing" : "Start Crafting" }}</button>

  <button *ngIf="currentUserTemplateId()" (click)="openViewOnly()">View Mode</button>
</ng-container>
```

### **Loading State Independence**

```typescript
// Critical pattern: Button state must be independent of animation timing
const shouldShowEditingButtons = computed(() => {
  return this.hasStartedBuilding() && !this.showLoadingOverlay() && this.businessType() !== "";
});
```

## **📊 STATE FLOW DIAGRAM**

```
┌─────────────────┐
│   Route Load    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Template Init   │
│ Service Call    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│ Apply Initial   │────▶│ Component Signals│
│ Data + Clean    │     │ Updated          │
└────────┬────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐
│ Determine Flow  │
│ (Edit/View/New) │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌─────────┐
│Edit Mode│ │View Mode│
└─────────┘ └─────────┘
```

## **🔧 CRITICAL DEBUGGING CHECKLIST**

When debugging PreviewComponent issues:

### **Template Creation Issues**

- [ ] Check if `businessType()` is set
- [ ] Verify `availableThemes()` has data
- [ ] Ensure `customizations()` exists
- [ ] Check `selectedBaseTemplateId()` is valid
- [ ] Verify authentication state

### **Button State Issues**

- [ ] Check `hasStartedBuilding()` value
- [ ] Verify `showLoadingOverlay()` state
- [ ] Ensure `currentUserTemplateId()` is correct
- [ ] Check loading state clearing in all code paths

### **Component Update Issues**

- [ ] Verify component selection path vs key distinction
- [ ] Check if `selectedComponent()` is set correctly
- [ ] Ensure `customizations.update()` is called
- [ ] Verify child components receive updated data

### **Save Operation Issues**

- [ ] Check template ID and name existence
- [ ] Verify customizations data structure
- [ ] Ensure loading states are cleared immediately
- [ ] Check error handling clears loading states

## **📚 MAINTENANCE GUIDELINES**

### **When Adding New Features**

1. Follow signal-based state management patterns
2. Use `takeUntil(this.destroy$)` for all subscriptions
3. Implement comprehensive error handling
4. Clear loading states in all code paths
5. Add appropriate debugging logs for complex flows

### **When Debugging Issues**

1. Use the architectural troubleshooting guide first
2. Add temporary debugging logs to trace data flow
3. Verify signal reactivity chains
4. Check service integration patterns
5. Test both success and error scenarios

### **Performance Considerations**

1. Use computed signals for derived state
2. Implement proper change detection strategies
3. Minimize unnecessary re-renders
4. Use deep cloning judiciously
5. Clean up resources in ngOnDestroy

---

This document serves as the definitive architectural reference for the PreviewComponent. All patterns documented here have been battle-tested and should be followed when making modifications or additions to this critical component.
