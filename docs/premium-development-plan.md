# Premium Development Plan

## Overview

This document outlines the comprehensive development plan for implementing Premium features in the Webcraft website builder. Premium is the advanced tier offering multi-page websites with enhanced customization options and additional sections.

## Premium Feature Set

### Core Differentiators from Standard Plan

| Feature           | Standard     | Premium                                |
| ----------------- | ------------ | -------------------------------------- |
| Pages             | Single page  | Up to 10 pages                         |
| Sections per page | 5-6 sections | 10+ sections                           |
| Advanced sections | ❌           | ✅ (Testimonials, Pricing, Team, etc.) |
| Custom pages      | ❌           | ✅                                     |
| SEO tools         | Basic        | Advanced                               |
| Analytics         | Basic        | Advanced                               |
| Media storage     | 50 images    | 100 images + videos                    |
| Priority support  | ❌           | ✅                                     |

## Implementation Phases

### Phase 1: Core Multi-Page Structure (Week 1-2)

#### 1.1 Create PremiumStructureComponent

```typescript
// src/app/pages/preview/premium-structure/premium-structure.component.ts
@Component({
  selector: 'app-premium-structure',
  standalone: true,
  imports: [CommonModule, RouterModule, ...],
  templateUrl: './premium-structure.component.html',
  styleUrls: ['./premium-structure.component.scss']
})
export class PremiumStructureComponent {
  @Input() customizations!: Signal<Customizations>;
  @Input() businessType!: string;
  @Input() currentPage!: string;
  @Output() componentSelected = new EventEmitter();

  pages = signal<Page[]>([
    { id: 'home', name: 'Home', path: '/', order: 1, isDefault: true },
    { id: 'about', name: 'About', path: '/about', order: 2, isDefault: true },
    { id: 'services', name: 'Services', path: '/services', order: 3, isDefault: true },
    { id: 'contact', name: 'Contact', path: '/contact', order: 4, isDefault: true }
  ]);
}
```

#### 1.2 Implement Page Navigation Component

```typescript
// src/app/pages/preview/premium-structure/components/page-navigation/page-navigation.component.ts
@Component({
  selector: "app-page-navigation",
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="page-navigation">
      <ul class="nav-list">
        <li *ngFor="let page of pages()" [class.active]="isActive(page)" (click)="navigateToPage(page)">
          {{ page.name }}
        </li>
      </ul>
    </nav>
  `,
})
export class PageNavigationComponent {
  @Input() pages!: Signal<Page[]>;
  @Input() currentPage!: string;
  @Output() pageChange = new EventEmitter<string>();
}
```

#### 1.3 Update Customizations Model

```typescript
interface PremiumCustomizations extends Customizations {
  pages: {
    [pageId: string]: {
      meta: PageMeta;
      sections: {
        [sectionId: string]: SectionData;
      };
    };
  };
  navigation: NavigationConfig;
  globalSettings: GlobalSettings;
}

interface PageMeta {
  title: string;
  description: string;
  slug: string;
  isVisible: boolean;
  order: number;
}
```

### Phase 2: Page Management UI (Week 2-3)

#### 2.1 Page Manager Component

```typescript
// src/app/pages/preview/components/page-manager/page-manager.component.ts
@Component({
  selector: "app-page-manager",
  standalone: true,
  imports: [CommonModule, DragDropModule, FormsModule],
  template: `
    <div class="page-manager">
      <h3>Manage Pages</h3>
      <div cdkDropList (cdkDropListDropped)="reorderPages($event)">
        <div *ngFor="let page of pages()" cdkDrag class="page-item">
          <span class="drag-handle">⋮⋮</span>
          <input [(ngModel)]="page.name" />
          <button (click)="deletePage(page)" [disabled]="page.isDefault">Delete</button>
        </div>
      </div>
      <button (click)="addPage()" [disabled]="pages().length >= 10">Add Page</button>
    </div>
  `,
})
export class PageManagerComponent {
  @Input() pages!: Signal<Page[]>;
  @Output() pagesUpdated = new EventEmitter<Page[]>();
}
```

#### 2.2 Integration with PreviewComponent

Update PreviewComponent to handle multi-page navigation:

```typescript
// Additional methods in PreviewComponent
navigateToPage(pageId: string): void {
  this.currentPage.set(pageId);
  this.updateUrlParams({ page: pageId });

  // Load page-specific customizations
  const pageCustomizations = this.customizations()?.pages?.[pageId];
  if (pageCustomizations) {
    this.applyPageCustomizations(pageCustomizations);
  }
}

handlePageManagement(): void {
  this.modalService.open(PageManagerComponent, {
    data: {
      pages: this.pages,
      onUpdate: (updatedPages: Page[]) => {
        this.updatePages(updatedPages);
      }
    }
  });
}
```

### Phase 3: Enhanced Sections Development (Week 3-5)

#### 3.1 Testimonials Section

```typescript
// src/app/pages/preview/premium-structure/sections/testimonials/testimonials-section.component.ts
@Component({
  selector: "app-testimonials-section",
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  template: `
    <section class="testimonials-section">
      <div class="section-container">
        <h2>{{ data().title }}</h2>
        <div class="testimonials-grid" [ngClass]="layoutClass">
          <div *ngFor="let testimonial of testimonials()" class="testimonial-card">
            <div class="rating">
              <span *ngFor="let star of [1, 2, 3, 4, 5]" [class.filled]="star <= testimonial.rating">★</span>
            </div>
            <p class="testimonial-text">{{ testimonial.text }}</p>
            <div class="author">
              <img [src]="testimonial.authorImage" />
              <div>
                <h4>{{ testimonial.authorName }}</h4>
                <p>{{ testimonial.authorTitle }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TestimonialsSectionComponent {
  @Input() data!: Signal<TestimonialsData>;
  @Input() layout: "grid" | "carousel" | "list" = "grid";
}
```

#### 3.2 Pricing Tables Section

```typescript
// src/app/pages/preview/premium-structure/sections/pricing/pricing-section.component.ts
@Component({
  selector: "app-pricing-section",
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  template: `
    <section class="pricing-section">
      <div class="section-container">
        <h2>{{ data().title }}</h2>
        <div class="pricing-grid">
          <div *ngFor="let plan of pricingPlans()" class="pricing-card" [class.featured]="plan.isFeatured">
            <h3>{{ plan.name }}</h3>
            <div class="price">
              <span class="currency">{{ plan.currency }}</span>
              <span class="amount">{{ plan.price }}</span>
              <span class="period">{{ plan.period }}</span>
            </div>
            <ul class="features">
              <li *ngFor="let feature of plan.features" [class.included]="feature.included">
                {{ feature.text }}
              </li>
            </ul>
            <button class="cta-button">{{ plan.ctaText }}</button>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class PricingSectionComponent {
  @Input() data!: Signal<PricingData>;
  @Input() columns: 2 | 3 | 4 = 3;
}
```

#### 3.3 Team Section

```typescript
// src/app/pages/preview/premium-structure/sections/team/team-section.component.ts
@Component({
  selector: "app-team-section",
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  template: `
    <section class="team-section">
      <div class="section-container">
        <h2>{{ data().title }}</h2>
        <div class="team-grid">
          <div *ngFor="let member of teamMembers()" class="team-member">
            <img [src]="member.image" [alt]="member.name" />
            <h3>{{ member.name }}</h3>
            <p class="role">{{ member.role }}</p>
            <p class="bio">{{ member.bio }}</p>
            <div class="social-links">
              <a *ngFor="let link of member.socialLinks" [href]="link.url" target="_blank">
                <app-icon [name]="link.platform"></app-icon>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TeamSectionComponent {
  @Input() data!: Signal<TeamData>;
  @Input() layout: "grid" | "carousel" = "grid";
}
```

#### 3.4 Enhanced Gallery Section

```typescript
// src/app/pages/preview/premium-structure/sections/gallery-pro/gallery-pro-section.component.ts
@Component({
  selector: "app-gallery-pro-section",
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent, LightboxModule],
  template: `
    <section class="gallery-pro-section">
      <div class="section-container">
        <h2>{{ data().title }}</h2>
        <div class="gallery-filters" *ngIf="showFilters">
          <button *ngFor="let category of categories()" (click)="filterByCategory(category)" [class.active]="activeCategory === category">
            {{ category }}
          </button>
        </div>
        <div class="gallery-grid" [ngClass]="gridClass">
          <div *ngFor="let item of filteredItems()" class="gallery-item" (click)="openLightbox(item)">
            <img [src]="item.thumbnail" [alt]="item.caption" />
            <div class="overlay">
              <p>{{ item.caption }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class GalleryProSectionComponent {
  @Input() data!: Signal<GalleryData>;
  @Input() columns: 2 | 3 | 4 | 5 = 4;
  @Input() showFilters = true;
  @Input() enableLightbox = true;
}
```

### Phase 4: Customizer Updates (Week 5-6)

#### 4.1 Enhanced Customizer Fields

```typescript
// Update customizing-form-config.ts
export const testimonialsSectionConfig: FieldConfig[] = [
  {
    key: "title",
    label: "Section Title",
    type: "text",
    category: "content",
    defaultValue: "What Our Clients Say",
  },
  {
    key: "layout",
    label: "Layout Style",
    type: "select",
    category: "styling",
    options: [
      { value: "grid", label: "Grid" },
      { value: "carousel", label: "Carousel" },
      { value: "list", label: "List" },
    ],
  },
  {
    key: "testimonials",
    label: "Testimonials",
    type: "specializedList",
    category: "content",
    description: "Manage customer testimonials",
  },
];
```

#### 4.2 Testimonials Editor Modal

```typescript
// src/app/pages/preview/components/testimonials-editor/testimonials-editor.component.ts
@Component({
  selector: "app-testimonials-editor",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="testimonials-editor">
      <h2>Manage Testimonials</h2>
      <div class="testimonial-list">
        <div *ngFor="let testimonial of testimonials; let i = index" class="testimonial-item">
          <input [(ngModel)]="testimonial.authorName" placeholder="Author Name" />
          <input [(ngModel)]="testimonial.authorTitle" placeholder="Title/Company" />
          <textarea [(ngModel)]="testimonial.text" placeholder="Testimonial text"></textarea>
          <select [(ngModel)]="testimonial.rating">
            <option *ngFor="let r of [1, 2, 3, 4, 5]" [value]="r">{{ r }} Stars</option>
          </select>
          <button (click)="removeTestimonial(i)">Remove</button>
        </div>
      </div>
      <button (click)="addTestimonial()">Add Testimonial</button>
      <div class="actions">
        <button (click)="cancel()">Cancel</button>
        <button (click)="save()">Save</button>
      </div>
    </div>
  `,
})
export class TestimonialsEditorComponent {
  @Input() initialTestimonials: Testimonial[] = [];
  @Output() save = new EventEmitter<Testimonial[]>();
  @Output() cancel = new EventEmitter<void>();

  testimonials: Testimonial[] = [];
}
```

### Phase 5: Integration & Testing (Week 6-7)

#### 5.1 Update PreviewComponent Template

```html
<!-- In preview.component.html -->
<ng-container *ngIf="currentPlan() === 'standard' && !showBusinessTypeSelector()">
  <app-standard-structure [isMobileLayout]="viewMode() === 'view-mobile' || isMobileView()" [isMobileView]="viewMode()" [currentPage]="currentPage()" [selectedFont]="selectedFont()" [customizations]="customizations" [currentPlan]="currentPlan()" [businessType]="businessType()" (componentSelected)="handleComponentSelection($event)"> </app-standard-structure>
</ng-container>

<ng-container *ngIf="currentPlan() === 'premium' && !showBusinessTypeSelector()">
  <app-premium-structure [isMobileLayout]="viewMode() === 'view-mobile' || isMobileView()" [isMobileView]="viewMode()" [currentPage]="currentPage()" [selectedFont]="selectedFont()" [customizations]="customizations" [businessType]="businessType()" (componentSelected)="handleComponentSelection($event)" (pageChange)="navigateToPage($event)"> </app-premium-structure>
</ng-container>
```

#### 5.2 Update Plan Selection Logic

```typescript
// In preview.component.ts
selectPlan(plan: 'standard' | 'premium'): void {
  console.log('[selectPlan] Setting plan to:', plan);

  this.currentPlan.set(plan);
  this.themeColorsService.setPlan(plan);

  // Initialize multi-page structure for Premium
  if (plan === 'premium') {
    this.initializeMultiPageStructure();
  }

  this.updateUrlParams({ plan });
}

private initializeMultiPageStructure(): void {
  const defaultPages = [
    { id: 'home', name: 'Home', path: '/', order: 1 },
    { id: 'about', name: 'About', path: '/about', order: 2 },
    { id: 'services', name: 'Services', path: '/services', order: 3 },
    { id: 'contact', name: 'Contact', path: '/contact', order: 4 }
  ];

  this.pages.set(defaultPages);
  this.currentPage.set('home');
}
```

### Phase 6: Performance & Polish (Week 7-8)

#### 6.1 Implement Lazy Loading

```typescript
// In app.routes.ts
{
  path: 'preview',
  loadComponent: () => import('./pages/preview/preview.component')
    .then(m => m.PreviewComponent),
  children: [
    {
      path: 'premium',
      loadChildren: () => import('./pages/preview/premium-structure/premium.routes')
        .then(m => m.PREMIUM_ROUTES)
    }
  ]
}
```

#### 6.2 Add Loading States

```typescript
// Loading state management
interface LoadingState {
  sections: Record<string, boolean>;
  pages: Record<string, boolean>;
  global: boolean;
}

loadingState = signal<LoadingState>({
  sections: {},
  pages: {},
  global: false,
});
```

## Testing Strategy

### Unit Tests

- Component isolation tests
- Service method tests
- State management tests
- Plan limitation tests

### Integration Tests

- Multi-page navigation
- Section interactions
- Customizer updates
- Save/load functionality

### E2E Tests

- Complete Premium flow
- Page management
- Section customization
- Publishing workflow

## Migration Strategy

### For Existing Standard Users

1. Maintain backward compatibility
2. Offer upgrade path
3. Preserve existing customizations
4. Provide migration tools

### Database Schema Updates

```sql
-- Add pages table
CREATE TABLE user_template_pages (
  id UUID PRIMARY KEY,
  user_template_id UUID REFERENCES user_templates(id),
  page_id VARCHAR(50),
  name VARCHAR(100),
  slug VARCHAR(100),
  meta JSONB,
  sections JSONB,
  order_index INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Success Criteria

### Technical Metrics

- Page load time < 2s per page
- Smooth page transitions
- No memory leaks
- Mobile responsive

### Business Metrics

- 30% of users upgrade to Premium
- Increased user engagement
- Higher template completion rate
- Positive user feedback

## Risk Mitigation

### Technical Risks

1. **Performance degradation**
   - Mitigation: Implement lazy loading and caching
2. **Complex state management**
   - Mitigation: Use structured state patterns
3. **Browser compatibility**
   - Mitigation: Test on all major browsers

### Business Risks

1. **Feature complexity**
   - Mitigation: Progressive disclosure, good UX
2. **Migration issues**
   - Mitigation: Thorough testing, rollback plan

## Timeline Summary

- **Week 1-2**: Core multi-page structure
- **Week 2-3**: Page management UI
- **Week 3-5**: Enhanced sections development
- **Week 5-6**: Customizer updates
- **Week 6-7**: Integration & testing
- **Week 7-8**: Performance & polish

Total estimated time: 8 weeks for full Premium implementation

## Next Steps

1. Review and approve development plan
2. Set up Premium branch
3. Begin Phase 1 implementation
4. Weekly progress reviews
5. Continuous testing and feedback
