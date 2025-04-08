# Auto Website Builder: Component Data Flow & Customization Architecture

## Overview

This document explains the data flow architecture and component interactions in the Auto Website Builder application, with a focus on the Menu and Services sections in the standard structure. Understanding this architecture is crucial for maintaining and extending the application effectively.

## Component Hierarchy

The application follows this component hierarchy for standard websites:

```
PreviewComponent
└── StandardStructureComponent
    └── HomeStandardComponent
        ├── HeroSectionComponent
        ├── AboutSectionComponent
        ├── MenuSectionComponent (for restaurant businesses)
        ├── ServicesSectionComponent (for salon businesses)
        ├── ProjectsSectionComponent (for architecture/portfolio businesses)
        └── ContactSectionComponent
```

Each section component is wrapped by a `SectionHoverWrapperComponent` which provides the editable overlay functionality.

## Data Flow Architecture

### Core Data Structure

The application uses a central customizations object with this structure:

```typescript
interface Customizations {
  fontConfig: {
    fontId: number;
    family: string;
    fallback: string;
  };
  header: {
    backgroundColor: string;
    textColor: string;
    logoUrl: string;
    menuItems: Array<{ id: number; label: string; link: string }>;
  };
  pages: {
    home: {
      hero1: { ... };
      about: { ... };
      menu: { ... };  // For restaurant business type
      services: { ... };  // For salon business type
      projects: { ... };  // For architecture/portfolio business types
      contact: { ... };
    }
  };
  footer: { ... };
}
```

### Top-Down Data Flow

1. **PreviewComponent** maintains the central state using Angular Signals:

   - `customizations = signal<Customizations>({ ... })`
   - Provides this signal to child components via `[customizations]="customizations"`

2. **StandardStructureComponent** receives the customizations signal:

   - Uses computed signals to extract specific sections: `homeCustomizationsSignal`, `aboutCustomizationsSignal`, etc.
   - Passes these to the appropriate section components

3. **HomeStandardComponent** receives the customizations and passes them to each section component:

   - Maintains its own `wholeData` input which is passed to children
   - Conditionally renders business-specific sections (menu, services, projects)

4. **Section Components** (MenuSection, ServicesSection, etc.) access their specific data through nesting paths:
   - E.g., For MenuSection: `customizations?.pages?.home?.menu` or `wholeData?.pages?.home?.menu`

## Customization Mechanism

### Editing Flow

1. User clicks on a section in the preview
2. `SectionHoverWrapperComponent` emits a `sectionSelected` event with section key and path
3. Event bubbles up through component hierarchy to `PreviewComponent`
4. `PreviewComponent` opens the `ComponentCustomizerComponent` with the selected section's data
5. User makes changes in the customizer
6. Customizer emits an `update` event with the modified data
7. `PreviewComponent` updates the main customizations signal with the new data
8. Updates flow down to all components through the signal system

### Path-Based Data Access

Sections use specific paths to access their data:

- Menu section: `pages.home.menu`
- Services section: `pages.home.services`

This path-based approach allows deep customization while maintaining a consistent data structure.

## Menu Section Implementation

### Data Structure

The Menu section uses a hierarchical structure:

```typescript
interface MenuSection {
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  cardBackgroundColor: string;
  accentColor: string;
  categories: MenuCategory[];
}

interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image?: string;
  featured?: boolean;
  tags?: string[];
}
```

### Customization Flow

1. User clicks on Menu section
2. `MenuSectionComponent` emits path `pages.home.menu`
3. `ComponentCustomizerComponent` opens with specialized fields for menu configuration
4. For category/item editing, a specialized `MenuEditorComponent` is opened as a modal
5. User edits categories and items in the modal
6. On save, data flows back through the customizer to update the main customizations signal

### Key Functions

- `getMenuCategories()`: Retrieves menu categories from customizations or defaults
- `getSectionData()`: Handles retrieval from different possible locations in the customizations object
- `getMenuTitle()/getMenuSubtitle()`: Get title/subtitle from customizations or defaults based on business type

## Services Section Implementation

### Data Structure

The Services section uses a flat list structure:

```typescript
interface ServiceSection {
  title: string;
  subtitle: string;
  backgroundColor: string;
  textColor: string;
  cardBackgroundColor: string;
  accentColor: string;
  items: ServiceItem[];
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price?: string;
  duration?: string;
  image?: string;
  featured?: boolean;
  bookingUrl?: string;
}
```

### Customization Flow

1. User clicks on Services section
2. `ServicesSectionComponent` emits path `pages.home.services`
3. `ComponentCustomizerComponent` opens with fields for services configuration
4. For services editing, a specialized `ServicesEditorComponent` is opened as a modal
5. User can add/edit/remove services (limited to 10 for standard plan, 15 for premium)
6. On save, data flows back through the customizer to update the main customizations signal

### Key Functions

- `getServices()`: Retrieves services list from customizations or defaults, limited to max count
- `getSectionData()`: Handles retrieval from different possible locations in the customizations object
- `applyCustomColors()`: Applies custom colors from configuration to the component using CSS variables

## Limitations and Constraints

1. **Standard Plan Limits**:

   - Menu: 4 categories, 6 items per category
   - Services: 10 services maximum

2. **Premium Plan Limits**:

   - Menu: 8 categories, 15 items per category
   - Services: 15 services maximum

3. **Feature Differences by Plan**:
   - Standard: Basic customization, no featured items
   - Premium: Advanced customization, featured items, booking URLs, tags

## CSS Architecture

The application uses a CSS Variable approach for theming:

1. Each section component defines its own CSS variables (e.g., `--primary-accent-color`, `--section-bg-color`)
2. The component's TypeScript code applies custom colors via `ElementRef`:
   ```typescript
   host.style.setProperty("--section-bg-color", data.backgroundColor);
   ```
3. The CSS uses these variables for consistent styling:
   ```css
   .services-section {
     background-color: var(--section-bg-color);
   }
   ```

## Responsive Design Strategy

Sections use CSS Grid with breakpoints to ensure proper display:

- Desktop: 4 columns
- Large tablet: 3 columns
- Tablet: 2 columns
- Mobile: 1 column

Specific breakpoints:

- 1200px: 3 columns
- 992px: 2 columns
- 768px: 1 column

## Best Practices for Extending

1. **Adding a New Section**:

   - Create component in the appropriate structure directory
   - Add to the `HomeStandardComponent` template with business type condition
   - Define path in format `pages.home.{sectionKey}`
   - Create customization config in `customizing-form-config.ts`

2. **Adding New Customization Fields**:

   - Update the relevant data interfaces
   - Add fields to the configuration in `customizing-form-config.ts`
   - Add UI controls in the component customizer templates
   - Implement handlers in component customizer

3. **Business Type Conditions**:

   - Use the `businessType` input to conditionally render components
   - Implement `supportsBusinessType()` method in section components
   - Provide different defaults based on business type

4. **Plan-Based Limitations**:
   - Use the `planType` input to control features
   - Implement `isPremium()` and `maxItems` methods in components
   - Show upgrade CTAs for standard plan users
