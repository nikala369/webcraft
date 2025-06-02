import { Component, EventEmitter, Input, Output, Signal } from '@angular/core';
import { Customizations, MenuData } from '../../../../../core/models/website-customizations';

@Component({
  selector: 'app-menu-premium',
  standalone: true,
  imports: [],
  templateUrl: './menu-premium.component.html',
  styleUrl: './menu-premium.component.scss',
})
export class MenuPremiumComponent {
  @Input({ required: true }) premiumMenuData!: Signal<MenuData>;
  @Input({ required: true }) wholeData!: Signal<Customizations | null>;
  @Input() isMobileLayout: boolean = false;
  @Input() isMobileView: any;
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'restaurant';
  @Output() sectionSelected = new EventEmitter<string>();
}
