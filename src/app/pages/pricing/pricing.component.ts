import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  DynamicPricingCardComponent,
  PricingFeature,
} from '../../shared/components/dynamic-pricing-card/dynamic-pricing-card.component';
import { CommonModule } from '@angular/common';
import { BUSINESS_TYPES, BusinessType } from '../../core/models/business-types';
import { BusinessTypeSelectorComponent } from '../preview/components/business-type-selector/business-type-selector.component';

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
  imports: [
    CommonModule,
    DynamicPricingCardComponent,
    BusinessTypeSelectorComponent,
  ],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss',
})
export class PricingComponent implements OnInit {
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

  businessTypes = BUSINESS_TYPES;
  selectedBusinessType: string | null = null;
  showBusinessTypeSelector = true;

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    // Check for business type in query params
    this.route.queryParams.subscribe((params) => {
      if (params['businessType']) {
        this.selectedBusinessType = params['businessType'];
        this.showBusinessTypeSelector = false;
      }
      // Don't set showBusinessTypeSelector to true here - it's already true by default
    });
  }

  navigateToPreview(planType: 'standard' | 'premium') {
    // If business type is not selected, show business type selector
    if (!this.selectedBusinessType) {
      this.router.navigate(['/business-type'], {
        queryParams: {
          plan: planType,
        },
      });
      return;
    }

    // If business type is selected, go to preview
    this.router.navigate(['/preview'], {
      queryParams: {
        plan: planType,
        businessType: this.selectedBusinessType,
      },
    });
  }

  handleBusinessTypeSelection(type: string) {
    this.selectedBusinessType = type;

    // Update URL to include business type without full navigation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { businessType: type },
      queryParamsHandling: 'merge',
    });
  }

  /**
   * Get the display name of the selected business type
   */
  getSelectedBusinessTypeName(): string {
    if (!this.selectedBusinessType) {
      return 'Not Selected';
    }

    const selectedType = this.businessTypes.find(
      (type) => type.id === this.selectedBusinessType
    );

    return selectedType ? selectedType.name : 'Unknown';
  }

  /**
   * Toggle visibility of business type selector
   */
  toggleBusinessTypeSelector(show: boolean): void {
    this.showBusinessTypeSelector = show;
  }
}
