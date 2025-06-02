import {Component, EventEmitter, Input, Output, Signal} from '@angular/core';

@Component({
  selector: 'app-about-premium',
  standalone: true,
  imports: [],
  templateUrl: './about-premium.component.html',
  styleUrl: './about-premium.component.scss'
})
export class AboutPremiumComponent {
  @Input() customizations!: Signal<any>;
  @Input() isMobileLayout!: boolean;
  @Input() isMobileView!: boolean;
  @Input() businessType!: string;
  @Output() sectionSelected = new EventEmitter<string>();
}
