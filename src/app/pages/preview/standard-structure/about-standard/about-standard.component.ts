import { Component, Input, Signal, Output, EventEmitter } from '@angular/core';
import { Customizations } from '../../preview.component';

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
  @Output() sectionSelected = new EventEmitter<string>();
}
