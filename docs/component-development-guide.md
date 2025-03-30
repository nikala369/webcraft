# Component Development Guide

This guide explains how to develop new components for the website builder. Follow these patterns to ensure consistency and maintainability.

## Component Structure

Each section component should follow this general structure:

1. **Component Class**: Contains logic and data handling
2. **HTML Template**: Defines the UI structure
3. **SCSS Styles**: Defines component styling
4. **Interface**: Defines the component's data model

## Standard Section Component Template

### 1. Component Class

```typescript
import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SectionHoverWrapperComponent } from "../../../../components/section-hover-wrapper/section-hover-wrapper.component";
import { Customizations, MyComponentData } from "../../../../../../core/models/website-customizations";

@Component({
  selector: "app-my-component",
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  templateUrl: "./my-component.component.html",
  styleUrls: ["./my-component.component.scss"],
})
export class MyComponentComponent {
  @Input() customizations!: Customizations;
  @Input() myComponentData: Partial<MyComponentData> = {};
  @Input() isMobileLayout: boolean = false;
  @Input() planType: "standard" | "premium" = "standard";
  @Input() businessType: string = "";
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  // Default assets and values
  defaultImage = "assets/placeholders/my-component-image.jpg";

  /**
   * Handle section selection
   */
  handleSectionSelection(event: { key: string; name: string; path?: string }) {
    console.log(`${this.constructor.name} - handling section selection:`, event);

    // Ensure we have the correct path
    const path = event.path || "pages.home.myComponent";

    this.sectionSelected.emit({
      key: event.key,
      name: event.name,
      path: path,
    });
  }

  /**
   * Get component title or fallback
   */
  getTitle(): string {
    return this.myComponentData?.title || this.getDefaultTitle();
  }

  /**
   * Get component subtitle or fallback
   */
  getSubtitle(): string {
    return this.myComponentData?.subtitle || this.getDefaultSubtitle();
  }

  /**
   * Get business-type specific default title
   */
  private getDefaultTitle(): string {
    const titles = {
      restaurant: "Default Restaurant Title",
      salon: "Default Salon Title",
      // Add other business types as needed
    };

    return titles[this.businessType as keyof typeof titles] || "Default Title";
  }

  /**
   * Get business-type specific default subtitle
   */
  private getDefaultSubtitle(): string {
    const subtitles = {
      restaurant: "Default restaurant subtitle text",
      salon: "Default salon subtitle text",
      // Add other business types as needed
    };

    return subtitles[this.businessType as keyof typeof subtitles] || "Default subtitle";
  }
}
```

### 2. HTML Template

```html
<app-section-hover-wrapper [sectionKey]="'myComponent'" [sectionName]="'My Component Section'" [editable]="true" [currentPlan]="planType" [sectionPath]="'pages.home.myComponent'" (sectionSelected)="handleSectionSelection($event)">
  <section class="my-component-section">
    <div class="section-container">
      <!-- Section header -->
      <div class="section-header">
        <h2 class="section-title">{{ getTitle() }}</h2>
        <div class="title-underline"></div>
        <p class="section-subtitle">{{ getSubtitle() }}</p>
      </div>

      <!-- Section content -->
      <div class="section-content">
        <!-- Your component specific content here -->
      </div>
    </div>
  </section>
</app-section-hover-wrapper>
```

### 3. SCSS Styles

```scss
// Define variables for consistent styling
:host {
  --section-bg-color: #ffffff;
  --section-text-color: #333333;
  --section-accent-color: var(--primary-accent-color);
}

.my-component-section {
  background-color: var(--section-bg-color);
  color: var(--section-text-color);
  padding: 80px 0;
  overflow: hidden;

  .section-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .section-header {
    text-align: center;
    margin-bottom: 60px;

    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 15px;
    }

    .title-underline {
      height: 3px;
      width: 80px;
      background-color: var(--section-accent-color);
      margin: 0 auto 20px;
    }

    .section-subtitle {
      font-size: 1.2rem;
      font-weight: 300;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.6;
    }
  }

  // Add responsive styling
  @media (max-width: 992px) {
    padding: 60px 0;

    .section-header {
      margin-bottom: 40px;

      .section-title {
        font-size: 2.2rem;
      }

      .section-subtitle {
        font-size: 1.1rem;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 50px 0;

    .section-header {
      margin-bottom: 30px;

      .section-title {
        font-size: 1.8rem;
      }

      .section-subtitle {
        font-size: 1rem;
      }
    }
  }
}
```

### 4. Data Interface

Add to `website-customizations.ts`:

```typescript
/**
 * My Component section data model
 */
export interface MyComponentData {
  title: string;
  subtitle: string;
  // Add additional properties specific to your component
  backgroundColor?: string;
  textColor?: string;
}

// Update the Customizations interface to include your component
export interface Customizations {
  // ...existing properties
  pages?: {
    home?: {
      // ...existing properties
      myComponent?: MyComponentData;
      // ...
    };
    // ...
  };
  // ...
}
```

## Adding Customization Fields

To make your component customizable, add its configuration to `customizing-form-config.ts`:

```typescript
// Add fields for your component
export const myComponentConfig: FieldConfig[] = [
  // CONTENT category
  {
    key: "title",
    label: "Section Title",
    type: "text",
    category: "content",
    defaultValue: "My Component",
    required: true,
  },
  {
    key: "subtitle",
    label: "Section Subtitle",
    type: "text",
    category: "content",
    defaultValue: "This is my new component",
  },
  // Add more fields as needed
];

// Add your config to the main config object
export const CustomizationFormConfig: Record<string, FieldConfig[]> = {
  // ...existing configs
  "pages.home.myComponent": myComponentConfig,
};
```

## Integration with BusinessConfigService

Update the `BusinessConfigService` to include your component:

```typescript
// Add default data method
getDefaultMyComponentData(businessType: string): MyComponentData {
  return {
    title: 'My Component',
    subtitle: 'This is my component subtitle',
    // Add business-specific defaults as needed
    backgroundColor: '#ffffff',
    textColor: '#333333',
  };
}

// Update ensureCompleteCustomizationStructure method
ensureCompleteCustomizationStructure(customizations: Customizations, businessType: string, plan: 'standard' | 'premium'): Customizations {
  // ...existing code

  // Add your component
  if (!updated.pages!.home!.myComponent) {
    updated.pages!.home!.myComponent = this.getDefaultMyComponentData(businessType);
  }

  return updated;
}

// Update getAvailableSectionsForBusinessType to include your component
getAvailableSectionsForBusinessType(businessType: string, plan: 'standard' | 'premium'): string[] {
  // Add your component to the appropriate business types
  // ...
}
```

## Testing Your Component

1. **Unit Testing**: Create unit tests for your component logic
2. **Integration Testing**: Test the component in the context of the full application
3. **Cross-browser Testing**: Ensure your component works across different browsers
4. **Responsive Testing**: Verify your component looks good on all screen sizes

## Best Practices

1. **Consistent Naming**: Follow the established naming conventions
2. **Fallbacks**: Always provide default values for all properties
3. **Business Type Tailoring**: Customize content based on business type
4. **Responsive Design**: Ensure your component looks good on all devices
5. **Performance**: Optimize image sizes and avoid unnecessary DOM operations
6. **A11y**: Ensure your component is accessible (use proper semantic HTML, add ARIA attributes when needed)
