import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ElementRef,
  HostListener,
  inject,
  computed,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Signal } from '@angular/core';

// Import enhanced models
import {
  EnhancedHeroData,
  BusinessStatus,
  CTAClickEvent,
  AnimationState,
  PrimaryCTAConfig,
  ScrollIndicatorConfig,
  ParallaxConfig,
  HeroComputedProperties,
  ButtonActionType,
} from './hero-section.model';

// Import existing models for backwards compatibility
import {
  Customizations,
  HeroData,
} from '../../../../../../core/models/website-customizations';

// Import components and services
import { SectionHoverWrapperComponent } from '../../../../components/section-hover-wrapper/section-hover-wrapper.component';
import { ReactiveImageComponent } from '../../../../../../shared/components/reactive-image/reactive-image.component';
import { ThemeColorsService } from '../../../../../../core/services/theme/theme-colors.service';
import { BusinessConfigService } from '../../../../../../core/services/business-config/business-config.service';
import { ImageService } from '../../../../../../core/services/shared/image/image.service';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent, ReactiveImageComponent],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss'],
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  // ======== INPUTS ========
  @Input() customizations!: Customizations;
  @Input({ required: true }) data!: Signal<EnhancedHeroData>;
  @Input() isMobileLayout: boolean = false;
  @Input() isMobileView: string = 'view-desktop';
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'restaurant';
  @Input() editable: boolean = true;

  // ======== OUTPUTS (LAW 4: Decouple component) ========
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();
  @Output() ctaClicked = new EventEmitter<CTAClickEvent>();
  @Output() businessHoursClicked = new EventEmitter<void>();
  @Output() scrollIndicatorClicked = new EventEmitter<void>();

  // ======== SERVICES ========
  private themeColorsService = inject(ThemeColorsService);
  private businessConfigService = inject(BusinessConfigService);
  private imageService = inject(ImageService);
  private el = inject(ElementRef);

  // ======== STATE SIGNALS ========
  private scrollY = signal(0);
  private isInView = signal(true);
  private currentTime = signal(new Date());

  // ======== CONSTRUCTOR ========
  constructor() {
    // Effect to watch for image updates and trigger change detection
    effect(() => {
      const data = this.data();
      const backgroundImage = data?.backgroundImage;

      // Force re-evaluation when image data changes
      if (backgroundImage && typeof backgroundImage === 'string') {
        // This will trigger the backgroundImageUrl computed to re-evaluate
        console.log(
          '[HeroSection] Image data changed, re-evaluating URL:',
          backgroundImage
        );
      }
    });
  }

  // ======== PLAN GATING ========
  private isAnimationAllowed = computed(() => {
    const animation = this.data().textAnimation;
    if (this.planType === 'standard') {
      // Standard plan allows more text animations now
      return (
        animation === 'none' ||
        animation === 'fade' ||
        animation === 'slide' ||
        animation === 'typewriter' ||
        animation === 'word-by-word'
      );
    }
    return true; // Premium allows all
  });

  private isBackgroundAnimationAllowed = computed(() => {
    const animation = this.data().backgroundAnimation;
    if (this.planType === 'standard') {
      // Standard plan allows more animations now
      return (
        animation === 'none' ||
        animation === 'parallax' ||
        animation === 'zoom' ||
        animation === 'gradient-shift'
      );
    }
    return true; // Premium allows all
  });

  // ======== COMPUTED SIGNALS (LAW 1: Annihilate getters) ========

  // Hero content computed properties
  heroTitle = computed(() => {
    return this.data().title || this.getDefaultHeroTitle();
  });

  heroSubtitle = computed(() => {
    return this.data().subtitle || this.getDefaultHeroSubtitle();
  });

  layoutClass = computed(() => {
    const data = this.data();
    return `layout-${data?.layout || 'center'}`;
  });

  getHeroClasses = computed(() => {
    const backgroundClass = this.animationState().backgroundAnimationClass;
    return {
      'hero-section--mobile': this.isMobileLayout,
      [backgroundClass]: true,
    };
  });

  getContentClasses = computed(() => {
    const layoutClass = this.layoutClass();
    const textAnimationClass = this.animationState().textAnimationClass;
    return {
      [layoutClass]: true,
      [textAnimationClass]: true,
    };
  });

  getScrollIndicatorClasses = computed(() => {
    const scrollIndicatorClass = this.animationState().scrollIndicatorClass;
    const positionClass = `position-${
      this.scrollIndicator()?.position || 'center'
    }`;
    return {
      [scrollIndicatorClass]: true,
      [positionClass]: true,
    };
  });

  textShadowClass = computed(() => {
    const data = this.data();
    return `text-shadow-${data?.textShadow || 'medium'}`;
  });

  // Background computed properties
  backgroundType = computed(() => {
    if (this.data().backgroundType === 'video' && this.data().backgroundVideo) {
      return 'video';
    }
    return 'image';
  });

  backgroundImageUrl = computed(() => {
    if (this.data().backgroundType === 'video') {
      return '';
    }
    const backgroundImage = this.data().backgroundImage;
    if (backgroundImage) {
      // Check if it's a temporary file URL (from file upload)
      if (
        typeof backgroundImage === 'string' &&
        backgroundImage.startsWith('temp:')
      ) {
        return backgroundImage.replace('temp:', '');
      }

      // CRITICAL FIX: Make this reactive to ImageService cache updates
      // By reading the imageUpdateSignal, this computed will re-evaluate when images are cached
      const imageUpdate = this.imageService.getImageUpdateSignal()();

      // If there's an update for our current image, use the cached URL
      if (imageUpdate && imageUpdate.objectId === backgroundImage) {
        console.log(
          '[HeroSection] Using cached image URL:',
          imageUpdate.blobUrl
        );
        return imageUpdate.blobUrl;
      }

      // For regular objectId or URL, use the image service
      const imageUrl = this.imageService.getImageUrl(backgroundImage);
      console.log(
        '[HeroSection] Image URL resolved:',
        imageUrl,
        'for objectId:',
        backgroundImage
      );
      return imageUrl;
    }
    return this.defaultHeroImage;
  });

  backgroundVideoUrl = computed(() => {
    const backgroundVideo = this.data().backgroundVideo;
    if (backgroundVideo) {
      // CRITICAL FIX: Make this reactive to ImageService cache updates
      const imageUpdate = this.imageService.getImageUpdateSignal()();

      // If there's an update for our current video, use the cached URL
      if (imageUpdate && imageUpdate.objectId === backgroundVideo) {
        console.log(
          '[HeroSection] Using cached video URL:',
          imageUpdate.blobUrl
        );
        return imageUpdate.blobUrl;
      }

      return this.imageService.getImageUrl(backgroundVideo);
    }
    return '';
  });

  // Overlay computed properties
  overlayOpacity = computed(() => {
    return this.data().overlayOpacity || 'medium';
  });

  overlayColor = computed(() => {
    return this.data().overlayColor || '#000000';
  });

  // Content display computed properties
  shouldShowContentText = computed(() => {
    return this.data().showContentText !== false;
  });

  titleColor = computed(() => {
    return this.data().titleColor || '#ffffff';
  });

  subtitleColor = computed(() => {
    return this.data().subtitleColor || '#f0f0f0';
  });

  /**
   * Primary CTA configuration
   */
  primaryCTA = computed<PrimaryCTAConfig | null>(() => {
    const data = this.data();

    // Check if button should be shown
    if (!data.showButton) return null;

    // For standard plan, generate smart CTA
    if (this.planType === 'standard') {
      const smartDefaults = this.businessConfigService.getDefaultHero1Data(
        this.businessType
      );
      return {
        text: smartDefaults?.buttonText || 'Get Started',
        action: 'scroll' as ButtonActionType,
        scrollTarget: smartDefaults?.buttonScrollTargetID || 'contact',
        backgroundColor: data.buttonBackgroundColor || '#2876ff',
        textColor: data.buttonTextColor || '#ffffff',
      };
    }

    // For premium plan, use custom settings
    return {
      text: data.buttonText || 'Get Started',
      action: this.inferCTAAction(data.buttonLink || ''),
      scrollTarget: data.buttonScrollTargetID,
      link: data.buttonLink,
      backgroundColor: data.buttonBackgroundColor || '#2876ff',
      textColor: data.buttonTextColor || '#ffffff',
    };
  });

  /**
   * Infer CTA action type from link
   */
  private inferCTAAction(link: string): ButtonActionType {
    if (!link) return 'scroll';
    if (link.startsWith('#')) return 'scroll';
    if (
      link.startsWith('http') ||
      link.startsWith('tel:') ||
      link.startsWith('mailto:')
    )
      return 'link';
    return 'navigate';
  }

  /**
   * Business status computed property
   */
  businessStatus = computed<BusinessStatus | null>(() => {
    const businessHours = this.data().businessHours;
    if (!businessHours?.enabled) return null;

    const isOpen = businessHours.status === 'open';
    return {
      isOpen,
      message: businessHours.customMessage || (isOpen ? 'Open Now' : 'Closed'),
      nextChange: businessHours.nextChange,
    };
  });

  /**
   * Scroll indicator configuration
   */
  scrollIndicator = computed<ScrollIndicatorConfig | null>(() => {
    const scrollInd = this.data().scrollIndicator;
    if (!scrollInd?.enabled) return null;

    return {
      enabled: true,
      style: scrollInd.style || 'arrow',
      color: scrollInd.color || '#ffffff',
      position: scrollInd.position || 'bottom-center',
    };
  });

  // Animation computed properties with plan gating
  animationState = computed((): AnimationState => {
    const data = this.data();

    if (!data) {
      return {
        textAnimationClass: 'hero-text-fade',
        backgroundAnimationClass: 'hero-bg-none',
        scrollIndicatorClass: 'scroll-indicator-arrow',
        businessHoursClass: 'business-hours-widget',
      };
    }

    // Gate text animations for standard plan (allow more animations)
    let textAnimation = data.textAnimation || 'fade';
    if (
      this.planType === 'standard' &&
      !['none', 'fade', 'slide', 'typewriter', 'word-by-word'].includes(
        textAnimation
      )
    ) {
      textAnimation = 'fade'; // Fallback to allowed animation
    }

    // Gate background animations for standard plan (allow more animations)
    let backgroundAnimation = data.backgroundAnimation || 'none';
    if (
      this.planType === 'standard' &&
      !['none', 'parallax', 'zoom', 'gradient-shift'].includes(
        backgroundAnimation
      )
    ) {
      backgroundAnimation = 'none'; // Fallback to allowed animation
    }

    const scrollIndicatorStyle = this.scrollIndicator()?.style || 'arrow';

    return {
      textAnimationClass: `hero-text-${textAnimation}`,
      backgroundAnimationClass: `hero-bg-${backgroundAnimation}`,
      scrollIndicatorClass: `scroll-indicator-${scrollIndicatorStyle}`,
      businessHoursClass: 'business-hours-widget',
    };
  });

  /**
   * Parallax configuration based on plan
   */
  parallaxConfig = computed<ParallaxConfig>(() => {
    const data = this.data();
    const backgroundAnimation = data.backgroundAnimation;
    const isParallaxEnabled =
      backgroundAnimation === 'parallax' || backgroundAnimation === 'ken-burns';

    if (!isParallaxEnabled) {
      return {
        enabled: false,
        intensity: 0,
      };
    }

    // Standard plan: fixed subtle parallax
    if (this.planType === 'standard') {
      return {
        enabled: true,
        intensity: 0.3, // Fixed subtle effect
      };
    }

    // Premium plan: configurable parallax
    const intensity = data.parallaxIntensity ?? 0.5;
    return {
      enabled: true,
      intensity: intensity,
    };
  });

  /**
   * Calculate parallax transform based on scroll position
   */
  parallaxTransform = computed(() => {
    if (!this.parallaxConfig().enabled) return 'none';

    const offset = this.scrollY() * this.parallaxConfig().intensity;
    const maxOffset = 300; // Maximum parallax offset in pixels
    const clampedOffset = Math.min(Math.max(offset, -maxOffset), maxOffset);

    return `translateY(${clampedOffset}px)`;
  });

  // Content opacity for fade effect
  contentOpacity = computed(() => {
    if (!this.parallaxConfig().enabled) return 1;

    const heroHeight = 680; // Default hero height
    const opacity = Math.max(1 - this.scrollY() / (heroHeight * 0.8), 0.2);
    return opacity;
  });

  // ======== LIFECYCLE HOOKS ========
  ngOnInit() {
    // Initialize current time update
    this.initTimeUpdate();

    // Add intersection observer for performance
    this.initIntersectionObserver();

    // DO NOT auto-call handleSectionEdit() - this causes sidebar to open automatically
    // handleSectionEdit() should only be called when user clicks edit button
  }

  ngOnDestroy() {
    // Cleanup will be handled by takeUntilDestroyed
  }

  // ======== EVENT HANDLERS (LAW 2: Declarative event handling) ========
  @HostListener('window:scroll')
  onWindowScroll() {
    if (this.isInView()) {
      this.scrollY.set(window.scrollY);
    }
  }

  handleSectionEdit(sectionKey: string = 'hero1') {
    this.sectionSelected.emit({
      key: 'pages.home.hero1',
      name: 'Hero Section',
      path: 'pages.home.hero1',
    });
  }

  /**
   * Handle primary CTA click
   */
  handlePrimaryCTAClick(): void {
    const cta = this.primaryCTA();
    if (!cta) return;

    const event: CTAClickEvent = {
      action: cta.action,
      scrollTarget: cta.scrollTarget,
      link: cta.link,
      source: 'primary',
    };

    this.ctaClicked.emit(event);

    // Also handle scroll directly if it's a scroll action
    if (cta.action === 'scroll' && cta.scrollTarget) {
      const targetElement = document.getElementById(cta.scrollTarget);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  handleBusinessHoursClick() {
    this.businessHoursClicked.emit();
  }

  handleScrollIndicatorClick() {
    this.scrollIndicatorClicked.emit();

    // Scroll to next section
    const nextSection = this.el.nativeElement.nextElementSibling;
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ======== PRIVATE METHODS ========
  private initTimeUpdate() {
    // Update time every minute for business hours
    setInterval(() => {
      this.currentTime.set(new Date());
    }, 60000);
  }

  private initIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isInView.set(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(this.el.nativeElement);
  }

  private getDefaultHeroTitle(): string {
    const defaults = this.businessConfigService.getDefaultHero1Data(
      this.businessType
    );
    return defaults?.title || 'Welcome to Our Business';
  }

  private getDefaultHeroSubtitle(): string {
    const defaults = this.businessConfigService.getDefaultHero1Data(
      this.businessType
    );
    return defaults?.subtitle || 'We are here to serve you';
  }

  // Default hero image based on business type
  private get defaultHeroImage(): string {
    const businessTypeImages: Record<string, string> = {
      restaurant: 'assets/standard-hero1/background-image1.jpg',
      salon: 'assets/standard-hero1/background-image2.jpg',
      fitness: 'assets/standard-hero1/background-image3.jpg',
      default: 'assets/standard-hero1/background-image1.jpg',
    };

    return (
      businessTypeImages[this.businessType] || businessTypeImages['default']
    );
  }
}
