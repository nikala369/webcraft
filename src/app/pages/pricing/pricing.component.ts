import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  DynamicPricingCardComponent,
  PricingFeature,
} from '../../shared/components/dynamic-pricing-card/dynamic-pricing-card.component';
import { CommonModule } from '@angular/common';

interface PricingPlan {
  type: 'standard' | 'premium';
  title: string;
  price: string;
  oldPrice?: string;
  description: string;
  features: PricingFeature[];
  buttonText: string;
  badge?: string;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, DynamicPricingCardComponent],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent {
  pricingPlans: PricingPlan[] = [
    {
      type: 'standard',
      title: 'Standard',
      price: 'Free',
      oldPrice: '$250',
      description: 'Perfect for small businesses and personal brands',
      features: [
        { text: '3 Professional Templates' },
        { text: 'Basic Customization Options' },
        { text: 'Instant Deployment' },
        { text: 'Mobile Responsive Design' },
        { text: 'Secure Hosting Included' },
        { text: 'Basic SEO Settings' },
      ],
      buttonText: 'TRY STANDARD PLAN',
    },
    {
      type: 'premium',
      title: 'Premium',
      price: '$399',
      description: 'Advanced features for growing businesses',
      badge: 'Best Value',
      features: [
        { text: '5 Premium Templates' },
        { text: 'Advanced Customization Options' },
        { text: 'Priority Instant Deployment' },
        { text: 'Booking System Integration' },
        { text: 'Advanced Animations & Effects' },
        { text: 'Premium Hosting & CDN' },
        { text: 'Complete SEO Optimization' },
        { text: 'Analytics Dashboard' },
        { text: 'Dedicated Support' },
      ],
      buttonText: 'TRY PREMIUM PLAN',
    },
  ];

  constructor(private router: Router) {}

  navigateToPreview(planType: 'standard' | 'premium') {
    this.router.navigate(['/preview'], { queryParams: { plan: planType } });
  }
}
