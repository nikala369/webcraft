# Component Data Flow Documentation

## Overview

This document describes the data flow patterns used throughout the Webcraft application, with special focus on the component customization system and recent fixes.

## Menu Data Persistence - Critical Fix Applied

### Issue Resolution Summary

**Problem**: Menu data was saving correctly as arrays but displaying as defaults during template editing.

**Root Cause**: `ImageService.cleanMalformedObjectIds()` was converting arrays to objects using the spread operator `{ ...data }`, which transforms arrays into objects with numeric keys.

**Solution**: Enhanced the `cleanMalformedObjectIds()` method to properly handle arrays:

```typescript
// BEFORE (problematic):
const cleaned = { ...data }; // This converts arrays to objects!

// AFTER (fixed):
if (Array.isArray(data)) {
  return data.map((item) => this.cleanMalformedObjectIds(item));
}
const cleaned = { ...data }; // Only for actual objects
```

### Data Flow Architecture

#### 1. Template Saving Process

```
User Edit → PreviewComponent.saveAllChanges() → UserTemplateService.updateUserTemplate() → Backend API
```

**Data Structure**: Menu categories saved as array format:

```json
{
  "pages": {
    "home": {
      "menu": {
        "categories": [
          { "id": "cat1", "name": "Starters", "items": [...] },
          { "id": "cat2", "name": "Main Courses", "items": [...] }
        ]
      }
    }
  }
}
```

#### 2. Template Loading Process

```
URL → TemplateInitializationService → JSON.parse() → ImageService.cleanMalformedObjectIds() → MenuSectionComponent
```

**Critical Enhancement**: `ImageService.cleanMalformedObjectIds()` now preserves array structure:

- Arrays remain as arrays
- Objects remain as objects
- Nested structures are recursively processed correctly

#### 3. Menu Section Rendering

```
MenuSectionComponent.menuCategories (computed signal) → Template rendering
```

**Architecture Fix**: Converted from method to computed signal to eliminate race conditions:

```typescript
// BEFORE (race condition prone):
getMenuCategories(): MenuCategory[] { ... }

// AFTER (race condition safe):
menuCategories = computed(() => {
  const data = this.data();
  if (data?.categories && Array.isArray(data.categories) && data.categories.length > 0) {
    return data.categories;
  }
  return this.defaultMenuCategories;
});
```

## Component Customization Flow

### 1. Data Initialization

```
PreviewComponent.applyInitialData() → ImageService.cleanMalformedObjectIds() → Component Signals
```

### 2. Component Updates

```
ComponentCustomizerComponent → PreviewComponent.handleComponentUpdate() → Component Signals
```

### 3. Data Persistence

```
PreviewComponent.saveAllChanges() → UserTemplateService → Backend API
```

## Signal-Based Architecture

### MenuSectionComponent Enhancement

- **Before**: Method-based `getMenuCategories()` with race conditions
- **After**: Computed signal `menuCategories` with reactive updates
- **Benefit**: Eliminates race conditions and ensures rendering only occurs after data stabilization

### Best Practices Applied

1. **Computed Signals**: For derived data that depends on reactive inputs
2. **Array Preservation**: Maintain data structure integrity during processing
3. **Race Condition Prevention**: Use computed signals instead of methods for template binding
4. **Data Validation**: Proper type checking and fallback mechanisms

## Footer Logo Enhancements

### Size Constraints Implementation

```scss
.footer-logo {
  max-height: 40px; // Base constraint
  max-width: 100%;
  min-height: 20px; // Prevent too small logos
  object-fit: contain; // Maintain aspect ratio
  object-position: center; // Center within container
  overflow: hidden; // Prevent overflow
}
```

### Plan-Specific Overrides

- **Standard Plan**: max-height: 55px, max-width: 180px
- **Premium Plan**: max-height: 70px, max-width: 250px
- **Mobile**: Responsive scaling with maintained constraints

## Code Quality Improvements

### 1. Error Handling

- Comprehensive fallback mechanisms
- Proper data validation
- Graceful degradation

### 2. Performance

- Computed signals for reactive updates
- Memoization where appropriate
- Efficient data processing

### 3. Maintainability

- Clear separation of concerns
- Comprehensive documentation
- Consistent code patterns

## Testing Considerations

### Menu Data Persistence Testing

1. **Save Test**: Verify categories save as arrays
2. **Load Test**: Verify categories load as arrays
3. **Edit Test**: Verify categories display correctly during editing
4. **Fallback Test**: Verify defaults display when no saved data

### Footer Logo Testing

1. **Size Test**: Upload large images and verify constraints
2. **Responsive Test**: Verify scaling on mobile devices
3. **Plan Test**: Verify different sizing for standard vs premium

## Future Improvements

### 1. Type Safety

- Implement strict TypeScript interfaces
- Add runtime type validation
- Create data transformation utilities

### 2. Performance Optimization

- Implement lazy loading for large datasets
- Add caching mechanisms
- Optimize bundle sizes

### 3. Testing Coverage

- Unit tests for data transformations
- Integration tests for component flows
- E2E tests for user scenarios

## Migration Notes

### For Future Developers

1. **Array Handling**: Always use `Array.isArray()` before processing arrays
2. **Signal Usage**: Prefer computed signals over methods for template binding
3. **Data Validation**: Implement proper validation at data boundaries
4. **Image Constraints**: Use consistent sizing patterns across components

### Breaking Changes

- Menu section now uses computed signals (internal change, no API impact)
- ImageService array handling improved (internal change, no API impact)
- Footer logo sizing enhanced (visual improvement, no API impact)

---

This documentation should be updated whenever significant data flow changes are made to the application.
