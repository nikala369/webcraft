# Webcraft Component Development Guide

## Overview

This guide outlines best practices for developing components for the Webcraft template-based website builder. All components should follow these guidelines to ensure consistency, maintainability, and optimal performance.

## Core Principles

1. **Template-Based, Not Drag-and-Drop**: Webcraft uses a template-based approach where users configure predefined sections, not a freestyle drag-and-drop editor
2. **Signal-Based State Management**: Use Angular Signals for reactive state management throughout the application
3. **Standalone Components**: Prefer standalone components with explicit imports
4. **Type Safety**: Ensure proper typing with TypeScript interfaces
5. **Responsive Design**: All components must work across desktop and mobile devices
6. **Plan-Specific Features**: Clearly distinguish between Premium and Premium Pro plan features

## Component Types

### 1. Structure Components

These components define the overall structure of a template:

- `PremiumStructureComponent`: Main structure for Premium plan templates
- `PremiumProStructureComponent`: Main structure for Premium Pro plan templates

### 2. Section Components

These are major website sections that users can customize:

- `HeroSectionComponent`: Hero/banner sections
- `AboutSectionComponent`: About/introduction sections
- `ServicesSectionComponent`: Services/offerings sections
- `MenuSectionComponent`: Menu/product listings (especially for restaurants)
- `ContactSectionComponent`: Contact information and forms
- `GallerySectionComponent`: Image galleries
- `TestimonialsComponent`: Customer testimonials (Premium Pro feature)
- `PricingComponent`: Pricing tables (Premium Pro feature)
- `TeamComponent`: Team member profiles (Premium Pro feature)

### 3. UI Controls

These components provide UI for customization:

- `ThemeSwitcherComponent`: For selecting website themes
- `BusinessTypeSelectorComponent`: For selecting business types
- `ComponentCustomizerComponent`: Modal for editing sections
- `FontSelectorComponent`: For selecting website fonts
- `MediaUploaderComponent`: For uploading and managing images and videos
- `CheckoutComponent`: For handling template purchase and subscription

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

## Attachment Integration

When working with media content (images, videos), use the `AttachmentService` to upload and retrieve files:

```typescript
// Component with file upload
export class MediaSectionComponent {
  @Output() fileUploaded = new EventEmitter<string>();

  constructor(private attachmentService: AttachmentService) {}

  uploadFile(file: File): void {
    this.attachmentService.uploadAttachment(file, "USER_TEMPLATE_IMAGE").subscribe({
      next: (response) => {
        // Store the fileId reference in the customization
        this.fileUploaded.emit(response.fileId);
      },
      error: (error) => {
        console.error("Upload failed:", error);
      },
    });
  }
}
```

For displaying uploaded media:

```typescript
// Component for displaying media
export class MediaDisplayComponent {
  @Input() fileId: string;
  objectUrl = signal<string | null>(null);

  constructor(private attachmentService: AttachmentService) {}

  ngOnInit(): void {
    if (this.fileId) {
      this.loadFile();
    }
  }

  private loadFile(): void {
    this.attachmentService.getAttachment(this.fileId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.objectUrl.set(url);
      },
      error: (error) => {
        console.error("Failed to load file:", error);
      },
    });
  }

  ngOnDestroy(): void {
    // Clean up object URL to prevent memory leaks
    if (this.objectUrl()) {
      URL.revokeObjectURL(this.objectUrl()!);
    }
  }
}
```

## Section-Hover-Wrapper Pattern

All section components should use the `SectionHoverWrapperComponent` to provide consistent editing functionality. There are two main patterns:

### Pattern 1: Parent Component Wrapper (Recommended for Premium)

For premium pages with multiple sections, wrap each section in the parent component:

```html
<!-- In parent component (e.g., home-premium.component.html) -->
<app-section-hover-wrapper [sectionId]="'aboutPreview'" [editable]="editable" [currentPlan]="planType" [isMobileView]="isMobileView" (editSection)="handleSectionEdit('aboutPreview')">
  <app-about-preview-section [data]="aboutPreviewData" [isMobileLayout]="isMobileLayout" [isMobileView]="isMobileView" [planType]="planType" [businessType]="businessType" (sectionSelected)="handleSectionSelection($event)"></app-about-preview-section>
</app-section-hover-wrapper>
```

### Pattern 2: Self-Wrapped Components (Standard Sections)

For standalone sections, wrap within the component itself:

```html
<!-- In section component template -->
<app-section-hover-wrapper [sectionId]="'section-name'" [editable]="editable" [currentPlan]="planType" [isMobileView]="isMobileView" (editSection)="handleSectionEdit('section-name')">
  <section id="section-name" class="section-name">
    <!-- Section implementation -->
  </section>
</app-section-hover-wrapper>
```

### Critical Event Flow Requirements

**For Premium Parent Components:**

1. Parent component must implement `handleSectionEdit(sectionId: string)` method
2. Parent component must emit `sectionSelected` event with correct path
3. Child components should NOT have internal section-hover-wrapper
4. Data must be passed using computed signals without parentheses: `[data]="aboutPreviewData"`

**Example Parent Component Implementation:**

```typescript
export class HomePremiumComponent {
  // Computed signals for data
  aboutPreviewData = computed(() => {
    return this.premiumHomeData()?.aboutPreview || {};
  });

  handleSectionEdit(sectionId: string) {
    console.log("[HomePremium] handleSectionEdit called with sectionId:", sectionId);

    let sectionPath = "";
    let sectionName = "";

    switch (sectionId) {
      case "aboutPreview":
        sectionPath = "pages.home.aboutPreview";
        sectionName = "About Preview";
        break;
      // ... other cases
    }

    this.sectionSelected.emit({
      key: sectionId,
      name: sectionName,
      path: sectionPath,
    });
  }

  handleSectionSelection(event: { key: string; name: string; path?: string }) {
    this.sectionSelected.emit(event);
  }
}
```

### Key Properties

- **sectionId**: Unique identifier for the section
- **editable**: Whether editing is allowed (usually `true`)
- **currentPlan**: Plan type for proper theming (`'standard'` or `'premium'`)
- **isMobileView**: View mode (`'view-desktop'` or `'view-mobile'`)
- **editSection**: Event emitter for section editing

### Mobile Behavior

The wrapper automatically:

- Disables edit functionality on mobile devices (`isMobileView === 'view-mobile'`)
- Always displays content regardless of view mode
- Applies plan-specific hover colors (Standard: #2876ff, Premium: #9e6aff)

### Implementation in Section Components

**For Self-Wrapped Components:**

```typescript
export class SectionComponent {
  @Input() isMobileView: string = "view-desktop";
  @Input() planType: "standard" | "premium" = "standard";
  @Input() editable: boolean = true;

  handleSectionEdit(sectionId: string) {
    this.sectionSelected.emit({
      key: sectionId,
      name: "Section Display Name",
      path: `pages.home.${sectionId}`,
    });
  }
}
```

**For Parent-Wrapped Components:**

```typescript
export class SectionComponent {
  @Input() isMobileView: string = "view-desktop";
  @Input() planType: "standard" | "premium" = "standard";
  @Input() editable: boolean = true;

  // NO handleSectionEdit method needed - handled by parent
  // NO internal section-hover-wrapper needed
}
```

## Plan Differences

Clearly differentiate between Premium and Premium Pro features:

```typescript
@Component({
  selector: "app-feature-section",
  template: `
    <div class="section">
      <h2>{{ title }}</h2>

      <!-- Basic features available in both plans -->
      <div class="basic-features">
        <!-- Basic content here -->
      </div>

      <!-- Premium Pro features -->
      <div class="premium-pro-features" *ngIf="isPremiumPro">
        <!-- Advanced content here -->
        <div class="advanced-options">
          <!-- Pro-only options -->
        </div>
      </div>

      <!-- Upgrade prompt for Premium users -->
      <div class="upgrade-prompt" *ngIf="!isPremiumPro">
        <p>Upgrade to Premium Pro to unlock advanced features</p>
        <button (click)="onUpgradeClick()">Upgrade Now</button>
      </div>
    </div>
  `,
})
export class FeatureSectionComponent {
  @Input() planType: "PREMIUM" | "PREMIUM_PRO" = "PREMIUM";

  get isPremiumPro(): boolean {
    return this.planType === "PREMIUM_PRO";
  }

  onUpgradeClick(): void {
    // Handle upgrade flow
  }
}
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

## Example: Media Section Component (Premium Pro)

```typescript
import { Component, Input, Output, EventEmitter, signal, computed, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AttachmentService } from "../../core/services/attachment.service";

interface MediaSectionConfig {
  title: string;
  subtitle?: string;
  backgroundColor: string;
  textColor: string;
  items: MediaItem[];
}

interface MediaItem {
  id: string;
  title: string;
  description?: string;
  fileId: string;
  type: "image" | "video";
}

@Component({
  selector: "app-media-section",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="media-section" [style.background-color]="config()?.backgroundColor" [style.color]="config()?.textColor">
      <div class="container">
        <h2 class="section-title">{{ config()?.title || "Media Gallery" }}</h2>
        <p *ngIf="config()?.subtitle" class="section-subtitle">
          {{ config()?.subtitle }}
        </p>

        <div class="media-grid">
          <div *ngFor="let item of config()?.items; trackBy: trackById" class="media-item">
            <div class="media-content">
              <!-- Image or Video based on type -->
              <img *ngIf="item.type === 'image' && mediaUrls()[item.id]" [src]="mediaUrls()[item.id]" [alt]="item.title" loading="lazy" />
              <video *ngIf="item.type === 'video' && mediaUrls()[item.id]" [src]="mediaUrls()[item.id]" controls></video>
            </div>
            <h3 class="media-title">{{ item.title }}</h3>
            <p *ngIf="item.description" class="media-description">{{ item.description }}</p>
          </div>
        </div>

        <button (click)="edit.emit()" class="edit-button">Edit Gallery</button>
      </div>
    </section>
  `,
  styles: [
    /* component styles */
  ],
})
export class MediaSectionComponent {
  private attachmentService = inject(AttachmentService);

  // Internal signals
  private configSignal = signal<MediaSectionConfig | null>(null);
  private mediaUrlsMap = signal<Record<string, string>>({});

  // Public readonly computed values
  config = computed(() => this.configSignal());
  mediaUrls = computed(() => this.mediaUrlsMap());

  // Inputs
  @Input() set data(value: MediaSectionConfig) {
    this.configSignal.set(value);
    if (value?.items) {
      this.loadMediaFiles(value.items);
    }
  }

  // Outputs
  @Output() edit = new EventEmitter<void>();

  // Helper methods
  trackById(index: number, item: MediaItem): string {
    return item.id;
  }

  private loadMediaFiles(items: MediaItem[]): void {
    const urls: Record<string, string> = {};

    for (const item of items) {
      if (item.fileId) {
        this.attachmentService.getAttachment(item.fileId).subscribe({
          next: (blob) => {
            urls[item.id] = URL.createObjectURL(blob);
            this.mediaUrlsMap.set({ ...this.mediaUrlsMap(), ...urls });
          },
          error: (error) => {
            console.error(`Failed to load media file ${item.fileId}:`, error);
          },
        });
      }
    }
  }

  ngOnDestroy(): void {
    // Clean up object URLs
    const urls = this.mediaUrlsMap();
    Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
  }
}
```
