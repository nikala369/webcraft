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
      title: 'Premium',
      description: '3 Templates • Single-Page Sites',
      price: '$99',
      oldPrice: '$250',
      badge: 'Best Value',
      features: [
        { text: '3 Professional Templates per Category' },
        { text: 'Single-Page Layout with Menu, Services & Gallery' },
        { text: 'Mobile-Responsive & SEO-Ready' },
        { text: 'Instant Deployment & Free SSL' },
        { text: 'Basic Analytics Dashboard' },
        { text: 'Email & Chat Support' },
      ],
      buttonText: 'TRY PREMIUM',
    },
    {
      type: 'premium',
      title: 'Premium Pro +',
      description: '5 Templates • Multi-Page & Integrations',
      price: '$399',
      features: [
        { text: '5 Premium Templates per Category' },
        { text: 'Full Multi-Page Sites & Custom Routing' },
        { text: 'Category-Specific Integrations' },
        { text: 'Advanced Animations & Visual Effects' },
        { text: 'Performance & Security Optimizations' },
        { text: 'Complete SEO Suite & Real-Time Analytics' },
        { text: '24/7 Dedicated Priority Support' },
      ],
      buttonText: 'TRY PREMIUM PRO',
    },
  ];

  businessTypes = BUSINESS_TYPES;
  selectedBusinessType: string | null = null;
  showBusinessTypeSelector = true;
  isLoading = false;

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    // Check for business type in query params
    this.route.queryParams.subscribe((params) => {
      if (params['businessType']) {
        this.selectedBusinessType = params['businessType'];
        this.showBusinessTypeSelector = false;
      }
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

    // Hide the selector after selection
    this.showBusinessTypeSelector = false;
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
  toggleBusinessTypeSelector(): void {
    this.showBusinessTypeSelector = true;
  }

  /**
   * Handle loading state changes from business-type-selector
   */
  onLoadingChange(isLoading: boolean): void {
    this.isLoading = isLoading;
  }
}
