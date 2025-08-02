# Component Data Flow Documentation

## Overview

This document describes the data flow patterns used throughout the Webcraft application, with special focus on the component customization system and **recent critical architectural patterns**.

## **🚨 CRITICAL ARCHITECTURAL PATTERNS (RECENTLY DISCOVERED)**

### **1. Angular Change Detection with OnPush Strategy**

**Problem**: Components using `ChangeDetectionStrategy.OnPush` don't detect changes inside function calls, even if the function's computed values changed.

**Symptoms**:

- Data updates in console but UI doesn't reflect changes
- Computed styles work initially but break after save/reload
- Functions return correct values but templates don't re-render

**Solution Pattern**: Convert getter functions to computed signals

```typescript
// ❌ PROBLEMATIC: Function approach with OnPush
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StructureHeaderComponent {
  @Input() customizations: any = {};

  getHeaderStyles(): any {
    return {
      backgroundColor: this.customizations?.backgroundColor || '#default'
    };
  }
}

// ❌ Template doesn't update after customizations change
<div [ngStyle]="getHeaderStyles()"></div>
```

```typescript
// ✅ CORRECT: Computed signal approach
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StructureHeaderComponent implements OnChanges {
  @Input() customizations: any = {};

  // Make input reactive via signal
  private customizationsSignal = signal<any>({});

  // Convert function to computed signal
  headerStyles = computed(() => {
    const customizations = this.customizationsSignal();
    return {
      backgroundColor: customizations?.backgroundColor || '#default'
    };
  });

  constructor(private cdr: ChangeDetectorRef) {
    // Force change detection when computed values change
    effect(() => {
      this.headerStyles(); // Subscribe to changes
      this.cdr.markForCheck(); // Force detection
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customizations']) {
      this.customizationsSignal.set(changes['customizations'].currentValue || {});
    }
  }
}

// ✅ Template updates reactively
<div [ngStyle]="headerStyles()"></div>
```

### **2. Reactive Image Loading Pattern**

**Problem**: Images show default placeholder initially, then correct image after scroll/interaction.

**Root Cause**: Component image URL computation not reactive to ImageService cache updates.

**Solution Pattern**: Make image URLs reactive to service updates

```typescript
// ❌ PROBLEMATIC: Non-reactive image computation
export class StructureHeaderComponent {
  getImageUrl(imageValue: any): string {
    return this.imageService.getImageUrl(imageValue, 'logo');
  }
}

// ❌ Template shows stale image URLs
<img [src]="getImageUrl(logoUrl)" alt="Logo">
```

```typescript
// ✅ CORRECT: Reactive image computation
export class StructureHeaderComponent {
  private customizationsSignal = signal<any>({});

  logoUrl = computed(() => {
    const customizations = this.customizationsSignal();
    const logoValue = customizations?.logoUrl;

    if (!logoValue) {
      return this.imageService.getAppropriateImagePlaceholder('logo');
    }

    // Subscribe to image service updates for reactivity
    this.imageService.getImageUpdateSignal()();

    return this.imageService.getImageUrl(logoValue, 'logo');
  });
}

// ✅ Template updates when images load
<app-reactive-image [src]="logoUrl()" [imageType]="'logo'" alt="Logo">
</app-reactive-image>
```

### **3. Loading State Management Pattern**

**Problem**: Button states show incorrectly after save operations due to loading overlay animation timing.

**Root Cause**: UI conditions depend on loading flags that remain `true` during fade animations.

**Solution Pattern**: Immediate state clearing independent of animations

```typescript
// ❌ PROBLEMATIC: Animation-dependent state management
saveAllChanges(): void {
  this.userTemplateService.updateTemplate(data).subscribe({
    next: () => {
      this.hideLoading(); // Sets fadeOut class, keeps showLoadingOverlay=true
      // Button condition `hasStarted() && !showLoadingOverlay()` fails here!
    }
  });
}

// ❌ Buttons show wrong state during animation
<button *ngIf="hasStartedBuilding() && !showLoadingOverlay()">
  Continue Editing  <!-- This disappears during fadeOut! -->
</button>
```

```typescript
// ✅ CORRECT: Immediate state clearing
saveAllChanges(): void {
  this.userTemplateService.updateTemplate(data).subscribe({
    next: () => {
      this.confirmationService.showConfirmation('Changes saved!', 'success', 3000);

      // CRITICAL: Immediately clear loading overlay
      this.showLoadingOverlay.set(false);
      this.loadingOverlayClass.set('');

      // Handle other UI transitions separately with delay
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

// ✅ Buttons show correct state immediately
<button *ngIf="hasStartedBuilding() && !showLoadingOverlay()">
  Continue Editing  <!-- Always shows correctly -->
</button>
```

## **📊 DATA FLOW ARCHITECTURE**

### **Core Data Movement Pattern**

```
1. Route Parameters → TemplateInitializationService
2. Initial Data → PreviewComponent.applyInitialData()
3. Data Cleaning → ImageService.cleanMalformedObjectIds()
4. Signal Updates → Component Computed Properties
5. Template Rendering → Reactive UI Updates
6. User Edits → ComponentCustomizer
7. Data Updates → PreviewComponent.handleComponentUpdate()
8. State Persistence → UserTemplateService.updateTemplate()
```

### **Critical Data Processing Points**

#### **1. Data Initialization (PreviewComponent)**

```typescript
private applyInitialData(initialData: InitialTemplateData): void {
  // CRITICAL: Clean malformed data before applying
  let cleanedCustomizations = initialData.customizations;
  if (cleanedCustomizations) {
    cleanedCustomizations = this.imageService.cleanMalformedObjectIds(cleanedCustomizations);
  }

  // Apply to signals for reactivity
  this.customizations.set(cleanedCustomizations);
  this.businessType.set(initialData.businessType);
  this.currentPlan.set(initialData.plan);
}
```

#### **2. Component Data Flow (Structure Components)**

```typescript
export class StructureHeaderComponent implements OnInit, OnChanges {
  @Input() customizations: any = {};

  // Convert input to reactive signal
  private customizationsSignal = signal<any>({});

  // Reactive computed properties
  headerStyles = computed(() => {
    const customizations = this.customizationsSignal();
    return {
      backgroundColor: customizations?.backgroundColor || this.getDefaultColor(),
      textColor: customizations?.textColor || this.getDefaultTextColor(),
    };
  });

  logoUrl = computed(() => {
    const customizations = this.customizationsSignal();
    const logoValue = customizations?.logoUrl;

    if (!logoValue) {
      return this.imageService.getAppropriateImagePlaceholder("logo");
    }

    // Subscribe to service updates for reactivity
    this.imageService.getImageUpdateSignal()();
    return this.imageService.getImageUrl(logoValue, "logo");
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["customizations"]) {
      this.customizationsSignal.set(changes["customizations"].currentValue || {});
    }
  }
}
```

#### **3. Data Persistence Flow**

```typescript
// User Edit → ComponentCustomizer → PreviewComponent
handleComponentUpdate(update: any): void {
  this.customizations.update((current) => {
    if (!current) return current;
    const updated = structuredClone(current);

    // Apply updates based on component path/key
    if (selected.path) {
      // Handle nested updates (e.g., pages.home.about)
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
      // Handle direct updates (e.g., header, footer)
      updated[selected.key] = { ...updated[selected.key], ...update };
    }

    return updated;
  });
}

// Save → Backend
saveAllChanges(): void {
  const customizations = this.customizations();
  const templateId = this.currentUserTemplateId();

  this.userTemplateService
    .updateUserTemplate(templateId, templateName, structuredClone(customizations))
    .subscribe({
      next: () => {
        // CRITICAL: Immediate state clearing
        this.showLoadingOverlay.set(false);
        this.loadingOverlayClass.set('');

        this.confirmationService.showConfirmation('Changes saved!', 'success', 3000);
      }
    });
}
```

## **🔧 COMPONENT SELECTION & PATH MANAGEMENT**

### **Path-Based vs Direct Component Updates**

```typescript
// In StandardStructureComponent
handleComponentSelection(componentKey: string): void {
  // CRITICAL: Distinguish between top-level and nested components
  const isTopLevelComponent = ['header', 'footer', 'fontConfig'].includes(componentKey);

  const selectedData = {
    key: componentKey,
    name: componentKey.charAt(0).toUpperCase() + componentKey.slice(1),
    // Only set path for nested components
    ...(isTopLevelComponent ? {} : { path: componentKey })
  };

  this.componentSelected.emit(selectedData);
}
```

**Path Examples**:

- **Top-level**: `{ key: 'header', name: 'Header' }` (no path)
- **Nested**: `{ key: 'about', name: 'About', path: 'pages.home.about' }`

## **🛠️ CRITICAL SERVICE PATTERNS**

### **1. ImageService Data Cleaning**

```typescript
cleanMalformedObjectIds(data: any): any {
  if (!data || typeof data !== 'object') return data;

  // CRITICAL: Handle arrays properly
  if (Array.isArray(data)) {
    return data.map((item) => this.cleanMalformedObjectIds(item));
  }

  const cleaned = { ...data };

  for (const [key, value] of Object.entries(cleaned)) {
    if (typeof value === 'string') {
      // CRITICAL: Exclude valid data types
      const isColorField = key.toLowerCase().includes('color') || this.isValidColor(value);
      const isBackgroundTypeField = key.toLowerCase().includes('type') ||
        ['solid', 'gradient', 'none', 'sunset', 'ocean'].includes(value);

      if (!isColorField && !isBackgroundTypeField && this.looksLikeMalformedObjectId(value)) {
        delete cleaned[key];
      }
    } else if (value && typeof value === 'object') {
      cleaned[key] = this.cleanMalformedObjectIds(value);
    }
  }

  return cleaned;
}
```

### **2. Reactive Image URL Service**

```typescript
// In ImageService
private imageUpdateSubject = new BehaviorSubject<number>(0);

getImageUpdateSignal(): Signal<number> {
  return toSignal(this.imageUpdateSubject.asObservable(), { initialValue: 0 });
}

getImageUrl(imageValue: any, imageType?: 'logo' | 'hero' | 'about' | 'general'): string {
  if (!imageValue) {
    return this.getAppropriateImagePlaceholder(imageType || 'general');
  }

  // Process and cache image, then notify subscribers
  this.processImageAndNotify(imageValue);

  return this.getCachedUrlOrPlaceholder(imageValue, imageType);
}

private processImageAndNotify(imageValue: any): void {
  // ... process image ...
  this.imageUpdateSubject.next(Date.now()); // Notify reactive subscribers
}
```

## **📋 DEBUGGING CHECKLIST**

When troubleshooting component issues, check these in order:

### **Data Flow Issues**

- [ ] Are `@Input` properties converted to signals for reactivity?
- [ ] Are computed properties used instead of getter functions?
- [ ] Is `ngOnChanges` properly updating internal signals?
- [ ] Is change detection triggered with `cdr.markForCheck()` in effects?

### **Image Loading Issues**

- [ ] Is image URL computation reactive to `ImageService.getImageUpdateSignal()`?
- [ ] Is correct `imageType` context passed to `getImageUrl()`?
- [ ] Are appropriate placeholders returned for each context?
- [ ] Is `ReactiveImageComponent` used with proper `imageType` binding?

### **State Management Issues**

- [ ] Are loading states cleared immediately after operations (not after animations)?
- [ ] Are button conditions independent of animation timing?
- [ ] Are template creation flows using proper state isolation?
- [ ] Is error handling clearing loading states in all code paths?

### **Data Persistence Issues**

- [ ] Are color fields excluded from `ImageService.cleanMalformedObjectIds()`?
- [ ] Are background type fields preserved during data processing?
- [ ] Are arrays properly handled without conversion to objects?
- [ ] Is component path/key distinction correct for updates?

## **⚡ PERFORMANCE CONSIDERATIONS**

### **Computed Signal Benefits**

- **Automatic Dependency Tracking**: Only recompute when dependencies change
- **Memoization**: Results cached until dependencies change
- **Change Detection Optimization**: Angular tracks signal changes efficiently

### **Memory Management**

- **Effect Cleanup**: Effects automatically clean up on component destruction
- **Image Caching**: Blob URLs properly managed and cleaned up
- **Signal Updates**: Only emit when values actually change

## **🔮 FUTURE IMPROVEMENTS**

### **Enhanced Type Safety**

```typescript
// Future: Branded types for better type safety
type ObjectId = string & { __brand: "ObjectId" };
type ComponentPath = string & { __brand: "ComponentPath" };

interface ComponentSelection {
  key: string;
  name: string;
  path?: ComponentPath;
}
```

### **Advanced Caching**

```typescript
// Future: Intelligent caching with invalidation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  dependencies: string[];
}
```

---

This documentation should be referenced whenever implementing new components or debugging existing ones. The patterns documented here are battle-tested and resolve the most common architectural issues in the Webcraft application.
