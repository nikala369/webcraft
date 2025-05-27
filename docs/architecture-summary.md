# Webcraft Architecture Summary

## Current State

### Business Model

- **Free Trial**: Full builder access, cannot publish
- **Standard Plan** ($9.99/mo): Single-page websites, paid subscription
- **Premium Plan** ($19.99/mo): Multi-page websites, paid subscription
- **No Free Publishing**: Both plans require payment

### Technical Architecture

```
Angular 19 Frontend
├── Authentication (JWT)
├── Dashboard
│   ├── Templates Management
│   ├── Builds Management
│   └── User Settings
└── Builder (PreviewComponent)
    ├── StandardStructureComponent ✅ (Implemented)
    │   ├── Hero Section
    │   ├── About Section
    │   ├── Services/Menu Section
    │   ├── Contact Section
    │   ├── Header
    │   └── Footer
    ├── PremiumStructureComponent ❌ (TODO)
    │   ├── Multi-page Navigation
    │   ├── Enhanced Sections
    │   └── Page Management
    └── Supporting Components
        ├── ComponentCustomizerComponent (Sidebar)
        ├── BusinessTypeSelectorComponent
        ├── ThemeSwitcherComponent
        └── ViewManagementService
```

### Implementation Status

#### ✅ Completed

- Authentication & user management
- Dashboard with template CRUD
- Standard plan single-page builder
- Business type selection (6 types)
- Section customization
- Save/publish workflow
- Stripe payment integration
- Mobile/desktop preview modes

#### 🚧 In Progress

- Image upload API (backend team)
- Premium plan TODOs in code

#### ❌ Not Started

- PremiumStructureComponent
- Multi-page navigation
- Premium sections (Testimonials, Pricing, Team, etc.)
- Enhanced visual polish for Standard plan

## Next Steps

### Phase 1: Polish Standard Plan (Immediate Priority)

**Goal**: Make Standard plan worth $9.99/month

1. **Visual Enhancements**

   - Smooth scroll animations
   - Hover effects on all elements
   - Loading skeletons
   - Micro-interactions

2. **Section Improvements**

   - Hero: Text animations, parallax, gradient backgrounds
   - About: Timeline layout, animated stats
   - Services/Menu: Search, filters, badges
   - Contact: Styled maps, click-to-call, WhatsApp

3. **Business-Specific Features**
   - Restaurant: QR codes, allergen info
   - Salon: Duration display, packages
   - Architecture: Project timelines, awards

### Phase 2: Image Upload Integration

**Waiting on**: Backend API completion

- Implement upload service
- Progress indicators
- Image optimization
- Lazy loading
- Gallery functionality

### Phase 3: Premium Plan Structure

**Goal**: Justify $19.99/month with multi-page sites

1. **Core Structure**

   - Create PremiumStructureComponent
   - Page navigation system
   - Page management UI
   - Page routing

2. **Premium Sections**
   - Testimonials with ratings
   - Pricing tables
   - Team profiles
   - Gallery Pro
   - FAQ section

## Code TODOs

### In PreviewComponent

```typescript
// Line 182: Premium structure implementation
<ng-container *ngIf="currentPlan() === 'premium' && !showBusinessTypeSelector()">
  <!-- Premium Structure Code (if applicable) -->
</ng-container>
```

### Missing Components

1. `PremiumStructureComponent`
2. `PageNavigationComponent`
3. `TestimonialsSection`
4. `PricingSection`
5. `TeamSection`
6. `GalleryProSection`

## Development Guidelines

### Component Pattern

```typescript
@Component({
  selector: "app-section",
  standalone: true,
  imports: [CommonModule],
  template: `...`,
  styleUrls: ["./section.component.scss"],
})
export class SectionComponent {
  @Input() data = signal<SectionData>({});
  @Input() planType: "standard" | "premium" = "standard";
  @Input() businessType!: string;

  isPremium = computed(() => this.planType === "premium");
}
```

### State Management

- Use Angular Signals
- No sessionStorage for critical data
- All persistence through API
- Computed values for derived state

### Styling Guidelines

- Mobile-first responsive
- CSS variables for theming
- Smooth transitions (300ms)
- Consistent spacing scale
- Professional color palette

## Success Metrics

### Technical

- Lighthouse > 95
- Load time < 2s
- No console errors
- Mobile responsive

### Business

- Trial → Paid > 15%
- Standard → Premium > 20%
- User satisfaction > 4.5/5
- Support tickets < 5%

## Risk Mitigation

1. **Image API Delays**

   - Use placeholders
   - Consider third-party service

2. **Complexity**

   - Progressive disclosure
   - Clear onboarding
   - Contextual help

3. **Performance**
   - Lazy loading
   - Code splitting
   - Caching strategy
