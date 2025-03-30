import { Component, Input, Signal, Output, EventEmitter } from '@angular/core';
import { Customizations } from '../../../../core/models/website-customizations';

@Component({
  selector: 'app-about-standard',
  standalone: true,
  imports: [],
  templateUrl: './about-standard.component.html',
  styleUrl: './about-standard.component.scss',
})
export class AboutStandardComponent {
  @Input() customizations!: Signal<any>;
  @Input() isMobileLayout!: boolean;
  @Input() isMobileView!: boolean;
  @Input() businessType!: string;
  @Output() sectionSelected = new EventEmitter<string>();
}
