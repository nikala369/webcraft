import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  BUSINESS_TYPES,
  BusinessType,
  getAllBusinessTypes,
  getEnabledBusinessTypes,
} from '../../core/models/business-types';
import { ThemeColorsService } from '../../core/services/theme/theme-colors.service';

@Component({
  selector: 'app-business-type',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business-type.component.html',
  styleUrls: ['./business-type.component.scss'],
})
export class BusinessTypeComponent implements OnInit {
  // Show all business types (including coming soon) for display
  businessTypes = getAllBusinessTypes();
  selectedType: string | null = null;
  currentPlan: 'standard' | 'premium' = 'standard';
  accentColor = '';

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private themeColorsService = inject(ThemeColorsService);

  ngOnInit() {
    // Check if plan was selected before
    this.route.queryParams.subscribe((params) => {
      if (params['plan']) {
        this.currentPlan = params['plan'] as 'standard' | 'premium';
      }

      // Check if business type was already selected
      if (params['businessType']) {
        this.selectedType = params['businessType'];
      }
    });

    // Set accent color based on plan
    this.accentColor = this.themeColorsService.getPrimaryColor(
      this.currentPlan
    );
  }

  selectBusinessType(type: string) {
    // Find the business type to check if it's enabled
    const businessType = this.businessTypes.find((bt) => bt.id === type);

    if (!businessType) {
      console.warn(`Business type ${type} not found`);
      return;
    }

    // Prevent selection of disabled/coming soon types
    if (!businessType.enabled || businessType.comingSoon) {
      console.log(`Business type ${businessType.name} is coming soon`);
      return;
    }

    this.selectedType = type;
  }

  getCardStyle(type: string) {
    return {
      'border-color':
        this.selectedType === type ? this.accentColor : 'transparent',
      'box-shadow':
        this.selectedType === type ? `0 0 0 2px ${this.accentColor}` : 'none',
    };
  }

  continueToPlans() {
    if (!this.selectedType) {
      // If no type is selected, still navigate to pricing but without query param
      this.router.navigate(['/pricing'], {
        queryParams: {
          plan: this.currentPlan,
        },
      });
      return;
    }

    // Navigate to pricing with the business type
    this.router.navigate(['/pricing'], {
      queryParams: {
        businessType: this.selectedType,
        plan: this.currentPlan,
      },
    });
  }

  continueToPreview() {
    if (!this.selectedType) {
      return; // Don't proceed without selection
    }

    // Navigate directly to preview with the business type
    this.router.navigate(['/preview'], {
      queryParams: {
        plan: this.currentPlan,
        businessType: this.selectedType,
        newTemplate: 'true',
      },
    });
  }
}
