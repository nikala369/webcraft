import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BUSINESS_TYPES, BusinessType } from '../../core/models/business-types';
import { ThemeColorsService } from '../../core/services/theme/theme-colors.service';

@Component({
  selector: 'app-business-type',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './business-type.component.html',
  styleUrls: ['./business-type.component.scss'],
})
export class BusinessTypeComponent implements OnInit {
  businessTypes = BUSINESS_TYPES;
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
        businessType: this.selectedType,
        plan: this.currentPlan,
      },
    });
  }
}
