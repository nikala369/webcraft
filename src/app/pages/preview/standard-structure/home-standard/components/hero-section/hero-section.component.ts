import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHoverWrapperComponent } from '../../../../components/section-hover-wrapper/section-hover-wrapper.component';
import { ThemeColorsService } from '../../../../../../core/services/theme/theme-colors.service';
import {
  Customizations,
  HeroData,
} from '../../../../../../core/models/website-customizations';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss'],
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  @Input() customizations!: Customizations; // ! operator indicates definite assignment
  @Input() heroData: Partial<HeroData> = {}; // Partial allows for empty or partial implementations
  @Input() isMobileLayout: boolean = false;
  @Input() isMobileView: any;
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'restaurant';
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  private themeColorsService = inject(ThemeColorsService);
  private el = inject(ElementRef);
  private scrollHandler: (() => void) | null = null;

  // Default assets
  defaultHeroImage = 'assets/standard-hero1/background-image1.jpg';
  defaultHeroVideo = 'assets/standard-hero1/background-video.mp4';

  ngOnInit() {
    // Set scroll effects for parallax
    setTimeout(() => {
      this.initHeroScrollEffects();
    }, 100);
  }

  ngOnDestroy() {
    // Clean up event listeners
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }

  /**
   * Handle section selection
   */
  handleSectionSelection(event: { key: string; name: string; path?: string }) {
    console.log(
      'Hero section - handling section selection with heroData:',
      this.heroData
    );
    console.log(
      'Current heroData:',
      JSON.stringify(this.heroData || {}, null, 2)
    );

    // Ensure we have the correct path
    const path = event.path || 'pages.home.hero1';

    this.sectionSelected.emit({
      key: event.key,
      name: event.name,
      path: path,
    });
  }

  // Initialize smooth parallax scroll effect for hero section
  private initHeroScrollEffects() {
    if (typeof window === 'undefined' || this.isMobileView) {
      return;
    }

    const heroSection = this.el.nativeElement.querySelector(
      '.hero-section'
    ) as HTMLElement;
    if (!heroSection) {
      return;
    }

    // Check if we're dealing with image or video background
    const isVideo = this.getBackgroundType() === 'video';
    let bgElement = isVideo
      ? heroSection.querySelector('.hero-background-video')
      : heroSection.querySelector('.hero-background-image');

    if (!bgElement) return;

    // Create the scroll handler
    this.scrollHandler = () => {
      const scrollPosition = window.scrollY;
      const heroHeight = heroSection.offsetHeight;

      // Only apply effect when hero is in view
      if (scrollPosition <= heroHeight) {
        // Calculate parallax position
        const yPos = Math.round(scrollPosition * 0.4);

        // Apply parallax effect
        if (isVideo) {
          // For video, we can only translate
          (
            bgElement as HTMLElement
          ).style.transform = `translateX(-50%) translateY(calc(-50% + ${yPos}px))`;
        } else {
          // For images we can use background-position or transform
          (bgElement as HTMLElement).style.transform = `translateY(${yPos}px)`;
        }

        // Adjust opacity of hero content
        const heroContent = heroSection.querySelector(
          '.hero-content'
        ) as HTMLElement;

        if (heroContent) {
          // Reduce opacity as user scrolls down
          const opacity = Math.max(
            1 - scrollPosition / (heroHeight * 0.8),
            0.2
          );
          heroContent.style.opacity = opacity.toString();
        }
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', this.scrollHandler);
  }

  /**
   * Get background type (image or video)
   */
  getBackgroundType(): 'image' | 'video' {
    // If explicitly set to video AND we have a video, use video
    if (
      this.heroData?.backgroundType === 'video' &&
      this.heroData?.backgroundVideo
    ) {
      return 'video';
    }

    // If explicitly set to image OR we have an image (or no explicit setting), use image
    if (
      this.heroData?.backgroundType === 'image' ||
      this.heroData?.backgroundImage ||
      !this.heroData?.backgroundType
    ) {
      return 'image';
    }

    // Fallback - if video is specified but we don't have one, still use video
    return this.heroData?.backgroundType || 'image';
  }

  /**
   * Get hero background image or fallback to default
   */
  getHeroBackground(): string {
    // If it's explicitly set to video background, don't use image
    if (this.heroData?.backgroundType === 'video') {
      return '';
    }

    return this.heroData?.backgroundImage || this.defaultHeroImage;
  }

  /**
   * Get hero background video or fallback to default
   */
  getHeroBackgroundVideo(): string {
    // If it's explicitly set to image background, don't use video
    if (
      this.heroData?.backgroundType === 'image' ||
      !this.heroData?.backgroundType
    ) {
      return '';
    }

    return this.heroData?.backgroundVideo || this.defaultHeroVideo;
  }

  /**
   * Get overlay opacity class
   */
  getOverlayOpacity(): string {
    return this.heroData?.overlayOpacity || 'medium';
  }

  /**
   * Get overlay color with transparency
   */
  getOverlayColor(): string {
    // Return the overlay color or default to black
    return this.heroData?.overlayColor || '#000000';
  }

  /**
   * Check if content text should be displayed
   */
  shouldShowContentText(): boolean {
    return this.heroData?.showContentText !== false;
  }

  /**
   * Get business logo or fallback
   */
  getLogoUrl(): string {
    return (
      this.customizations?.header?.logoUrl ||
      'assets/standard-header/default-logo-white.svg'
    );
  }

  /**
   * Check if logo should be displayed
   */
  shouldShowLogo(): boolean {
    return this.heroData?.showLogo !== false;
  }

  /**
   * Get hero title or fallback
   */
  getHeroTitle(): string {
    return this.heroData?.title || this.getDefaultHeroTitle();
  }

  /**
   * Get hero subtitle or fallback
   */
  getHeroSubtitle(): string {
    return this.heroData?.subtitle || this.getDefaultHeroSubtitle();
  }

  /**
   * Get layout for hero content positioning
   */
  getLayout(): string {
    return this.heroData?.layout || 'center';
  }

  /**
   * Get text shadow class for hero text
   */
  getTextShadow(): string {
    return 'text-shadow-' + (this.heroData?.textShadow || 'medium');
  }

  /**
   * Get title color or fallback
   */
  getTitleColor(): string {
    return this.heroData?.titleColor || '#ffffff';
  }

  /**
   * Get subtitle color or fallback
   */
  getSubtitleColor(): string {
    return this.heroData?.subtitleColor || '#f0f0f0';
  }

  /**
   * Get business-type specific default hero title
   */
  private getDefaultHeroTitle(): string {
    const titles = {
      restaurant: 'Exceptional Dining Experience',
      salon: 'Beauty & Style Redefined',
      architecture: 'Innovative Architectural Solutions',
      portfolio: 'Creative Work That Stands Out',
    };

    return (
      titles[this.businessType as keyof typeof titles] ||
      'Welcome to Our Business'
    );
  }

  /**
   * Get business-type specific default hero subtitle
   */
  private getDefaultHeroSubtitle(): string {
    const subtitles = {
      restaurant: 'Delicious cuisine in an unforgettable atmosphere',
      salon: 'Expert stylists dedicated to bringing out your natural beauty',
      architecture: 'Transforming spaces into exceptional experiences',
      portfolio: 'Showcasing creativity and skill in every project',
    };

    return (
      subtitles[this.businessType as keyof typeof subtitles] ||
      'Professional solutions tailored to your needs'
    );
  }
}
