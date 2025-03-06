import {
  Component,
  Input,
  Signal,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Customizations } from '../../preview.component';
import { SectionHoverWrapperComponent } from '../../components/section-hover-wrapper/section-hover-wrapper.component';

@Component({
  selector: 'app-home-standard',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  templateUrl: './home-standard.component.html',
  styleUrl: './home-standard.component.scss',
})
export class HomeStandardComponent implements OnInit {
  @Input() customizations!: Signal<any>;
  @Input() isMobileLayout!: boolean;
  @Input() isMobileView!: boolean;
  @Input() planType: string = 'standard';
  @Output() sectionSelected = new EventEmitter<string>();

  // Add default images aligned with small business needs
  defaultHeroImage = 'assets/images/placeholders/business-hero.jpg';
  defaultLogoImage = 'assets/header/webcraft-logo.svg';
  defaultServiceImages = [
    'assets/images/placeholders/service-1.jpg',
    'assets/images/placeholders/service-2.jpg',
    'assets/images/placeholders/service-3.jpg',
  ];
  defaultTeamImages = [
    'assets/images/placeholders/team-1.jpg',
    'assets/images/placeholders/team-2.jpg',
  ];
  defaultGalleryImages = [
    'assets/images/placeholders/gallery-1.jpg',
    'assets/images/placeholders/gallery-2.jpg',
    'assets/images/placeholders/gallery-3.jpg',
    'assets/images/placeholders/gallery-4.jpg',
  ];

  // For business-type specific content
  businessTypes = [
    'restaurant',
    'lawFirm',
    'architecture',
    'realEstate',
    'other',
  ];
  currentBusinessType = 'other';

  // Add this method to check if user has premium plan
  isPremiumPlan(): boolean {
    return this.planType === 'premium';
  }

  ngOnInit() {
    this.currentBusinessType = this.customizations()?.businessType || 'other';
    console.log(this.customizations(), 'customizations loaded');
  }

  handleSectionEdit(sectionKey: string) {
    console.log(`Editing section: ${sectionKey}`);
    this.sectionSelected.emit(`pages.home.${sectionKey}`);
  }

  getImageUrl(
    section: string,
    imageKey: string,
    defaultIndex: number = 0
  ): string {
    // First check if we have a custom image configured
    const sectionData = this.customizations()?.[section];
    if (sectionData?.[imageKey]) {
      return sectionData[imageKey];
    }

    // Extract base section type (e.g., 'hero1' -> 'hero')
    const baseSection = section.replace(/\d+$/, '');

    // Return appropriate default image based on section and key
    if (baseSection === 'hero' && imageKey === 'backgroundImage') {
      return this.defaultHeroImage;
    }

    if (imageKey === 'logo') {
      return this.defaultLogoImage;
    }

    if (baseSection === 'services') {
      return this.defaultServiceImages[
        defaultIndex % this.defaultServiceImages.length
      ];
    }

    if (baseSection === 'team') {
      return this.defaultTeamImages[
        defaultIndex % this.defaultTeamImages.length
      ];
    }

    if (baseSection === 'gallery') {
      return this.defaultGalleryImages[
        defaultIndex % this.defaultGalleryImages.length
      ];
    }

    // Return empty string if no default image applies
    return '';
  }

  getBackgroundStyle(section: string): object {
    const sectionData = this.customizations()?.[section];
    let imageUrl;

    if (section === 'hero') {
      imageUrl = sectionData?.backgroundImage || this.defaultHeroImage;
    } else {
      imageUrl = sectionData?.backgroundImage || '';
    }

    const overlay = sectionData?.overlay
      ? `rgba(0,0,0,${sectionData.overlay})`
      : 'rgba(43, 43, 43, 0.3)';

    if (!imageUrl) {
      return {
        'background-color': sectionData?.backgroundColor || '#f5f5f5',
      };
    }

    return {
      'background-image': `linear-gradient(${overlay}, ${overlay}), url(${imageUrl})`,
      'background-size': 'cover',
      'background-position': sectionData?.backgroundPosition || 'center',
    };
  }

  // For contact info
  getContactInfo(field: string): string {
    const contactInfo = this.customizations()?.contactInfo || {};
    const defaults: { [key: string]: string } = {
      phone: '(123) 456-7890',
      email: 'contact@yourbusiness.com',
      address: '123 Business St, City, State',
      hours: 'Mon-Fri: 9AM-5PM, Sat-Sun: Closed',
    };

    return contactInfo[field] || defaults[field] || '';
  }

  // Get social media links
  getSocialLink(platform: string): string {
    const social = this.customizations()?.social || {};
    return social[platform] || '#';
  }

  // Animation helper
  getAnimationDelay(index: number): object {
    return {
      'animation-delay': `${0.1 * index}s`,
    };
  }
}
