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

## Editing Nested Sections (e.g., Hero, About within Home)

This section details the specific data flow when a user edits a nested component (like the Hero section which is part of the Home page) via the `ComponentCustomizerComponent`. This flow relies on correctly passing both the specific component **key** and its full **path** within the `customizations` object.

**1. User Interaction & Initial Event:**

- The user hovers over a section (e.g., Hero section) in the preview.
- The `SectionHoverWrapperComponent` displays an "Edit" button.
- When the user clicks "Edit":
  - `SectionHoverWrapperComponent` emits `(sectionSelected)` (or legacy `onEdit`). Crucially, it needs to know the correct `sectionKey` (e.g., `'hero1'`) and `sectionPath` (e.g., `'pages.home.hero1'`) to emit. _Note: This emission might originate from the specific section component itself (e.g., `HeroSectionComponent`) which then bubbles up._

**2. Event Propagation through Structure Components:**

- **`HomeStandardComponent`:**
  - Catches the `sectionSelected` event from the specific section (or its wrapper).
  - Its primary role here is often to _re-emit_ the event upwards, ensuring the _full path_ (e.g., `pages.home.hero1`) is included in the payload. It emits `(sectionSelected)` with the full path.
- **`StandardStructureComponent`:**
  - Catches the `(sectionSelected)` event from `HomeStandardComponent`.
  - Calls its `handlePageSectionEdit(fullPath)` method.
  - **Critical Step:** This method parses the `fullPath`:
    - Extracts the final segment as the `componentKey` (e.g., `'hero1'`).
    - Derives a user-friendly `sectionName` (e.g., `'Hero1'`).
    - Keeps the original `fullPath` (e.g., `'pages.home.hero1'`).
  - Emits `(componentSelected)` with the structured payload: `{ key: 'hero1', name: 'Hero1', path: 'pages.home.hero1' }`.

**3. Handling Selection in `PreviewComponent`:**

- `PreviewComponent` catches the `(componentSelected)` event.
- Calls its `handleComponentSelection(payload)` method.
- Sets the `selectedComponent` signal with the received payload `{ key: 'hero1', name: 'Hero1', path: 'pages.home.hero1' }`. This triggers the display of the customizer.

**4. Data Display and Update via `ComponentCustomizerComponent`:**

- `ComponentCustomizerComponent` is rendered (often within `PreviewComponent.html`).
- It receives inputs derived from the `selectedComponent` signal:
  - `[componentKey]="selectedComponent()!.key"` (receives `'hero1'`)
  - `[componentPath]="selectedComponent()?.path"` (receives `'pages.home.hero1'`)
  - `[initialData]="selectedCustomization()?.data"` (receives the actual data object for `pages.home.hero1` fetched via the `selectedCustomization` computed signal in `PreviewComponent`).
- The user modifies data within the customizer.
- When changes are applied, `ComponentCustomizerComponent` emits the `(update)` event containing _only the modified data_ (e.g., `{ title: 'New Hero Title' }`).

**5. Applying Updates in `PreviewComponent`:**

- `PreviewComponent` catches the `(update)` event from the customizer.
- Calls its `handleComponentUpdate(updateData)` method.
- **Critical Step:** Inside `handleComponentUpdate`:
  - It retrieves the _currently selected component's_ info from the `selectedComponent` signal (which still holds `{ key: 'hero1', path: 'pages.home.hero1', ... }`).
  - It checks if `selected.path` exists. If yes (indicating a nested update):
    - It performs a `structuredClone` of the current `customizations()` signal state.
    - It uses the `path` (`'pages.home.hero1'`) to traverse the cloned object structure, creating intermediate objects `{}` if they don't exist.
    - It reaches the target object (the data for `hero1`).
    - It _merges_ the `updateData` into the target object using the spread operator: `target[lastPart] = { ...target[lastPart], ...updateData };`. **Crucially, it does NOT simply overwrite the target object.**
    - It updates the `customizations` signal with the modified clone.
  - If `selected.path` does _not_ exist (e.g., updating 'header' or 'footer'):
    - It uses `selected.key` to target the top-level property.
    - It merges the `updateData` similarly: `[key]: { ...(current[key] || {}), ...updateData }`.

**6. Reactivity and View Update:**

- The update to the `customizations` signal in `PreviewComponent` automatically triggers recalculation downstream.
- `StandardStructureComponent`'s `@Input customizations` receives the new signal value.
- Its computed signals (`wholeDataSignal`, `homeCustomizationsSignal`, etc.) recalculate based on the updated signal.
- These computed signals are passed as inputs to `HomeStandardComponent`.
- `HomeStandardComponent` passes the relevant data slice to the specific child section component (e.g., `HeroSectionComponent` receives the updated `hero1` data).
- The child section component's template re-renders based on its updated input data, displaying the changes visually.

**Key Requirements for Correct Flow:**

- **Signal Input:** Child components (`StandardStructureComponent`, etc.) should accept the `customizations` data as a `Signal<Customizations | null>` via `@Input`.
- **Computed Signals:** Use `computed()` within intermediate components (`StandardStructureComponent`) to derive specific data slices for children, ensuring reactivity.
- **Distinct Key/Path:** `StandardStructureComponent` _must_ correctly extract the final `key` and the `fullPath` and emit them separately.
- **Path-Based Traversal:** `PreviewComponent.handleComponentUpdate` _must_ use the `path` to correctly locate the nested object to update.
- **Merge, Don't Overwrite:** Updates must be _merged_ into the existing data object using the spread operator (`...`) in `PreviewComponent.handleComponentUpdate` to avoid losing other properties within that section's data.
- **Deep Cloning:** Use `structuredClone()` within `handleComponentUpdate` _before_ making modifications to ensure immutability when updating the signal.
