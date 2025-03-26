import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeColorsService } from '../../../core/services/theme/theme-colors.service';

@Component({
  selector: 'app-build-steps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './build-steps.component.html',
  styleUrls: ['./build-steps.component.scss'],
})
export class BuildStepsComponent implements OnInit {
  @Input() currentStep = 1;
  @Input() isVertical = false;
  @Input() plan: 'standard' | 'premium' = 'standard';

  private themeColorsService = inject(ThemeColorsService);
  accentColor = '';

  steps = [
    { id: 1, name: 'Plan Selected', completed: true },
    { id: 2, name: 'Business Type' },
    { id: 3, name: 'Customize' },
    { id: 4, name: 'Publish' },
  ];

  ngOnInit() {
    // Set accent color based on plan
    this.accentColor = this.themeColorsService.getPrimaryColor(this.plan);

    // Apply CSS variable for accent color
    document.documentElement.style.setProperty(
      '--steps-accent-color',
      this.accentColor
    );

    // Mark first step as always completed since plan is already selected when component loads
    this.steps[0].completed = true;
  }

  isCompleted(step: number): boolean {
    // First step is always completed, for other steps check against currentStep
    if (step === 1) return true;
    return step < this.currentStep || this.steps[step - 1].completed === true;
  }

  isActive(step: number): boolean {
    return step === this.currentStep;
  }
}
