# Webcraft Plan Comparison: Premium vs Premium Pro

## Overview

Webcraft offers two paid subscription plans: Premium and Premium Pro. Both are fully functional website building plans that include a one-time template purchase fee and a monthly subscription for hosting and related services. This document outlines the differences between these plans, their features, limitations, and technical implementation details.

## Business Model

### Premium Plan

- **Target User**: Small businesses, freelancers, and individuals who need a professional website with essential features
- **Pricing Structure**:
  - One-time template purchase fee ($49-$99)
  - Monthly subscription ($9.99/month)
- **Value Proposition**: Professional, customizable websites without the complexity

### Premium Pro Plan

- **Target User**: Growing businesses, agencies, and professionals who need advanced features and flexibility
- **Pricing Structure**:
  - One-time template purchase fee ($99-$199)
  - Monthly subscription ($19.99/month)
- **Value Proposition**: Advanced customization, additional page types, enhanced media handling, and premium support

## Feature Comparison

| Feature                   | Premium                           | Premium Pro                               |
| ------------------------- | --------------------------------- | ----------------------------------------- |
| **Templates**             | Standard templates                | Standard + exclusive Pro templates        |
| **Section Types**         | 5-7 core sections                 | 10-15 sections (includes Premium + extra) |
| **Media Handling**        | Basic image upload                | Enhanced image + video support            |
| **Pages**                 | Single page                       | Multiple pages                            |
| **Custom CSS**            | Limited                           | Advanced                                  |
| **Business Types**        | 6 business types                  | 12+ business types                        |
| **Maximum Images**        | 20 images                         | 100 images                                |
| **Maximum Section Items** | Limited (e.g., 4 menu categories) | Expanded (e.g., 8 menu categories)        |
| **Analytics Integration** | Basic                             | Advanced with custom tracking             |
| **Technical Support**     | Standard                          | Priority                                  |

## Technical Implementation

### Structure Components

Different structure components are used for each plan:

```typescript
// Premium Plan uses PremiumStructureComponent
<app-premium-structure
  [customizations]="customizationsSignal"
  [businessType]="businessTypeSignal"
  (componentSelected)="handleComponentSelection($event)"
></app-premium-structure>

// Premium Pro Plan uses PremiumProStructureComponent
<app-premium-pro-structure
  [customizations]="customizationsSignal"
  [businessType]="businessTypeSignal"
  (componentSelected)="handleComponentSelection($event)"
></app-premium-pro-structure>
```

### Plan Type Detection

Components can determine which plan is active:

```typescript
@Component({
  // ... component metadata
})
export class SectionComponent {
  @Input() planType: "PREMIUM" | "PREMIUM_PRO" = "PREMIUM";

  get isPremiumPro(): boolean {
    return this.planType === "PREMIUM_PRO";
  }

  get maxItems(): number {
    return this.isPremiumPro ? 15 : 8;
  }
}
```

### Feature Gating

Templates should conditionally render features based on plan type:

```html
<!-- Base features available to all plans -->
<div class="base-features">
  <!-- ... -->
</div>

<!-- Premium Pro only features -->
<div *ngIf="isPremiumPro" class="premium-pro-features">
  <!-- Advanced features -->
</div>

<!-- Upgrade prompt for Premium users -->
<div *ngIf="!isPremiumPro" class="upgrade-prompt">
  <p>Unlock advanced features by upgrading to Premium Pro</p>
  <button (click)="onUpgrade()">Upgrade Now</button>
</div>
```

### Attachment Limitations

Media uploads are handled differently based on plan:

```typescript
uploadAttachment(file: File): void {
  // Check file size limit based on plan
  const maxSize = this.isPremiumPro ? 10 * 1024 * 1024 : 2 * 1024 * 1024; // 10MB vs 2MB

  if (file.size > maxSize) {
    this.showError(`File exceeds the ${this.isPremiumPro ? '10MB' : '2MB'} limit for your plan`);
    return;
  }

  // Check if user has reached their attachment limit
  this.attachmentService.getUserAttachmentCount().pipe(
    switchMap(count => {
      const maxAttachments = this.isPremiumPro ? 100 : 20;
      if (count >= maxAttachments) {
        throw new Error(`You've reached the maximum of ${maxAttachments} media files for your plan`);
      }
      return this.attachmentService.uploadAttachment(file, file.type.startsWith('image/') ? 'USER_TEMPLATE_IMAGE' : 'USER_TEMPLATE_VIDEO');
    })
  ).subscribe({
    next: response => this.onFileUploaded(response.fileId),
    error: error => this.showError(error.message)
  });
}
```

## Section Configuration Differences

Different sections have different capabilities based on plan:

### Hero Section

- **Premium**: Fixed layouts, image background only
- **Premium Pro**: Additional layouts, video background support

### Services Section

- **Premium**: Up to 8 services, basic fields
- **Premium Pro**: Up to 15 services, additional fields like duration, multiple price options

### Gallery Section

- **Premium**: Image gallery only, up to 8 images
- **Premium Pro**: Images and videos, up to 20 items

## Data Schema Extensions

Premium Pro extends the base schema with additional fields, for example:

```typescript
// Base schema (Premium)
interface HeroSection {
  title: string;
  subtitle: string;
  backgroundImage: string;
  textColor: string;
}

// Extended schema (Premium Pro)
interface HeroSectionPro extends HeroSection {
  backgroundType: "image" | "video";
  backgroundVideo?: string;
  overlayGradient?: {
    startColor: string;
    endColor: string;
    opacity: number;
  };
  animation?: "fade" | "slide" | "zoom";
}
```

## Upgrade Path

Users can upgrade from Premium to Premium Pro through the following flow:

1. User clicks upgrade button in UI (available in multiple places)
2. System checks if they have an active Premium subscription
3. Checkout process shows upgrade price (difference between plans)
4. Upon successful payment, user's plan is upgraded
5. Template is automatically migrated to Premium Pro format
6. User gains immediate access to Premium Pro features

## Implementation Considerations

When developing components that work with both plans:

1. **Progressive Enhancement**: Design components to work with the basic Premium plan data first, then enhance with Premium Pro features
2. **Graceful Degradation**: When displaying a Premium Pro template to Premium users, handle missing data gracefully
3. **Clear UI Indicators**: Use visual cues to indicate which features require Premium Pro
4. **Performance Awareness**: Premium Pro templates may have more data and media; optimize accordingly
5. **Consistent Experience**: Maintain a consistent UI language across plans

## Backend Integration

The backend APIs are aware of plan differences:

```typescript
// Example API response includes plan information
{
  "template": {
    "id": "template-123",
    "name": "Business Pro",
    "plan": "PREMIUM_PRO"
  },
  "features": {
    "maxPages": 5,
    "maxAttachments": 100,
    "videoSupport": true
  }
}
```

## Testing Considerations

When testing components:

1. Test with both Premium and Premium Pro data models
2. Verify correct feature gating based on plan type
3. Test upgrade/downgrade scenarios to ensure data integrity
4. Check responsive behavior on all device sizes for both plans
