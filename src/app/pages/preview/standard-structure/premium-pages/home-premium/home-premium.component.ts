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
    const homeData = this.premiumHomeData();
    console.log('[HomePremium] premiumHomeData:', homeData);
    const aboutPreview = homeData?.aboutPreview || {};
    console.log('[HomePremium] aboutPreviewData computed:', aboutPreview);
    return aboutPreview;
  });

  featuredPreviewData = computed(() => {
    return this.premiumHomeData()?.featuredPreview || {};
  });

  ctaData = computed(() => {
    return this.premiumHomeData()?.ctaSection || {};
  });

  handleSectionSelection(event: { key: string; name: string; path?: string }) {
    console.log('[HomePremium] handleSectionSelection received event:', event);
    console.log('[HomePremium] About to emit sectionSelected to parent');
    this.sectionSelected.emit(event);
  }

  handleSectionEdit(sectionId: string) {
    console.log(
      '[HomePremium] handleSectionEdit called with sectionId:',
      sectionId
    );

    // Emit the section selected event to open the customizer
    // Map sectionId to the correct path for premium home sections
    let sectionPath = '';
    let sectionName = '';

    switch (sectionId) {
      case 'hero1':
        sectionPath = 'pages.home.hero1';
        sectionName = 'Hero Section';
        break;
      case 'aboutPreview':
        sectionPath = 'pages.home.aboutPreview';
        sectionName = 'About Preview';
        break;
      case 'featuredPreview':
        sectionPath = 'pages.home.featuredPreview';
        sectionName = 'Featured Preview';
        break;
      case 'ctaSection':
        sectionPath = 'pages.home.ctaSection';
        sectionName = 'Call to Action';
        break;
      default:
        sectionPath = `pages.home.${sectionId}`;
        sectionName = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    }

    const eventData = {
      key: sectionId,
      name: sectionName,
      path: sectionPath,
    };

    console.log('[HomePremium] handleSectionEdit emitting event:', eventData);
    this.sectionSelected.emit(eventData);
  }
}
