# Webcraft Component Development Guide

## Overview

This guide outlines best practices for developing components for the Webcraft template-based website builder. All components should follow these guidelines to ensure consistency, maintainability, and optimal performance.

## Core Principles

1. **Template-Based, Not Drag-and-Drop**: Webcraft uses a template-based approach where users configure predefined sections, not a freestyle drag-and-drop editor
2. **Signal-Based State Management**: Use Angular Signals for reactive state management
3. **Standalone Components**: Prefer standalone components with explicit imports
4. **Type Safety**: Ensure proper typing with TypeScript interfaces
5. **Responsive Design**: All components must work across desktop and mobile

## Component Types

### 1. Structure Components

These components define the overall structure of a template:

- `StandardStructureComponent`: Main structure for standard plan templates
- `PremiumStructureComponent`: Main structure for premium plan templates

### 2. Section Components

These are major website sections that users can customize:

- `HeroSectionComponent`: Hero/banner sections
- `AboutSectionComponent`: About/introduction sections
- `ServicesSectionComponent`: Services/offerings sections
- `MenuSectionComponent`: Menu/product listings (especially for restaurants)
- `ContactSectionComponent`: Contact information and forms
- `GallerySectionComponent`: Image galleries

### 3. UI Controls

These components provide UI for customization:

- `ThemeSwitcherComponent`: For selecting website themes
- `BusinessTypeSelectorComponent`: For selecting business types
- `ComponentCustomizerComponent`: Modal for editing sections
- `FontSelectorComponent`: For selecting website fonts

## Component Structure

Each component should follow this basic structure:

```typescript
import { Component, Input, Output, EventEmitter, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-component-name",
  standalone: true,
  imports: [CommonModule /* other dependencies */],
  templateUrl: "./component-name.component.html",
  styleUrls: ["./component-name.component.scss"],
})
export class ComponentNameComponent {
  // Inputs
  @Input() set data(value: any) {
    this.internalData.set(value);
  }

  // Signals for state management
  private internalData = signal<any>(null);

  // Computed values
  displayValue = computed(() => {
    const data = this.internalData();
    return data ? data.someValue : "Default Value";
  });

  // Outputs
  @Output() dataChange = new EventEmitter<any>();

  // Methods
  updateData(newValue: any): void {
    // Update state
    const updatedData = { ...this.internalData(), ...newValue };
    this.internalData.set(updatedData);

    // Emit change
    this.dataChange.emit(updatedData);
  }
}
```

## Data Flow

Components should follow a unidirectional data flow pattern:

1. Parent components pass data to child components via `@Input()`
2. Child components notify parents of changes via `@Output()`
3. Data flows down, events flow up

```
Parent Component
   │
   ▼
Child Component (receives data via @Input)
   │
   ▼
User Interaction
   │
   ▼
Child Component (emits event via @Output)
   │
   ▼
Parent Component (updates data)
```

## State Management

- Use Angular Signals for reactive state management
- Define internal signals for component-specific state
- Use computed signals for derived values
- Avoid direct mutation of input properties

```typescript
// Good
@Input() set config(value: Config) {
  this.configSignal.set(value);
}
private configSignal = signal<Config | null>(null);

// Bad
@Input() config: Config;
```

## Templates

- Use conditional rendering (`*ngIf`) for optional elements
- Use template references (`#templateRef`) for complex template structures
- Avoid excessive nesting of structural directives

## Styling

- Use component-scoped styles with the component's style file
- Use CSS variables for theme consistency
- Implement responsive designs with mobile-first approach
- Use SCSS features like mixins and functions for reusable styles

## Customization

Components should expose a clear customization API:

- Color properties (background, text, accent)
- Content properties (text, images, links)
- Layout options (alignment, spacing)
- Business-type specific customizations

## Plan Differences

- Clearly indicate Premium-only features with appropriate UI elements
- Implement conditional logic for plan-specific features
- Use `*ngIf="isPremium"` or similar conditions to show/hide premium content

## Error Handling

- Provide fallback content for missing data
- Add graceful error handling for API calls
- Log errors to the console in development

## Performance

- Implement OnPush change detection where appropriate
- Minimize DOM manipulation in Angular components
- Use trackBy with ngFor for better performance
- Lazy load media assets

## Documentation

Every component should include:

- Class-level JSDoc comment explaining its purpose
- Property documentation for inputs and outputs
- Method documentation for public methods

## Testing

- Write unit tests for component logic
- Test different scenarios (missing data, error states, etc.)
- Test both standard and premium plan scenarios

## Example: Section Component

```typescript
import { Component, Input, Output, EventEmitter, signal, computed } from "@angular/core";
import { CommonModule } from "@angular/common";

interface SectionConfig {
  title: string;
  subtitle?: string;
  backgroundColor: string;
  textColor: string;
}

@Component({
  selector: "app-section",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section" [style.background-color]="config()?.backgroundColor" [style.color]="config()?.textColor">
      <h2 class="section-title">{{ config()?.title || "Default Title" }}</h2>
      <p *ngIf="config()?.subtitle" class="section-subtitle">
        {{ config()?.subtitle }}
      </p>
      <button (click)="edit.emit()">Edit Section</button>
      <ng-content></ng-content>
    </section>
  `,
  styles: [
    `
      .section {
        padding: 2rem;
        margin-bottom: 1rem;
      }
      .section-title {
        font-size: 1.5rem;
        margin-bottom: 1rem;
      }
      .section-subtitle {
        font-size: 1rem;
        margin-bottom: 1.5rem;
      }
    `,
  ],
})
export class SectionComponent {
  // Internal signals
  private configSignal = signal<SectionConfig | null>(null);

  // Public readonly computed values
  config = computed(() => this.configSignal());

  // Inputs
  @Input() set data(value: SectionConfig) {
    this.configSignal.set(value);
  }

  // Outputs
  @Output() edit = new EventEmitter<void>();
}
```
