# 🔧 Webcraft Architectural Troubleshooting Guide

## **📖 OVERVIEW**

This guide provides step-by-step troubleshooting procedures for the most common architectural issues in the Webcraft application, based on real-world debugging experiences.

## **🚨 CRITICAL ISSUE CATEGORIES**

### **1. Component Styles Not Updating After Data Changes**

#### **Symptoms**

- Data shows correctly in console logs
- Component receives updated `@Input` data
- Template doesn't reflect style changes
- Styles work on initial load but break after save/reload

#### **Root Cause**

Angular `OnPush` change detection doesn't detect changes inside function calls, even when function return values change.

#### **Diagnostic Steps**

1. **Check Change Detection Strategy**

   ```typescript
   // Look for this in component decorator
   @Component({
     changeDetection: ChangeDetectionStrategy.OnPush // ← This is the clue
   })
   ```

2. **Identify Function-Based Style Bindings**

   ```html
   <!-- ❌ PROBLEMATIC: Function binding with OnPush -->
   <div [ngStyle]="getHeaderStyles()"></div>
   ```

3. **Check Console for Data Updates**
   ```typescript
   // If this logs but template doesn't update, it's OnPush + function issue
   console.log("Style data:", this.customizations?.backgroundColor);
   ```

#### **Solution Pattern**

**Step 1: Convert Input to Signal**

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YourComponent implements OnChanges {
  @Input() customizations: any = {};

  // Add reactive signal for input
  private customizationsSignal = signal<any>({});

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["customizations"]) {
      this.customizationsSignal.set(changes["customizations"].currentValue || {});
    }
  }
}
```

**Step 2: Convert Function to Computed Signal**

```typescript
// ❌ REMOVE: Function-based approach
// getHeaderStyles(): any {
//   return { backgroundColor: this.customizations?.backgroundColor };
// }

// ✅ ADD: Computed signal approach
headerStyles = computed(() => {
  const customizations = this.customizationsSignal();
  return {
    backgroundColor: customizations?.backgroundColor || "#default",
    textColor: customizations?.textColor || "#default",
  };
});
```

**Step 3: Force Change Detection with Effect**

```typescript
constructor(private cdr: ChangeDetectorRef) {
  effect(() => {
    this.headerStyles(); // Subscribe to changes
    this.cdr.markForCheck(); // Force change detection
  });
}
```

**Step 4: Update Template Binding**

```html
<!-- ✅ CORRECT: Signal binding -->
<div [ngStyle]="headerStyles()"></div>
```

---

### **2. Images Showing Default Placeholder Initially**

#### **Symptoms**

- Images show default placeholder on component load
- Correct image appears after scroll or user interaction
- Image data is correct in component but not displayed

#### **Root Cause**

Component image URL computation not reactive to ImageService cache updates.

#### **Diagnostic Steps**

1. **Check Image URL Computation**

   ```typescript
   // ❌ PROBLEMATIC: Non-reactive function
   getImageUrl(imageValue: any): string {
     return this.imageService.getImageUrl(imageValue);
   }
   ```

2. **Check Template Binding**

   ```html
   <!-- ❌ PROBLEMATIC: Function-based binding -->
   <img [src]="getImageUrl(logoUrl)" alt="Logo" />
   ```

3. **Verify Image Type Context**
   ```typescript
   // Check if imageType context is missing
   this.imageService.getImageUrl(logoUrl); // Missing context!
   ```

#### **Solution Pattern**

**Step 1: Create Reactive Image URL Computation**

```typescript
// ✅ CORRECT: Reactive image URL with service subscription
logoUrl = computed(() => {
  const customizations = this.customizationsSignal();
  const logoValue = customizations?.logoUrl;

  if (!logoValue) {
    return this.imageService.getAppropriateImagePlaceholder("logo");
  }

  // Subscribe to image service updates for reactivity
  this.imageService.getImageUpdateSignal()();

  return this.imageService.getImageUrl(logoValue, "logo");
});
```

**Step 2: Update Template to Use ReactiveImageComponent**

```html
<!-- ✅ CORRECT: Reactive image component with context -->
<app-reactive-image [src]="logoUrl()" [imageType]="'logo'" [alt]="'Logo'"> </app-reactive-image>
```

**Step 3: Ensure ImageService Provides Update Signal**

```typescript
// In ImageService
private imageUpdateSubject = new BehaviorSubject<number>(0);

getImageUpdateSignal(): Signal<number> {
  return toSignal(this.imageUpdateSubject.asObservable(), { initialValue: 0 });
}

// Call this when images are processed/cached
private notifyImageUpdate(): void {
  this.imageUpdateSubject.next(Date.now());
}
```

---

### **3. Buttons Showing Wrong State After Save Operations**

#### **Symptoms**

- "Continue Editing" button disappears after save
- "Start Crafting" button shows instead of expected buttons
- Button state depends on loading overlay timing

#### **Root Cause**

Button visibility conditions depend on loading overlay flags that remain `true` during fade animations.

#### **Diagnostic Steps**

1. **Check Button Conditions**

   ```html
   <!-- Look for conditions like this -->
   <button *ngIf="hasStartedBuilding() && !showLoadingOverlay()">Continue Editing</button>
   ```

2. **Check Loading Management**

   ```typescript
   // ❌ PROBLEMATIC: Animation-dependent clearing
   saveAllChanges(): void {
     this.service.save().subscribe(() => {
       this.hideLoading(); // Uses animation, keeps flag true
     });
   }
   ```

3. **Debug Loading States**
   ```typescript
   // Add debugging to save operations
   console.log("Save complete:", {
     hasStartedBuilding: this.hasStartedBuilding(),
     showLoadingOverlay: this.showLoadingOverlay(),
     currentUserTemplateId: this.currentUserTemplateId(),
   });
   ```

#### **Solution Pattern**

**Step 1: Immediate State Clearing**

```typescript
saveAllChanges(): void {
  this.userTemplateService.updateTemplate(data).subscribe({
    next: () => {
      this.confirmationService.showConfirmation('Changes saved!', 'success', 3000);

      // CRITICAL: Immediately clear loading overlay
      this.showLoadingOverlay.set(false);
      this.loadingOverlayClass.set('');

      // Handle other UI transitions with delay
      setTimeout(() => {
        if (this.viewManagementService.isFullscreen()) {
          this.toggleFullscreen();
        }
      }, 100);
    },
    error: () => {
      // CRITICAL: Also clear on error
      this.showLoadingOverlay.set(false);
      this.loadingOverlayClass.set('');
    }
  });
}
```

**Step 2: Verify Button Logic Independence**

```typescript
// Ensure button conditions don't depend on animation timing
const shouldShowContinueButton = computed(() => {
  return this.hasStartedBuilding() && !this.showLoadingOverlay() && !!this.currentUserTemplateId();
});
```

---

### **4. Data Loss During ImageService Processing**

#### **Symptoms**

- Color values become `undefined` after save/load
- Background type settings reset to defaults
- Console shows "Cleaning malformed objectId" for valid data

#### **Root Cause**

`ImageService.cleanMalformedObjectIds()` incorrectly identifies color hex codes and background types as malformed ObjectIds.

#### **Diagnostic Steps**

1. **Check Console for Cleaning Warnings**

   ```
   ImageService: Cleaning malformed objectId for backgroundColor: #28364d
   ImageService: Cleaning malformed objectId for headerBackgroundType: solid
   ```

2. **Verify Data Before/After Cleaning**

   ```typescript
   console.log("Before cleaning:", originalData);
   const cleaned = this.imageService.cleanMalformedObjectIds(originalData);
   console.log("After cleaning:", cleaned);
   ```

3. **Check ImageService Exclusion Logic**
   ```typescript
   // Look for missing exclusions in cleanMalformedObjectIds
   const isColorField = key.toLowerCase().includes("color");
   const isBackgroundTypeField = key.toLowerCase().includes("type");
   ```

#### **Solution Pattern**

**Step 1: Enhance Exclusion Logic**

```typescript
cleanMalformedObjectIds(data: any): any {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => this.cleanMalformedObjectIds(item));
  }

  const cleaned = { ...data };

  for (const [key, value] of Object.entries(cleaned)) {
    if (typeof value === 'string') {
      // CRITICAL: Exclude valid data types
      const isColorField = key.toLowerCase().includes('color') ||
                          key.toLowerCase().includes('colour') ||
                          this.isValidColor(value);

      const isBackgroundTypeField = key.toLowerCase().includes('type') ||
                                   key.toLowerCase().includes('style') ||
                                   ['solid', 'gradient', 'none', 'sunset', 'ocean', 'forest', 'royal', 'fire', 'midnight', 'custom'].includes(value);

      const isAnimationField = ['fade', 'slide', 'typewriter', 'parallax', 'zoom', 'ken-burns', 'gradient-shift'].includes(value);

      if (!isColorField && !isBackgroundTypeField && !isAnimationField && this.looksLikeMalformedObjectId(value)) {
        delete cleaned[key];
      }
    } else if (value && typeof value === 'object') {
      cleaned[key] = this.cleanMalformedObjectIds(value);
    }
  }

  return cleaned;
}
```

**Step 2: Add Color Validation Helper**

```typescript
private isValidColor(value: string): boolean {
  // Check hex colors
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
    return true;
  }

  // Check CSS color names
  const cssColors = ['red', 'blue', 'green', 'black', 'white', 'transparent'];
  return cssColors.includes(value.toLowerCase());
}
```

---

### **5. Template Creation Flow Failures**

#### **Symptoms**

- "Unable to create template. Please try again" error
- Different flows work/fail inconsistently
- Template creation works from dashboard but not from home page

#### **Root Cause**

Inconsistent state management between different template creation flows.

#### **Diagnostic Steps**

1. **Add Flow Debugging**

   ```typescript
   // Add comprehensive logging to creation flows
   console.log("[CREATE DEBUG] Template creation attempt:", {
     businessType: this.businessType(),
     hasCustomizations: !!this.customizations(),
     availableThemes: this.availableThemes().length,
     baseTemplateId: this.selectedBaseTemplateId(),
   });
   ```

2. **Check Route Parameter Handling**

   ```typescript
   // Verify route parameter parsing
   console.log("[Route DEBUG] Parsed parameters:", {
     templateId,
     businessType,
     plan,
     mode,
   });
   ```

3. **Verify Template Data Initialization**
   ```typescript
   // Check if initial data is properly loaded
   console.log("[TemplateInit DEBUG] Loaded themes:", themes.length);
   console.log("[TemplateInit DEBUG] Generated customizations:", !!customizations);
   ```

#### **Solution Pattern**

**Step 1: Consistent State Validation**

```typescript
private createTemplate(templateName: string): void {
  const customizations = this.customizations();
  const baseTemplateId = this.selectedBaseTemplateId() || this.availableThemes()[0]?.id;

  // Comprehensive validation
  if (!customizations || !baseTemplateId) {
    console.error('Missing required data:', {
      hasCustomizations: !!customizations,
      hasBaseTemplateId: !!baseTemplateId,
      availableThemesLength: this.availableThemes().length
    });

    this.confirmationService.showConfirmation(
      'Unable to create template. Please try again.',
      'error',
      3000
    );
    this.showLoadingOverlay.set(false);
    this.loadingOverlayClass.set('');
    return;
  }

  // Proceed with creation...
}
```

**Step 2: Robust Error Handling**

```typescript
this.userTemplateService
  .createUserTemplate(baseTemplateId, templateName, customizations)
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (template) => {
      // Success handling
      this.currentUserTemplateId.set(template.id);
      this.isInTemplateCreationFlow.set(false);
    },
    error: (error) => {
      console.error("Template creation failed:", {
        error: error.message,
        status: error.status,
        businessType: this.businessType(),
        hasCustomizations: !!this.customizations(),
      });

      // Always clear loading state
      this.showLoadingOverlay.set(false);
      this.loadingOverlayClass.set("");
    },
  });
```

---

### **6. Component Path vs Key Selection Issues**

#### **Symptoms**

- Header/Footer customizations not applying correctly
- Component selection creates wrong data paths
- Updates apply to wrong parts of customizations object

#### **Root Cause**

Incorrect path assignment for top-level vs nested components.

#### **Diagnostic Steps**

1. **Check Component Selection Logic**

   ```typescript
   // Look for path assignment in component selection
   handleComponentSelection(componentKey: string): void {
     const selectedData = {
       key: componentKey,
       name: componentKey,
       path: componentKey // ← This might be wrong for top-level components
     };
   }
   ```

2. **Debug Component Update Paths**
   ```typescript
   // Add logging to component updates
   console.log("Component update:", {
     key: selected.key,
     path: selected.path,
     updateData: update,
   });
   ```

#### **Solution Pattern**

**Step 1: Distinguish Component Types**

```typescript
handleComponentSelection(componentKey: string): void {
  // CRITICAL: Top-level components don't need paths
  const isTopLevelComponent = ['header', 'footer', 'fontConfig'].includes(componentKey);

  const selectedData = {
    key: componentKey,
    name: componentKey.charAt(0).toUpperCase() + componentKey.slice(1),
    // Only set path for nested components
    ...(isTopLevelComponent ? {} : { path: `pages.home.${componentKey}` })
  };

  this.componentSelected.emit(selectedData);
}
```

**Step 2: Handle Updates Based on Component Type**

```typescript
handleComponentUpdate(update: any): void {
  const selected = this.selectedComponent();
  if (!selected) return;

  this.customizations.update((current) => {
    if (!current) return current;
    const updated = structuredClone(current);

    if (selected.path) {
      // Handle nested components (e.g., pages.home.about)
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
      // Handle top-level components (header, footer)
      updated[selected.key] = { ...updated[selected.key], ...update };
    }

    return updated;
  });
}
```

---

## **🔍 GENERAL DEBUGGING WORKFLOW**

### **Step 1: Identify Symptom Category**

- **Visual Issues**: Styles not updating → Change Detection
- **Image Issues**: Placeholder showing → Reactive Images
- **Button Issues**: Wrong state → Loading Management
- **Data Issues**: Values missing → ImageService Cleaning
- **Flow Issues**: Creation failing → State Management
- **Selection Issues**: Wrong updates → Path Management

### **Step 2: Apply Diagnostic Steps**

Follow the specific diagnostic steps for the identified category.

### **Step 3: Implement Solution Pattern**

Apply the corresponding solution pattern exactly as documented.

### **Step 4: Verify Fix**

1. Test the specific failing scenario
2. Test related scenarios to ensure no regressions
3. Check console for any new errors or warnings

### **Step 5: Update Documentation**

If you discover new patterns or edge cases, update this guide.

---

## **📚 QUICK REFERENCE CHECKLIST**

When implementing new components or debugging issues:

### **Angular OnPush Components**

- [ ] Convert `@Input` to internal signal via `ngOnChanges`
- [ ] Convert getter functions to computed signals
- [ ] Add effect with `cdr.markForCheck()` for change detection
- [ ] Update template to bind to signals, not functions

### **Image Loading Components**

- [ ] Create reactive image URL computation with service subscription
- [ ] Use `ReactiveImageComponent` with appropriate `imageType`
- [ ] Ensure ImageService provides update signals
- [ ] Handle placeholder logic for different contexts

### **Loading State Management**

- [ ] Clear loading states immediately after operations
- [ ] Clear loading states in both success AND error handlers
- [ ] Don't depend on animation timing for business logic
- [ ] Use setTimeout for non-critical UI transitions

### **Data Processing**

- [ ] Exclude color fields from ImageService cleaning
- [ ] Exclude background type fields from cleaning
- [ ] Preserve array structure during processing
- [ ] Validate data types before processing

### **Component Selection**

- [ ] Distinguish between top-level and nested components
- [ ] Only assign paths to nested components
- [ ] Handle updates based on component type
- [ ] Test both header/footer and section components

---

This guide should be your first reference when encountering any of these common architectural issues. The patterns documented here are battle-tested and resolve the most frequent problems in the Webcraft application.
