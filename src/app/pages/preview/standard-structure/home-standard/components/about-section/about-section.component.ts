import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHoverWrapperComponent } from '../../../../components/section-hover-wrapper/section-hover-wrapper.component';
import { ThemeColorsService } from '../../../../../../core/services/theme/theme-colors.service';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  templateUrl: './about-section.component.html',
  styleUrls: ['./about-section.component.scss'],
})
export class AboutSectionComponent {
  @Input() customizations: any;
  @Input() isMobileLayout: boolean = false;
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'restaurant';
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  private themeColorsService = inject(ThemeColorsService);

  // Default about section image
  defaultAboutImage = 'assets/standard-about/about-image.jpg';

  /**
   * Get business-specific about content
   */
  getAboutContent() {
    // Default content that will be overridden if customized
    const defaultContent = {
      title: this.getDefaultTitle(),
      subtitle: this.getDefaultSubtitle(),
      storyTitle: this.getDefaultStoryTitle(),
      storyText: this.getDefaultStoryText(),
      missionTitle: this.getDefaultMissionTitle(),
      missionText: this.getDefaultMissionText(),
      image: this.defaultAboutImage,
    };

    // Get customized content if available
    const customContent = this.customizations?.pages?.home?.about || {};

    // Merge default with custom, prioritizing custom values
    const mergedContent = { ...defaultContent, ...customContent };

    return mergedContent;
  }

  /**
   * Get about image or fallback
   */
  getAboutImage(): string {
    return (
      this.customizations?.pages?.home?.about?.image || this.defaultAboutImage
    );
  }

  /**
   * Handle section selection
   */
  handleSectionSelection(event: { key: string; name: string; path?: string }) {
    console.log('About section selected with event:', event);
    const selectionData = {
      key: event.key,
      name: event.name,
      path: event.path || 'pages.home.about',
    };
    console.log('Emitting selection data:', selectionData);
    this.sectionSelected.emit(selectionData);
  }

  /**
   * Get default title based on business type
   */
  getDefaultTitle(): string {
    const titles = {
      restaurant: 'About Our Restaurant',
      salon: 'About Our Salon',
      architecture: 'About Our Firm',
      portfolio: 'About Me',
    };

    return titles[this.businessType as keyof typeof titles] || 'About Us';
  }

  /**
   * Get default subtitle based on business type
   */
  getDefaultSubtitle(): string {
    const subtitles = {
      restaurant: 'The story behind our culinary passion',
      salon: 'Where beauty meets expertise',
      architecture: 'Creating innovative spaces since 2005',
      portfolio: 'My journey and expertise',
    };

    return (
      subtitles[this.businessType as keyof typeof subtitles] ||
      'Our story and mission'
    );
  }

  /**
   * Get default story title based on business type
   */
  getDefaultStoryTitle(): string {
    const titles = {
      restaurant: 'Our Culinary Journey',
      salon: 'Our Beginnings',
      architecture: 'Our Design Philosophy',
      portfolio: 'My Background',
    };

    return titles[this.businessType as keyof typeof titles] || 'Our Story';
  }

  /**
   * Get default story text based on business type
   */
  getDefaultStoryText(): string {
    const texts = {
      restaurant:
        'Founded in 2015, our restaurant brings together the finest ingredients and culinary expertise. Our chefs are dedicated to creating memorable dining experiences with innovative flavors and traditional techniques.',
      salon:
        'Established in 2010, our salon was born from a passion for beauty and self-expression. Weve assembled a team of experienced stylists who are committed to helping our clients look and feel their best.',
      architecture:
        'With over a decade of experience, our architectural firm specializes in blending functionality with aesthetic excellence. We approach each project with a fresh perspective, focusing on sustainable design and client satisfaction.',
      portfolio:
        'With a background in design and digital media, Ive spent the last 8 years honing my craft. My approach combines technical expertise with creative problem-solving to deliver exceptional results for clients across various industries.',
    };

    return (
      texts[this.businessType as keyof typeof texts] ||
      'We are a dedicated team of professionals committed to delivering exceptional value to our clients. With years of experience in the industry, we understand what it takes to help your business succeed.'
    );
  }

  /**
   * Get default mission title based on business type
   */
  getDefaultMissionTitle(): string {
    const titles = {
      restaurant: 'Our Food Philosophy',
      salon: 'Our Approach',
      architecture: 'Our Commitment',
      portfolio: 'My Approach',
    };

    return titles[this.businessType as keyof typeof titles] || 'Our Mission';
  }

  /**
   * Get default mission text based on business type
   */
  getDefaultMissionText(): string {
    const texts = {
      restaurant:
        'We believe in sustainable, locally-sourced ingredients that support our community while delivering exceptional flavor. Every dish is crafted with care, creating a dining experience that honors culinary traditions while embracing innovation.',
      salon:
        'We use only premium products and stay current with the latest techniques to ensure our clients receive the highest quality service. Our commitment to ongoing education and client satisfaction sets us apart.',
      architecture:
        'We are dedicated to creating spaces that inspire, function flawlessly, and exceed our clients expectations. Our collaborative approach ensures that each project reflects the unique vision and requirements of our clients.',
      portfolio:
        'I believe in a collaborative process that puts client needs first. My work blends creativity with functionality, ensuring that each project not only looks great but also achieves its strategic objectives.',
    };

    return (
      texts[this.businessType as keyof typeof texts] ||
      'Our mission is to provide high-quality services that exceed our clients expectations. We believe in building long-lasting relationships based on trust, integrity, and results.'
    );
  }

  /**
   * Check if we need to use direct attribute access (emergency solution)
   */
  checkDirectAttributeAccess(attribute: string, defaultValue: string): string {
    const directAccess = this.customizations?.pages?.home?.about?.[attribute];
    if (directAccess !== undefined) {
      return directAccess;
    }
    return defaultValue;
  }
}
