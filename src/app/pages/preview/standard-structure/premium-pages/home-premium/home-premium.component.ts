import { Component, EventEmitter, Input, Output, Signal } from '@angular/core';
import { Customizations } from '../../../../../core/models/website-customizations';

@Component({
  selector: 'app-home-premium',
  standalone: true,
  imports: [],
  templateUrl: './home-premium.component.html',
  styleUrl: './home-premium.component.scss',
})
export class HomePremiumComponent {
  @Input({ required: true }) premiumHomeData!: Signal<any>;
  @Input({ required: true }) wholeData!: Signal<Customizations | null>;
  @Input() isMobileLayout: boolean = false;
  @Input() isMobileView: any;
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'restaurant';
  @Output() sectionSelected = new EventEmitter<string>();
}
