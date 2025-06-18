import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionComponent } from '../../home-standard/components/hero-section/hero-section.component';
import { SectionHoverWrapperComponent } from '../../../components/section-hover-wrapper/section-hover-wrapper.component';
import { AboutPreviewSectionComponent } from './components/about-preview-section/about-preview-section.component';
import { FeaturedPreviewSectionComponent } from './components/featured-preview-section/featured-preview-section.component';
import { CtaSectionComponent } from './components/cta-section/cta-section.component';
import { Customizations } from '../../../../../core/models/website-customizations';

@Component({
  selector: 'app-home-premium',
  standalone: true,
  imports: [
    CommonModule,
    HeroSectionComponent,
    SectionHoverWrapperComponent,
    AboutPreviewSectionComponent,
    FeaturedPreviewSectionComponent,
    CtaSectionComponent,
  ],
  templateUrl: './home-premium.component.html',
  styleUrls: ['./home-premium.component.scss'],
})
export class HomePremiumComponent {
  @Input({ required: true }) premiumHomeData!: Signal<any>;
  @Input({ required: true }) wholeData!: Signal<Customizations | null>;
  @Input() isMobileLayout: boolean = false;
  @Input() isMobileView: string = 'view-desktop';
  @Input() planType: 'standard' | 'premium' = 'premium';
  @Input() businessType: string = 'restaurant';
  @Input() editable: boolean = true;
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  // Computed signals for each section's data
  heroData = computed(() => {
    return this.premiumHomeData()?.hero1 || {};
  });

  aboutPreviewData = computed(() => {
    return this.premiumHomeData()?.aboutPreview || {};
  });

  featuredPreviewData = computed(() => {
    return this.premiumHomeData()?.featuredPreview || {};
  });

  ctaData = computed(() => {
    return this.premiumHomeData()?.ctaSection || {};
  });

  handleSectionSelection(event: { key: string; name: string; path?: string }) {
    this.sectionSelected.emit(event);
  }

  handleSectionEdit(sectionId: string) {
    // Open the customizer or handle edit logic for the section
    // Example: emit an event, open a sidebar, etc.
    console.log('Edit requested for section:', sectionId);
    // You can emit an event or call a service here
  }
}
