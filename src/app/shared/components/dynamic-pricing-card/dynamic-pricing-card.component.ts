import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PricingFeature {
  text: string;
}

@Component({
  selector: 'app-dynamic-pricing-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dynamic-pricing-card.component.html',
  styleUrls: ['./dynamic-pricing-card.component.scss'],
})
export class DynamicPricingCardComponent {
  @Input() type: 'standard' | 'premium' = 'standard';
  @Input() title: string = '';
  @Input() price: string = '';
  @Input() oldPrice?: string;
  @Input() description: string = '';
  @Input() features: PricingFeature[] = [];
  @Input() buttonText: string = '';
  @Input() badge?: string;

  @Output() buttonClick = new EventEmitter<'standard' | 'premium'>();

  onButtonClick(): void {
    this.buttonClick.emit(this.type);
  }
}
