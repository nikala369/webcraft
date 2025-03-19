# Meta-Prompt for Advanced Project Documentation of webcraft75.com Builder (1.0)

You are an expert in full-stack web development with deep expertise in Angular (v19+), Java Spring Boot, and modern deployment (Netlify). Your task is to read and understand the following comprehensive documentation of the webcraft75.com Builder project. This documentation is intended as a checkpoint for advanced AI models and new developers so that even in a new chat session, the entire project workflow, architecture, data flows, and known discrepancies are fully clear.

---

## 1. Project Overview

**webcraft75.com Builder** is a comprehensive web application designed to empower small-to-medium businesses to create and customize their websites without any coding knowledge. The platform combines an intuitive visual editor with professional templates, enabling customers to build responsive websites easily.

**Key Features:**
- Interactive visual website builder with real-time preview.
- Customizable templates and responsive design.
- Component-based customization (headers, hero sections, etc.).
- Theme and font selection.
- Mobile and desktop preview modes.
- One-click deployment to Netlify.

**Core Workflow:**
1. Users select a theme and customize various components (header, hero sections, footer, etc.) via an intuitive Angular UI.
2. Customization choices are stored as JSON using a Java Spring Boot backend.
3. A separate build service processes the JSON configuration to generate the final website.
4. The website is deployed to Netlify, and users update their DNS records to point to their live site.

---

## 2. Frontend Architecture (Angular 19+)

The frontend is built with Angular 19+ and leverages modern features such as signals for reactive state management. It follows a component-based architecture with clear separation of concerns.

### 2.1 PreviewComponent
**Role:** The main container for the website builder experience.

**Responsibilities:**
- Provides global controls (theme switching, view mode toggles, fullscreen mode).
- Manages the overall customization state via reactive signals.
- Handles component selection events and updates.
- Coordinates between structure components (standard/premium) and the customizer modal.

**Data Flow:**
- Child components emit selection events (e.g., when editing a component).
- The PreviewComponent updates a `selectedComponent` signal, triggering the display of the ComponentCustomizerComponent.
- Updates made in the customizer are merged into the overall `customizations` signal, updating the UI in real time.

### 2.2 StandardStructureComponent
**Role:** Renders a single-page website layout.

**Responsibilities:**
- Displays the header, content sections, and footer based on the current customizations.
- Forwards section edit events to the parent component.
- Manages page-specific data through computed signals.

**Key Properties:**
- `customizations`: A signal providing the current customization data.
- `isMobileLayout`: A Boolean indicating if the mobile layout should be used.
- `currentPage`: A string representing the active page.
- `selectedFont`: Contains font configuration data.

**Known Discrepancy:**
- Although designed for a single-page experience (with smooth scrolling to section IDs), the current implementation of menu links behaves as if they navigate to separate pages.

### 2.3 HomeStandardComponent
**Role:** Renders the home page sections.

**Responsibilities:**
- Displays sections such as hero, services, about, and testimonials.
- Emits section selection events using dot-notation paths (e.g., `pages.home.hero1`).
- Applies styling and layout based on the customization data.

### 2.4 ComponentCustomizerComponent
**Role:** A modal component for editing the properties of a selected component.

**Responsibilities:**
- Dynamically generates form fields based on a configuration-driven approach.
- Organizes fields into categories/tabs (general, content, styling).
- Provides image upload previews and handles local data state.
- Emits an update event with new data when changes are applied.

**Key Properties:**
- `componentKey`: Identifies the component to customize.
- `componentPath`: Dot-notation string (e.g., `pages.home.hero1`) that points to nested data.
- `initialData`: The starting data used to pre-populate the form.

### 2.5 SectionHoverWrapperComponent
**Role:** A wrapper that provides edit controls on hover.

**Responsibilities:**
- Displays an edit button when the user hovers over a section.
- Handles click events to select sections for editing.
- Adapts its behavior to mobile and desktop views.

---

## 3. Data Flow

### 3.1 Component Selection Flow
1. A user clicks on a section (for example, the hero section labeled "hero1").
2. The section’s `handleSectionEdit('hero1')` method is called.
3. This emits a path event in dot-notation, e.g., `pages.home.hero1`.
4. The StandardStructureComponent catches this event and calls `handlePageSectionEdit()`.
5. A `componentSelected` event is then emitted to the PreviewComponent with full path details.
6. The PreviewComponent updates the `selectedComponent` signal, triggering the ComponentCustomizerComponent to appear.

### 3.2 Customization Update Flow
1. Within the ComponentCustomizerComponent, the user makes changes.
2. The changes are stored locally (via a `localData` signal).
3. On clicking “Apply Changes”, the component emits an update event with the new data.
4. The PreviewComponent receives this update and merges the changes into the `customizations` signal.
5. The system uses the dot-notation path (e.g., `pages.home.hero1`) to update the correct nested property.
6. The UI reacts to the updated state immediately.

### 3.3 Nested Path Handling
- Nested configuration data is managed using dot-notation paths (e.g., `pages.home.hero1`).
- When updating nested data:
  - The path is split by dots.
  - The system traverses the `customizations` object to locate the target nested object.
  - The new values are merged into that nested object.

---

## 4. Component Customization Configuration

The system is configuration-driven. Customizable fields for each component (e.g., header, hero sections) are defined in a central configuration file. For example:

```typescript
'pages.home.hero1': [
  // Content Category
  {
    key: 'backgroundImage',
    label: 'Background Image',
    type: 'file',
    category: 'content',
    required: true,
    description: 'Recommended size: 1920x1080px. This image will appear behind your hero text.',
  },
  {
    key: 'title',
    label: 'Main Headline',
    type: 'text',
    category: 'content',
    defaultValue: 'Grow Your Business With Us',
    description: 'The primary headline that appears in the hero section.',
  },
  // Styling Category
  {
    key: 'titleColor',
    label: 'Headline Color',
    type: 'color',
    category: 'styling',
    defaultValue: '#ffffff',
  },
  // General Category
  {
    key: 'layout',
    label: 'Content Alignment',
    type: 'select',
    category: 'general',
    defaultValue: 'center',
    options: [
      { value: 'center', label: 'Centered' },
      { value: 'left', label: 'Left-Aligned' },
      { value: 'right', label: 'Right-Aligned' },
    ],
  },
  {
    key: 'showLogo',
    label: 'Show Logo',
    type: 'select',
    category: 'general',
    defaultValue: true,
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' },
    ],
  },
]


5. Backend (Spring Boot) Architecture
5.1 Key Components & Responsibilities
Data Store:

The backend stores the complete JSON configuration for each customer’s website.
API Endpoints:

GET /templates: Returns available templates and component data.
POST /customizations: Saves the user’s customization configuration.
Data Models:

Define the structure for components such as header, pages, and footer.
Integration:

The configuration JSON is later retrieved by a separate build service that constructs the final website.
6. Deployment Process (Netlify)
Build Service:

A separate application retrieves the stored JSON configuration from the Spring Boot backend.
Dynamic Website Generation:

The build service uses the configuration to generate the website.
Deployment:

The website is deployed to Netlify.
Domain Configuration:

Customers update DNS records with their registrar to point to the live site.
7. Future Considerations & Known Discrepancies
StandardStructureComponent Routing:

Currently, menu links in the standard structure are implemented as if they navigate to separate pages. The intended behavior is smooth scrolling to section IDs.
This discrepancy is noted for future improvements.
Angular Upgrades:

As Angular continues to evolve, further refinements in state management and component interactions are planned.
Backend Enhancements:

Future improvements include more robust data validation and extended API capabilities.
8. Next Steps
Refactor Menu Navigation:
Update the StandardStructureComponent so that menu links smoothly scroll to sections rather than navigating to separate pages.

Expand Documentation:
Keep this documentation up-to-date with any changes in component structure or API endpoints.

Automated Testing:
Develop integration tests to ensure that the data flows (from component selection to backend storage and deployment) remain consistent.

User Feedback:
Gather user feedback on the website builder experience to refine the UI/UX further.

9. Key Code Snippets
9.1 Main Customization Data Store
typescript
Copy
// Main customization data store
customizations = signal<Customizations>({
  fontConfig: { /* font configuration */ },
  header: { /* header configuration */ },
  pages: {
    home: {
      hero1: { /* hero1 configuration */ },
      /* other sections */
    },
    about: { /* about page configuration */ },
    contact: { /* contact page configuration */ }
  },
  footer: { /* footer configuration */ }
});

// Tracks currently selected component for editing
selectedComponent = signal<{
  key: keyof Customizations;
  name: string;
  path?: string;
} | null>(null);
9.2 Section Edit and Background Styling (2.3)
typescript
Copy
// Emits section edit event with proper path structure
handleSectionEdit(sectionKey: string) {
  this.sectionSelected.emit(`pages.home.${sectionKey}`);
}

// Builds background styles with gradients and overlays
getBackgroundStyle(section: string): object {
  const sectionData = this.customizations()?.[section];
  let imageUrl = sectionData?.backgroundImage || this.defaultHeroImage;
  const overlayOpacity = sectionData?.overlay || 0.4;
  const overlay = `rgba(0,0,0,${overlayOpacity})`;

  return {
    'background-image': `linear-gradient(...), url(${imageUrl})`,
    'background-size': 'cover',
    'background-position': sectionData?.backgroundPosition || 'center',
  };
}
9.3 Component Customizer Field Handling (2.4)
typescript
Copy
// Get fields configuration for the current component
getFieldsConfig(): FieldConfig[] {
  return CustomizationFormConfig[this.componentKey] || [];
}

// Handle select field updates with type conversion
updateSelectField(fieldKey: string, value: string | boolean): void {
  const field = this.getFieldsConfig().find(f => f.key === fieldKey);
  
  let typedValue: any = value;
  
  // Convert string "true"/"false" to actual boolean if necessary
  if (field?.options?.some(opt => typeof opt.value === 'boolean')) {
    if (value === 'true') typedValue = true;
    if (value === 'false') typedValue = false;
  }
  
  // Handle numeric values
  if (field?.options?.some(opt => typeof opt.value === 'number') && !isNaN(Number(value))) {
    typedValue = Number(value);
  }
  
  this.localData.update((data) => ({ ...data, [fieldKey]: typedValue }));
}

// Apply final changes
applyChanges(): void {
  const result = { ...this.localData() };
  
  // Remove the ID field added for internal tracking
  if (result.id === this.componentKey) {
    delete result.id;
  }
  this.update.emit(result);
  this.close.emit();
}
9.4 Nested Path Updates (3.3)
typescript
Copy
// When handling updates with nested paths
handleComponentUpdate(update: any): void {
  const selected = this.selectedComponent();
  if (!selected) return;

  // If there's a path, update the nested data
  if (selected.path) {
    const pathParts = selected.path.split('.');

    this.customizations.update((current) => {
      // Create a deep copy to avoid mutating the original
      const updated = { ...current };

      // Traverse to the parent object of the target property
      let target: any = updated;
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!target[part]) {
          target[part] = {};
        }
        target = target[part];
      }

      // Merge the update into the target property
      const lastPart = pathParts[pathParts.length - 1];
      target[lastPart] = { ...target[lastPart], ...update };
      return updated;
    });
  } else {
    // Logic for top-level properties
    this.customizations.update((current) => ({
      ...current,
      [selected.key]: {
        ...current[selected.key],
        ...update,
      },
    }));
  }
}
