# Webcraft Plan Comparison: Standard vs Premium

## Overview

Webcraft offers two paid subscription plans after a free trial: Standard and Premium. Both plans require a monthly subscription to publish and maintain websites. This document outlines the differences between these plans, their features, limitations, and technical implementation details.

## Business Model

### Free Trial

- **Full Access**: Complete builder functionality
- **No Time Limit**: Users can try as long as they want
- **Cannot Publish**: Subscription required to go live
- **Save Progress**: All work is saved and can be published later

### Standard Plan

- **Target User**: Small businesses, freelancers, and individuals who need a professional single-page website
- **Pricing**: $9.99/month
- **Value Proposition**: Professional, customizable single-page websites with essential features

### Premium Plan

- **Target User**: Growing businesses and professionals who need multi-page websites with advanced features
- **Pricing**: $19.99/month
- **Value Proposition**: Multi-page websites with advanced customization and premium sections

## Feature Comparison

| Feature                      | Standard          | Premium                                       |
| ---------------------------- | ----------------- | --------------------------------------------- |
| **Pages**                    | Single page       | Up to 10 pages                                |
| **Core Sections**            | 6-7 sections      | 10+ sections                                  |
| **Advanced Sections**        | ❌                | ✅ (Testimonials, Pricing, Team, Gallery Pro) |
| **Business Types**           | 6 types           | 6+ types (expanding)                          |
| **Image Storage**            | 50 images         | 100 images                                    |
| **Video Support**            | Basic (hero only) | Full video support                            |
| **Custom Pages**             | ❌                | ✅                                            |
| **SEO Tools**                | Basic             | Advanced                                      |
| **Analytics**                | Basic             | Advanced                                      |
| **Support**                  | Standard          | Priority                                      |
| **Custom CSS**               | Limited           | Advanced                                      |
| **Social Media Integration** | Basic             | Advanced                                      |
| **Domain Support**           | Subdomain         | Custom domain                                 |

## Section Availability

### Standard Plan Sections

1. **Hero Section** - Image backgrounds, text animations
2. **About Section** - Story, mission, basic stats
3. **Services/Menu Section** - Business-specific listings
4. **Contact Section** - Contact info, form, map
5. **Header** - Navigation, logo, CTA
6. **Footer** - Links, social, copyright

### Premium Plan Additional Sections

1. **Testimonials** - Customer reviews with ratings
2. **Pricing Tables** - Service/product pricing
3. **Team Section** - Team member profiles
4. **Gallery Pro** - Advanced media gallery
5. **FAQ Section** - Accordion-style Q&A
6. **Blog/News** - Article listings
7. **Portfolio Pro** - Case studies
8. **Stats Section** - Animated counters

## Technical Implementation

### Plan Detection in Components

```typescript
@Component({
  selector: "app-section",
  template: `
    <div class="section" [class.premium]="isPremium()">
      <!-- Standard features -->
      <div class="standard-features">
        <!-- Always available -->
      </div>

      <!-- Premium only features -->
      <div *ngIf="isPremium()" class="premium-features">
        <!-- Premium enhancements -->
      </div>

      <!-- Upgrade prompt for Standard users -->
      <div *ngIf="!isPremium() && showUpgradePrompt" class="upgrade-prompt">
        <p>Unlock more features with Premium</p>
        <button (click)="upgrade()">Upgrade Now</button>
      </div>
    </div>
  `,
})
export class SectionComponent {
  @Input() planType: "standard" | "premium" = "standard";

  isPremium(): boolean {
    return this.planType === "premium";
  }

  getMaxItems(): number {
    return this.isPremium() ? 20 : 10;
  }
}
```

### Structure Components

```typescript
// Standard Plan - Single Page
<app-standard-structure
  [customizations]="customizations"
  [businessType]="businessType"
  [planType]="'standard'"
  (componentSelected)="handleSelection($event)"
/>

// Premium Plan - Multi Page
<app-premium-structure
  [customizations]="customizations"
  [businessType]="businessType"
  [currentPage]="currentPage"
  [pages]="pages"
  (componentSelected)="handleSelection($event)"
  (pageChange)="handlePageChange($event)"
/>
```

### Data Schema Differences

```typescript
// Standard Plan Schema
interface StandardCustomizations {
  fontConfig: FontConfig;
  header: HeaderData;
  pages: {
    home: {
      hero: HeroSection;
      about: AboutSection;
      services?: ServicesSection;
      menu?: MenuSection;
      contact: ContactSection;
    };
  };
  footer: FooterData;
}

// Premium Plan Schema
interface PremiumCustomizations extends StandardCustomizations {
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
```

### Feature Gating Examples

```typescript
// Image Upload Limits
const getImageLimit = (plan: "standard" | "premium"): number => {
  return plan === "premium" ? 100 : 50;
};

// Section Limits
const getSectionLimit = (plan: "standard" | "premium"): number => {
  return plan === "premium" ? 15 : 7;
};

// Video Support
const supportsVideo = (plan: "standard" | "premium"): boolean => {
  return plan === "premium";
};
```

## Upgrade Path

### User Journey

1. User on Standard plan sees Premium features
2. Clicks "Upgrade" button
3. Shown comparison of features
4. Proceeds to Stripe checkout
5. Plan upgraded immediately upon payment
6. Access to Premium features unlocked
7. Existing content preserved and enhanced

### Technical Migration

```typescript
async upgradeUserPlan(userId: string): Promise<void> {
  // 1. Update subscription in Stripe
  const subscription = await stripe.subscriptions.update(subId, {
    items: [{ price: 'premium_price_id' }]
  });

  // 2. Update user plan in database
  await userService.updatePlan(userId, 'premium');

  // 3. Migrate template structure
  await templateService.migrateToMultiPage(userId);

  // 4. Unlock premium features
  await featureService.unlockPremiumFeatures(userId);
}
```

## Implementation Guidelines

### 1. Progressive Enhancement

- Build for Standard first
- Layer Premium features on top
- Ensure graceful degradation

### 2. Clear Visual Indicators

- Use badges for Premium features
- Show lock icons on restricted items
- Provide upgrade CTAs contextually

### 3. Performance Considerations

- Lazy load Premium components
- Optimize for Standard plan users
- Cache based on plan type

### 4. Testing Strategy

- Test both plan types thoroughly
- Verify upgrade/downgrade flows
- Check feature gating accuracy

## Business Rules

### Standard Plan Limitations

- Maximum 1 page
- Maximum 50 images
- Basic customization options
- Standard support response time
- Subdomain only

### Premium Plan Benefits

- Up to 10 pages
- 100 images + videos
- Advanced customization
- Priority support (< 24h)
- Custom domain support
- Advanced SEO tools
- Analytics dashboard

## Future Considerations

### Potential Standard Enhancements

- Limited testimonials (3 max)
- Basic gallery (10 images)
- Simple FAQ section

### Potential Premium Additions

- A/B testing
- Email marketing integration
- Advanced analytics
- Team collaboration
- API access
