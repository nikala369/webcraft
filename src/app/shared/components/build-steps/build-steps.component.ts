import {
  Component,
  Input,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
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
  // Convert the input plan into a signal.
  private _plan = signal<'standard' | 'premium'>('standard');

  @Input() set plan(value: 'standard' | 'premium') {
    this._plan.set(value);
  }
  get plan() {
    return this._plan();
  }

  @Input() currentStep: number = 1;
  @Input() isVertical: boolean = false;

  private themeColorsService = inject(ThemeColorsService);

  // Create a computed signal that derives the accent color based on the current plan.
  accentColor = computed(() =>
    this.themeColorsService.getPrimaryColor(this._plan())
  );

  steps = [
    { id: 1, name: 'Plan Selected', completed: true },
    { id: 2, name: 'Business Type' },
    { id: 3, name: 'Customize' },
    { id: 4, name: 'Publish' },
  ];

  // Use a field initializer to run an effect in the injection context
  private _initEffect = effect(() => {
    document.documentElement.style.setProperty(
      '--steps-accent-color',
      this.accentColor()
    );
  });

  ngOnInit(): void {
    // Other initialization logic can go here.
  }

  isCompleted(step: number): boolean {
    if (step === 1) return true;
    return step < this.currentStep || this.steps[step - 1].completed === true;
  }

  isActive(step: number): boolean {
    return step === this.currentStep;
  }
}
