# HTML Template Changes Required for Refactored PreviewComponent

After implementing the refactored TypeScript changes, the following key changes need to be made to the PreviewComponent.html template:

## 1. BusinessTypeSelector Changes

Update the BusinessTypeSelectorComponent to respect the disabling rules when context is immutable:

```html
<!-- In the fullscreen header section -->
<app-business-type-selector *ngIf="!isViewOnlyStateService.isOnlyViewMode()" class="preview-header__center-left" [currentPlan]="currentPlan()" [selectedBusinessType]="businessType()" [compactMode]="true" [isDisabled]="isBusinessTypeReadonly()" (businessTypeSelected)="handleBusinessTypeSelection($event)"></app-business-type-selector>

<!-- In the regular mode section -->
<app-business-type-selector *ngIf="showBusinessTypeSelector() && !isFullscreen()" [currentPlan]="currentPlan()" [selectedBusinessType]="businessType()" [isDisabled]="false" (businessTypeSelected)="handleBusinessTypeSelection($event)"></app-business-type-selector>
```

## 2. Structure Component Changes

Pass the `isEditingEnabled` flag to StandardStructureComponent and PremiumStructureComponent:

```html
<ng-container *ngIf="currentPlan() === 'standard' && !showBusinessTypeSelector()">
  <app-standard-structure [isMobileLayout]="viewMode() === 'view-mobile' || isMobileView()" [isMobileView]="viewMode()" [currentPage]="currentPage()" [selectedFont]="selectedFont()" [customizations]="customizations()" [currentPlan]="currentPlan()" [businessType]="businessType()" [isEditingEnabled]="isEditingAllowed()" (componentSelected)="handleComponentSelection($event)"> </app-standard-structure>
</ng-container>

<ng-container *ngIf="currentPlan() === 'premium' && !showBusinessTypeSelector()">
  <app-premium-structure [isMobileLayout]="viewMode() === 'view-mobile' || isMobileView()" [isMobileView]="viewMode()" [currentPage]="currentPage()" [selectedFont]="selectedFont()" [customizations]="customizations()" [currentPlan]="currentPlan()" [businessType]="businessType()" [isEditingEnabled]="isEditingAllowed()" (componentSelected)="handleComponentSelection($event)"> </app-premium-structure>
</ng-container>
```

## 3. Null Safety for Customizations

Ensure null safety when accessing customizations:

```html
<!-- Before -->
[customizations]="customizations"

<!-- After -->
[customizations]="customizations() ?? {}"
```

## 4. Template Display Name

Add display of the template name when available:

```html
<div class="preview-header__template-info" *ngIf="currentUserTemplateId()">
  <span class="template-name">{{ currentTemplateName() }}</span>
  <span class="template-type">{{ businessTypeDisplayName() }}</span>
</div>
```

## 5. Mobile Edit Warning

Add a warning banner when in mobile view mode to indicate editing is disabled:

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

## 6. Add CSS for New Elements

```css
/* Add to preview.component.scss */

/* Mobile edit warning */
.mobile-edit-warning {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  background: rgba(255, 193, 7, 0.95);
  z-index: 100;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.warning-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn--small {
  padding: 4px 8px;
  font-size: 0.875rem;
}

/* Template info in header */
.preview-header__template-info {
  display: flex;
  flex-direction: column;
  margin-right: 16px;
  max-width: 200px;
  overflow: hidden;
}

.template-name {
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-type {
  font-size: 0.75rem;
  opacity: 0.8;
}

/* Disabled state for business type selector */
.business-type-selector.disabled {
  opacity: 0.7;
  pointer-events: none;
}
```

## 7. Structure Component Interface Updates

The StandardStructureComponent and PremiumStructureComponent need to be modified to accept the new `isEditingEnabled` @Input property and implement it in their respective templates:

```typescript
// In standard-structure.component.ts and premium-structure.component.ts
@Input() isEditingEnabled: boolean = true;

// Then in the template, any clickable elements for editing need:
(click)="isEditingEnabled ? handleEdit() : null"
[class.disabled]="!isEditingEnabled"
```

These HTML changes will work with the refactored TypeScript code to implement the authenticated-users-only workflow and mobile editing restrictions.
