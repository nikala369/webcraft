# Component Customizer System - Complete Guide

## Overview

The Component Customizer is the heart of the Webcraft website builder, providing a sophisticated sidebar-based editing interface that allows users to customize every aspect of their website sections. This guide documents the complete system architecture, recent improvements, and best practices.

## Recent Fixes & Improvements (January 2025)

### 1. **Dropdown Positioning Fix**

- **Problem**: Dropdowns were being cut off when the sidebar was dragged due to CSS transform creating a new containing block
- **Solution**: Implemented dynamic positioning calculation that accounts for parent transforms
- **Key Code**: `calculateDropdownPosition()` method now finds transformed ancestors and adjusts coordinates accordingly

### 2. **Sidebar Animation Enhancement**

- **Problem**: No opening animation, inconsistent closing behavior
- **Solution**: Implemented slide-down-from-top animation for opening, slide-up for closing
- **CSS Changes**:
  ```scss
  transform: translateY(-100%); // Start from top
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  ```

### 3. **Hero1 Section Performance Fix**

- **Problem**: First click "dead zone" and closing animation lag
- **Solution**:
  - Set `isVisible = true` immediately in `ngOnInit`
  - Special handling for hero1 in `startClosingAnimation()`
  - Remove lingering `dragging` class that blocks transitions

### 4. **File Upload Visibility Fix**

- **Problem**: Background image/video upload fields not showing correctly
- **Solution**: Fixed conditional rendering to check `localData()['backgroundType']` instead of `field.value`

## Architecture

### Component Hierarchy

```
PreviewComponent
├── ComponentCustomizerComponent (Sidebar Editor)
│   ├── Tab Navigation (General/Content/Styling)
│   ├── Dynamic Field Rendering
│   ├── Specialized Editors (Menu/Services)
│   └── Draggable & Resizable Directives
├── StandardStructureComponent
│   └── Section Components (Hero, About, Menu, etc.)
└── PremiumStructureComponent
    └── Premium Page Components
```

### Data Flow

1. **Selection Flow**:

   ```
   User clicks section → SectionHoverWrapper →
   HomeStandardComponent → StandardStructureComponent →
   PreviewComponent → Opens ComponentCustomizer
   ```

2. **Update Flow**:
   ```
   User edits in Customizer → Emits update event →
   PreviewComponent.handleComponentUpdate() →
   Updates customizations signal → Flows down to all components
   ```

## Key Components

### ComponentCustomizerComponent

The main sidebar editor with these key features:

#### State Management

```typescript
// Core signals
localData = signal<any>({});
activeCategory = signal("general");
isVisible = false;

// Computed signals for reactive updates
visibleFields = computed(() => {
  const fields = this.fieldsForCategory();
  return fields.map((field) => ({
    ...field,
    visible: this.checkFieldVisibility(field, data),
    value: this.getFieldValueComputed(field.key, data),
  }));
});
```

#### Tab Memory System

- Persists last active tab per component in sessionStorage
- Automatically restores tab when reopening customizer
- Validates and shows error tabs when required fields are missing

#### Field Configuration

Fields are defined in `customizing-form-config.ts` with this structure:

```typescript
interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "color" | "file" | "list" | "specializedList" | "boolean";
  category: "general" | "styling" | "content";
  defaultValue?: any;
  required?: boolean;
  description?: string;
}
```

### Draggable & Resizable Directives

#### DraggableDirective

- Enables sidebar repositioning with smooth animations
- Constraint to viewport boundaries
- Reset to default position functionality
- Handles both mouse and touch events

#### ResizableDirective

- Allows sidebar resizing with min/max bounds
- Corner handle for diagonal resizing
- Persists size preferences
- Smooth resize animations

## Field Types & Rendering

### Standard Fields

1. **Text/Textarea**: Basic input fields with validation
2. **Color**: Color picker with preview
3. **Select**: Custom dropdown with fixed positioning
4. **Boolean**: Checkbox inputs
5. **File**: Image/video upload with preview
6. **List**: Dynamic arrays (e.g., menu items)

### Specialized Fields

1. **specializedList**: Opens modal editors
   - Menu Editor for restaurant categories/items
   - Services Editor for salon services
   - Projects Editor for portfolios

### Conditional Field Rendering

Fields can be shown/hidden based on other field values:

```typescript
// Example: Show video upload only when backgroundType is 'video'
if (field.key === "backgroundVideo") {
  return localData()["backgroundType"] === "video";
}
```

## Business Type & Plan Awareness

### Business Type Specific Features

```typescript
// Smart CTA defaults based on business type
const ctaDefaults = getSmartCTADefaults(businessType, plan);
// Restaurant → "View Menu"
// Salon → "Book Appointment"
// Architecture → "View Portfolio"
```

### Plan-Based Feature Gating

```typescript
// Premium-only fields
if (this.planType === 'premium') {
  fields.push(...premiumFields);
}

// UI indicators for locked features
<button [class.locked]="planType === 'standard'">
  Video Background
  <span *ngIf="planType === 'standard'" class="premium-lock">🔒</span>
</button>
```

## Animation System

### Opening Animation (Slide Down)

```scss
.customizer-sidebar {
  transform: translateY(-100%);
  opacity: 0;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &.visible {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### Closing Animation (Slide Up)

```scss
&.closing {
  .customizer-sidebar {
    transform: translateY(-100%);
    opacity: 0;
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }
}
```

## Mobile Responsiveness

### Breakpoint Behavior

- **Desktop (>768px)**: Floating sidebar with drag/resize
- **Mobile (<768px)**: Full-width bottom sheet
  - No drag/resize functionality
  - Slides up from bottom
  - Takes full viewport height

## Performance Optimizations

### Memoized Field Rendering

```typescript
// Cache field objects to prevent re-renders
private fieldCache = new Map<string, any>();

// Track by stable IDs
trackByFieldId = (index: number, field: any): string => {
  return field.id;
};
```

### Computed Signal Optimization

- Use `computed()` for derived state
- Prevent unnecessary recalculations
- Batch updates with `update()` method

## Error Handling & Validation

### Category Validation

```typescript
categoryValidationStatus = computed(() => {
  const result: Record<string, boolean> = {};
  requiredFields.forEach((field) => {
    if (!isValid && field.category) {
      result[field.category] = false;
    }
  });
  return result;
});
```

### Visual Feedback

- Red tab indicators for validation errors
- Pulse animation on invalid categories
- Required field highlighting

## Integration with Preview System

### Component Selection

```typescript
handleComponentSelection(component: {
  key: string;
  name: string;
  path?: string;
}): void {
  // Path examples:
  // 'header' → Top-level component
  // 'pages.home.hero1' → Nested component
  this.selectedComponent.set(component);
}
```

### Data Updates

```typescript
handleComponentUpdate(update: any): void {
  if (selected.path) {
    // Handle nested updates (e.g., pages.home.hero1)
    const pathParts = selected.path.split('.');
    // ... traverse and update nested structure
  } else {
    // Handle top-level updates (e.g., header, footer)
  }
}
```

## Best Practices

### 1. Adding New Sections

- Define fields in `customizing-form-config.ts`
- Add to appropriate business type configuration
- Implement smart defaults in `BusinessConfigService`
- Create section component with proper signal handling

### 2. Creating Custom Fields

- Extend `FieldConfig` interface if needed
- Add rendering logic in customizer template
- Implement update handler method
- Add validation if required

### 3. Performance Guidelines

- Use signals for reactive state
- Implement computed signals for derived values
- Memoize expensive calculations
- Use trackBy functions for lists

### 4. Accessibility

- Proper ARIA labels on all inputs
- Keyboard navigation support
- Focus management on open/close
- Screen reader announcements

## Troubleshooting

### Common Issues

1. **Dropdown Cut-off**

   - Check parent transform styles
   - Verify z-index hierarchy
   - Use fixed positioning calculation

2. **Animation Glitches**

   - Remove lingering CSS classes
   - Check transition conflicts
   - Use requestAnimationFrame for timing

3. **Data Not Updating**
   - Verify signal connections
   - Check path resolution
   - Ensure proper cloning before updates

## Future Enhancements

1. **Undo/Redo System**

   - Track state history
   - Implement command pattern
   - Add keyboard shortcuts

2. **Live Preview**

   - Real-time updates without apply
   - Debounced preview rendering
   - Optimistic UI updates

3. **Advanced Validations**

   - Cross-field validations
   - Async validations
   - Custom validation messages

4. **AI-Powered Suggestions**
   - Content recommendations
   - Color palette suggestions
   - Layout optimizations

---

This documentation represents the current state of the Component Customizer system as of January 2025, incorporating all recent fixes and improvements.
