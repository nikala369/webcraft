import {Component, EventEmitter, Input, Output, Signal} from '@angular/core';

@Component({
  selector: 'app-contact-premium',
  standalone: true,
  imports: [],
  templateUrl: './contact-premium.component.html',
  styleUrl: './contact-premium.component.scss'
})
export class ContactPremiumComponent {
  @Input() customizations!: Signal<any>;
  @Input() isMobileLayout!: boolean;
  @Input() isMobileView!: boolean;
  @Input() businessType!: string;
  @Output() sectionSelected = new EventEmitter<string>();
}
