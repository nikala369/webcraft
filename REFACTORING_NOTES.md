# Website Builder Refactoring Notes

## Issues Addressed

### 1. Plan-Based Color Scheme

- Created a `ThemeColorsService` to centralize color management
- Used CSS variables for consistent color application across components
- Fixed premium colors showing in standard plan by using plan-aware color scheme
- Implemented signal-based reactive color management

### 2. Business Type Theme Selection

- Enhanced theme filtering by business type
- Updated theme interfaces to include `businessTypes` array for multi-type support
- Fixed theme selection flow for when business type changes
- Made theme service ready for backend integration with proper fallbacks

### 3. Section Editing (Hover Edit Button)

- Fixed z-index and event handling in section hover wrapper
- Added better management of CSS styles for hover effects
- Implemented a more robust section selection pattern with path support
- Improved the hover overlay and edit button styling

### 4. Business Type Section Rendering

- Created a business-type aware section rendering system
- Implemented `shouldDisplaySection` method to control section visibility
- Organized business-type specific sections in a structured way
- Prepared for more advanced backend integration

## Code Organization Improvements

### Component Architecture

- Enhanced SectionHoverWrapper with modern inputs and outputs
- Converted inline styles to CSS variables for better theming
- Implemented both backwards compatibility and new features

### Service Layer

- Added ThemeColorsService for centralized color management
- Improved ThemeService to handle business-type filtering properly
- Made services more resilient with proper error handling and fallbacks

### State Management

- Used signals for reactive state management
- Reduced prop-drilling with service-level shared state
- Implemented proper event handling between components

## Future Improvements

### Recommended Next Steps:

1. **Continue Component Modularization**

   - Further break down large components into smaller, more focused ones
   - Create dedicated components for business-type specific sections

2. **Theme System Enhancement**

   - Implement a full design token system with support for dark/light modes
   - Create theme presets that combine colors, typography, and spacing

3. **Data Layer Abstraction**

   - Move business type definitions to a dedicated service
   - Create stronger interfaces for all data models

4. **Performance Optimization**

   - Use OnPush change detection for better performance
   - Implement virtual scrolling for large lists of components
   - Add lazy loading for sections that aren't immediately visible

5. **Testing Strategy**
   - Add unit tests for core services like ThemeColorsService
   - Create component tests for the section hover system
   - Implement end-to-end tests for the complete build flow

## Code Pattern Guidelines

1. **Use CSS Variables**: Always use CSS variables for values that might change based on theme/plan
2. **Service-First Approach**: Put shared logic in services rather than components
3. **Component Communication**: Use a clear pattern of inputs/outputs or services for state
4. **Interface-Driven Development**: Define interfaces before implementing components
5. **Backward Compatibility**: Maintain support for existing code while improving architecture
