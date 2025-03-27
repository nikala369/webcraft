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

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss'],
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  @Input() customizations: any; // Full customizations object for global data like header
  @Input() heroData: any = {}; // Hero section specific data
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

  // Default background image for when none is specified
  defaultHeroImage = 'assets/standard-hero1/background-image1.jpg';

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
    this.sectionSelected.emit({
      key: event.key,
      name: event.name,
      path: event.path || 'pages.home.hero1',
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

    // Initial background position setup
    const bgStyle = getComputedStyle(heroSection).backgroundImage;
    if (!bgStyle || bgStyle === 'none') {
      return;
    }

    // Store the original background position
    const originalBgPos = getComputedStyle(heroSection).backgroundPosition;
    const heroContent = heroSection.querySelector(
      '.hero-content'
    ) as HTMLElement;

    // Create the scroll handler
    this.scrollHandler = () => {
      const scrollPosition = window.scrollY;
      const heroHeight = heroSection.offsetHeight;

      // Only apply effect when hero is in view
      if (scrollPosition <= heroHeight) {
        // Calculate parallax position
        const yPos = Math.round(scrollPosition * 0.4);

        // Split the original position into x and y
        const bgParts = originalBgPos.split(' ');
        // Keep x position, change only y position
        heroSection.style.backgroundPosition = `${bgParts[0]} calc(${bgParts[1]} + ${yPos}px)`;

        // Subtle opacity effect for content while scrolling
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
   * Get hero background image or fallback to default
   */
  getHeroBackground(): string {
    return this.heroData?.backgroundImage || this.defaultHeroImage;
  }

  /**
   * Get business logo or fallback
   */
  getLogoUrl(): string {
    return this.customizations?.header?.logoUrl || 'assets/logo.png';
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
   * Check if hero should display primary CTA button
   */
  shouldShowButton(): boolean {
    return this.heroData?.showPrimaryButton !== false;
  }

  /**
   * Get button text or fallback
   */
  getButtonText(): string {
    return this.heroData?.primaryButtonText || 'GET STARTED NOW';
  }

  /**
   * Get button color or fallback
   */
  getButtonColor(): string {
    return this.heroData?.primaryButtonColor || '#ffffff';
  }

  /**
   * Get button text color or fallback
   */
  getButtonTextColor(): string {
    return this.heroData?.primaryButtonTextColor || '#000000';
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
