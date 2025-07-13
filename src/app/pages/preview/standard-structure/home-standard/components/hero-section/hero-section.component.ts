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
import { ReactiveImageComponent } from '../../../../../../shared/components/reactive-image/reactive-image.component';
import { ThemeColorsService } from '../../../../../../core/services/theme/theme-colors.service';
import { BusinessConfigService } from '../../../../../../core/services/business-config/business-config.service';
import {
  Customizations,
  HeroData,
} from '../../../../../../core/models/website-customizations';
import { ImageService } from '../../../../../../core/services/shared/image/image.service';
import { Signal } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent, ReactiveImageComponent],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss'],
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  @Input() customizations!: any; // ! operator indicates definite assignment
  @Input({ required: true }) data!: Signal<any>;
  @Input() isMobileLayout: boolean = false;
  @Input() isMobileView: string = 'view-desktop';
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'restaurant';
  @Input() editable: boolean = true;
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  private themeColorsService = inject(ThemeColorsService);
  private businessConfigService = inject(BusinessConfigService);
  private imageService = inject(ImageService);
  private el = inject(ElementRef);
  private scrollHandler: (() => void) | null = null;

  // Default assets
  defaultHeroImage = 'assets/standard-hero1/background-image1.jpg';
  defaultHeroVideo = 'assets/standard-hero1/background-video.mp4';

  ngOnInit() {
    // Disabled scroll effects to prevent unwanted movement
    // Only enable parallax in standard plan
    // if (this.planType === 'standard') {
    //   setTimeout(() => {
    //     this.initHeroScrollEffects();
    //   }, 100);
    // }
  }

  ngOnDestroy() {
    // Clean up event listeners
    if (this.scrollHandler && this.planType === 'standard') {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }

  /**
   * Handle section selection
   */
  handleSectionSelection(event: { key: string; name: string; path?: string }) {
    // Ensure we have the correct path
    const path = event.path || 'pages.home.hero1';
    this.sectionSelected.emit({
      key: event.key,
      name: event.name,
      path: path,
    });
  }

  handleSectionEdit(sectionId: string) {
    // Emit the section selected event to open the customizer
    console.log('Edit requested for section:', sectionId);
    this.sectionSelected.emit({
      key: 'pages.home.hero1',
      name: 'Hero Section',
      path: 'pages.home.hero1',
    });
  }

  // Initialize smooth parallax scroll effect for hero section
  private initHeroScrollEffects() {
    if (typeof window === 'undefined' || this.isMobileLayout) {
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
      this.data()?.backgroundType === 'video' &&
      this.data()?.backgroundVideo
    ) {
      return 'video';
    }

    // If explicitly set to image OR we have an image (or no explicit setting), use image
    if (
      this.data()?.backgroundType === 'image' ||
      this.data()?.backgroundImage ||
      !this.data()?.backgroundType
    ) {
      return 'image';
    }

    // Fallback - if video is specified but we don't have one, still use video
    return this.data()?.backgroundType || 'image';
  }

  /**
   * Get hero background image or fallback to default
   */
  getHeroBackground(): string {
    // If it's explicitly set to video background, don't use image
    if (this.data()?.backgroundType === 'video') {
      return '';
    }

    const backgroundImage = this.data()?.backgroundImage;
    if (backgroundImage) {
      return this.imageService.getImageUrl(backgroundImage);
    }

    return this.defaultHeroImage;
  }

  /**
   * Get hero background video or fallback to default
   */
  getHeroBackgroundVideo(): string {
    // If it's explicitly set to image background, don't use video
    if (
      this.data()?.backgroundType === 'image' ||
      !this.data()?.backgroundType
    ) {
      return '';
    }

    const backgroundVideo = this.data()?.backgroundVideo;
    if (backgroundVideo) {
      return this.imageService.getImageUrl(backgroundVideo);
    }

    return this.defaultHeroVideo;
  }

  /**
   * Get overlay opacity class
   */
  getOverlayOpacity(): string {
    return this.data()?.overlayOpacity || 'medium';
  }

  /**
   * Get overlay color with transparency
   */
  getOverlayColor(): string {
    // Return the overlay color or default to black
    return this.data()?.overlayColor || '#000000';
  }

  /**
   * Check if content text should be displayed
   */
  shouldShowContentText(): boolean {
    return this.data()?.showContentText !== false;
  }

  /**
   * Get hero title or fallback
   */
  getHeroTitle(): string {
    return this.data()?.title || this.getDefaultHeroTitle();
  }

  /**
   * Get hero subtitle or fallback
   */
  getHeroSubtitle(): string {
    return this.data()?.subtitle || this.getDefaultHeroSubtitle();
  }

  /**
   * Get layout for hero content positioning
   */
  getLayout(): string {
    return this.data()?.layout || 'center';
  }

  /**
   * Get text shadow class for hero text
   */
  getTextShadow(): string {
    return 'text-shadow-' + (this.data()?.textShadow || 'medium');
  }

  /**
   * Get title color or fallback
   */
  getTitleColor(): string {
    return this.data()?.titleColor || '#ffffff';
  }

  /**
   * Get subtitle color or fallback
   */
  getSubtitleColor(): string {
    return this.data()?.subtitleColor || '#f0f0f0';
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

  // ======== CTA BUTTON METHODS ========

  /**
   * Check if CTA button should be displayed
   */
  shouldShowButton(): boolean {
    return this.data()?.showButton !== false;
  }

  /**
   * Get CTA button text (auto-generated based on business type)
   */
  getButtonText(): string {
    // Use the smart CTA defaults directly from business config service
    const smartDefaults = this.businessConfigService.getDefaultHero1Data(
      this.businessType
    );
    return (
      this.data()?.buttonText || smartDefaults?.buttonText || 'Get Started'
    );
  }

  /**
   * Get CTA button background color
   */
  getButtonBackgroundColor(): string {
    return this.data()?.buttonBackgroundColor || '#2876ff';
  }

  /**
   * Get CTA button text color
   */
  getButtonTextColor(): string {
    return this.data()?.buttonTextColor || '#ffffff';
  }

  /**
   * Handle CTA button click - smooth scroll to target section
   */
  handleCtaClick(): void {
    // Use smart defaults from business config service
    const smartDefaults = this.businessConfigService.getDefaultHero1Data(
      this.businessType
    );
    const targetId =
      this.data()?.buttonScrollTargetID ||
      smartDefaults?.buttonScrollTargetID ||
      'contact';

    console.log(
      `[HeroSection] CTA clicked for business type: ${this.businessType}, scrolling to: ${targetId}`
    );
    this.scrollToSection(targetId);
  }

  /**
   * Smooth scroll to a section by ID
   */
  private scrollToSection(sectionId: string): void {
    console.log(`[HeroSection] Attempting to scroll to section: ${sectionId}`);

    // Wait a bit for DOM to be ready
    setTimeout(() => {
      // Find the target element using multiple strategies
      let targetElement = document.getElementById(sectionId);

      if (!targetElement) {
        // Try with section selector
        targetElement = document.querySelector(
          `section#${sectionId}`
        ) as HTMLElement;
      }

      if (!targetElement) {
        // Try within the structure container
        const structureContainer = document.querySelector(
          '.structure-container'
        );
        if (structureContainer) {
          targetElement = structureContainer.querySelector(
            `#${sectionId}`
          ) as HTMLElement;
        }
      }

      if (!targetElement) {
        // Try finding any element with the matching ID attribute
        targetElement = document.querySelector(
          `[id="${sectionId}"]`
        ) as HTMLElement;
      }

      if (targetElement) {
        console.log(`[HeroSection] Target element found:`, targetElement);

        // Simple scrollIntoView approach that works in all cases
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });

        console.log(
          `[HeroSection] Scrolled to ${sectionId} using scrollIntoView`
        );
      } else {
        console.warn(
          `[HeroSection] Target section "${sectionId}" not found for CTA button scroll`
        );
        console.log(
          '[HeroSection] Available elements with IDs:',
          Array.from(document.querySelectorAll('[id]')).map((el) => el.id)
        );
      }
    }, 100); // Small delay to ensure DOM is ready
  }
}
