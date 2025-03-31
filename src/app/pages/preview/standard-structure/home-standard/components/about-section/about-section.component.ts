import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnInit,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHoverWrapperComponent } from '../../../../components/section-hover-wrapper/section-hover-wrapper.component';
import { ThemeColorsService } from '../../../../../../core/services/theme/theme-colors.service';
import { BusinessConfigService } from '../../../../../../core/services/business-config/business-config.service';

interface AboutSectionData {
  title?: string;
  subtitle?: string;
  storyTitle?: string;
  storyText?: string;
  missionTitle?: string;
  missionText?: string;
  content?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  values?: string[];
  valuesTitle?: string;
}

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  templateUrl: './about-section.component.html',
  styleUrls: ['./about-section.component.scss'],
})
export class AboutSectionComponent implements OnInit {
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
  private businessConfigService = inject(BusinessConfigService);

  // Default about section image based on business type
  get defaultAboutImage(): string {
    return this.getBusinessTypeImage();
  }

  // Use HostBinding to apply custom styles directly to the host element
  @HostBinding('style.--section-bg-color') get sectionBgColor() {
    return this.getAboutContent().backgroundColor || '#ffffff';
  }

  @HostBinding('style.--text-color') get textColor() {
    return this.getAboutContent().textColor || '#333333';
  }

  @HostBinding('style.--heading-color') get headingColor() {
    return this.getAboutContent().textColor || '#333333';
  }

  @HostBinding('style.--text-color-rgb') get textColorRgb() {
    return this.hexToRgb(this.getAboutContent().textColor || '#333333');
  }

  @HostBinding('style.--theme-primary-color') get themePrimaryColor() {
    return this.themeColorsService.getPrimaryColor(this.planType);
  }

  @HostBinding('style.--theme-primary-color-rgb') get themePrimaryColorRgb() {
    return this.hexToRgb(
      this.themeColorsService.getPrimaryColor(this.planType)
    );
  }

  ngOnInit() {
    console.log('About section data:', this.customizations?.pages?.home?.about);
  }

  /**
   * Get business-specific default image
   */
  private getBusinessTypeImage(): string {
    // If we already have a custom image in the data, don't override it
    const customImage = this.customizations?.pages?.home?.about?.imageUrl;
    if (customImage && customImage.trim() !== '') {
      return customImage;
    }

    // Otherwise, use a business-type specific default
    const businessImages = {
      restaurant: 'assets/standard-hero1/background-image2.jpg',
      salon: 'assets/standard-hero1/background-image3.jpg',
      architecture: 'assets/standard-hero1/background-image1.jpg',
      portfolio: 'assets/standard-hero1/background-image3.jpg',
    };

    return (
      businessImages[this.businessType as keyof typeof businessImages] ||
      'assets/standard-hero1/background-image1.jpg'
    );
  }

  /**
   * Convert hex color to RGB format for CSS variables
   */
  private hexToRgb(hex: string): string {
    // Default to black if hex is invalid or undefined
    if (!hex || typeof hex !== 'string') {
      return '0, 0, 0';
    }

    // Remove # if present
    hex = hex.replace('#', '');

    // Handle shorthand (3 chars) hex
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }

    // Parse RGB values with fallbacks for invalid values
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;

    return `${r}, ${g}, ${b}`;
  }

  /**
   * Get business-specific about content with merged defaults
   */
  getAboutContent(): AboutSectionData {
    // Get customized content if available
    const customContent: AboutSectionData =
      this.customizations?.pages?.home?.about || {};

    // Get default content from BusinessConfigService if available
    // This is the preferred way to get defaults
    let defaultContent: AboutSectionData;
    try {
      defaultContent = this.businessConfigService.getDefaultAboutData(
        this.businessType
      );
    } catch (e) {
      // If BusinessConfigService fails, fall back to local defaults
      defaultContent = {
        title: this.getDefaultTitle(),
        subtitle: this.getDefaultSubtitle(),
        storyTitle: this.getDefaultStoryTitle(),
        storyText: this.getDefaultStoryText(),
        missionTitle: this.getDefaultMissionTitle(),
        missionText: this.getDefaultMissionText(),
        content: this.getDefaultMainContent(),
        imageUrl: this.defaultAboutImage,
        backgroundColor: '#ffffff',
        textColor: '#333333',
      };
    }

    // Use spread operator to merge, with custom content taking precedence
    const mergedContent = { ...defaultContent, ...customContent };

    // Ensure imageUrl is set
    if (!mergedContent.imageUrl || mergedContent.imageUrl.trim() === '') {
      mergedContent.imageUrl = this.defaultAboutImage;
    }

    return mergedContent;
  }

  /**
   * Get about image or fallback with proper check
   */
  getAboutImage(): string {
    const aboutContent = this.getAboutContent();
    return aboutContent.imageUrl || this.defaultAboutImage;
  }

  /**
   * Get default main content based on business type
   */
  getDefaultMainContent(): string {
    const content = {
      restaurant:
        'Our restaurant combines tradition with innovation to create unforgettable dining experiences. We focus on fresh, local ingredients and exceptional service.',
      salon:
        'At our salon, we believe in bringing out your natural beauty. Our team of experts is dedicated to providing personalized service and the latest trends.',
      architecture:
        'Our architecture firm creates spaces that inspire. We blend form and function to design buildings that are both beautiful and practical.',
      portfolio:
        'I create designs that communicate and connect. My work combines technical expertise with creative vision to deliver impactful results.',
    };

    return (
      content[this.businessType as keyof typeof content] ||
      'We are committed to excellence in everything we do. Our team of professionals works tirelessly to ensure we exceed your expectations.'
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
      restaurant: 'Our Culinary Story',
      salon: 'Excellence in Beauty',
      architecture: 'Creating Spaces That Inspire',
      portfolio: 'My Creative Journey',
    };

    return (
      subtitles[this.businessType as keyof typeof subtitles] || 'Our Story'
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
        "Established in 2010, our salon was born from a passion for beauty and self-expression. We've assembled a team of experienced stylists who are committed to helping our clients look and feel their best.",
      architecture:
        'With over a decade of experience, our architectural firm specializes in blending functionality with aesthetic excellence. We approach each project with a fresh perspective, focusing on sustainable design and client satisfaction.',
      portfolio:
        "With a background in design and digital media, I've spent the last 8 years honing my craft. My approach combines technical expertise with creative problem-solving to deliver exceptional results for clients across various industries.",
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
        "We are dedicated to creating spaces that inspire, function flawlessly, and exceed our clients' expectations. Our collaborative approach ensures that each project reflects the unique vision and requirements of our clients.",
      portfolio:
        'I believe in a collaborative process that puts client needs first. My work blends creativity with functionality, ensuring that each project not only looks great but also achieves its strategic objectives.',
    };

    return (
      texts[this.businessType as keyof typeof texts] ||
      "Our mission is to provide high-quality services that exceed our clients' expectations. We believe in building long-lasting relationships based on trust, integrity, and results."
    );
  }

  /**
   * Safely check for a specific property in the customization data
   */
  hasProp(prop: string): boolean {
    return this.customizations?.pages?.home?.about?.[prop] !== undefined;
  }
}
