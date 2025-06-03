import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  computed,
  signal,
  inject,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Signal,
  OnDestroy,
} from '@angular/core';
import { StructureHeaderComponent } from '../components/structure-header/structure-header.component';
import { StructureFooterComponent } from '../components/structure-footer/structure-footer.component';
import { CommonModule } from '@angular/common';
import { Customizations } from '../../../core/models/website-customizations';
import { SectionHoverWrapperComponent } from '../components/section-hover-wrapper/section-hover-wrapper.component';
import { Router } from '@angular/router';
import { HomeStandardComponent } from './home-standard/home-standard.component';
import { FontOption } from '../components/font-selector/font-selector.component';
import { BUSINESS_TYPE_SECTIONS } from '../../../core/models/business-types';
import { AboutPremiumComponent } from './premium-pages/about-premium/about-premium.component';
import { ContactPremiumComponent } from './premium-pages/contact-premium/contact-premium.component';
import { MenuPremiumComponent } from './premium-pages/menu-premium/menu-premium.component';
import { HomePremiumComponent } from './premium-pages/home-premium/home-premium.component';

@Component({
  selector: 'app-standard-structure',
  standalone: true,
  imports: [
    StructureHeaderComponent,
    StructureFooterComponent,
    SectionHoverWrapperComponent,
    HomeStandardComponent,
    HomePremiumComponent,
    AboutPremiumComponent,
    ContactPremiumComponent,
    MenuPremiumComponent,
    CommonModule,
  ],
  templateUrl: './standard-structure.component.html',
  styleUrls: ['./standard-structure.component.scss'],
})
export class StandardStructureComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('structureContainer') structureContainer!: ElementRef;
  @ViewChild(HomeStandardComponent) homeComponent!: HomeStandardComponent;

  // Accept the signal directly, allowing null
  @Input({ required: true }) customizations!: Signal<Customizations | null>;
  @Input() isMobileLayout = false;
  @Input() isMobileView: any;
  @Input() isViewOnly: any;
  @Input() selectedFont: FontOption | null = null;
  @Input() currentPage: string = 'home';
  @Input() currentPlan: any;
  @Input() businessType: string = '';

  // When a section is clicked, we emit an event with the section key.
  @Output() componentSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  // Track active section for highlighting in navigation
  activeSection = signal<string>('hero');

  // Section references for scrolling
  sectionRefs: { [key: string]: HTMLElement } = {};

  // Intersection observer for tracking active sections
  private intersectionObserver?: IntersectionObserver;

  constructor(private router: Router, private el: ElementRef) {}

  // Standard customizations signal
  // ------------------------------------------------------------
  homeCustomizationsSignal = computed(() => {
    const cust = this.customizations();
    const homeData = cust?.pages?.home || {};
    return homeData;
  });
  // ------------------------------------------------------------

  // Premium customizations signal
  // ------------------------------------------------------------
  premiumHomeCustomizationsSignal = computed(() => {
    const cust = this.customizations();
    return cust?.pages?.['home'] || {};
  });

  premiumMenuCustomizationsSignal = computed(() => {
    const cust = this.customizations();
    return cust?.pages?.['menu'] || {};
  });

  premiumAboutCustomizationsSignal = computed(() => {
    const cust = this.customizations();
    return cust?.pages?.['about'] || {};
  });

  premiumContactCustomizationsSignal = computed(() => {
    const cust = this.customizations();
    return cust?.pages?.['contact'] || {};
  });

  premiumServicesCustomizationsSignal = computed(() => {
    const cust = this.customizations();
    return cust?.pages?.['services'] || {};
  });

  // ------------------------------------------------------------

  // Standard customizations signal
  // ------------------------------------------------------------

  contactCustomizationsSignal = computed(() => {
    const cust = this.customizations();
    return cust?.pages?.['contact'] || {};
  });

  servicesCustomizationsSignal = computed(() => {
    const cust = this.customizations();
    return cust?.pages?.['services'] || {};
  });

  // Computed signal for the whole data structure, handling null
  wholeDataSignal = computed(() => {
    const fullData = this.customizations();
    return fullData;
  });

  // Computed signal for available sections based on business type
  availableSections = computed(() => {
    if (this.businessType && this.currentPlan) {
      return (
        BUSINESS_TYPE_SECTIONS[
          this.businessType as keyof typeof BUSINESS_TYPE_SECTIONS
        ]?.[this.currentPlan as 'standard' | 'premium'] || [
          'hero',
          'about',
          'services',
          'contact',
        ]
      );
    }
    return ['hero', 'about', 'services', 'contact']; // Default sections
  });

  ngOnInit() {
    console.log(this.customizations(), 'main data in standard structure');
    console.log('Current page in standard structure:', this.currentPage);
    console.log('Current plan in standard structure:', this.currentPlan);
    console.log('Business type in standard structure:', this.businessType);
    console.log('Available sections:', this.availableSections());
  }

  ngAfterViewInit() {
    // Find all sections in the home component for scrolling
    setTimeout(() => {
      this.findSectionElements();
      if (this.currentPlan === 'standard') {
        this.setupIntersectionObserver();
      }
    }, 500); // Reduced delay for faster initialization
  }

  ngOnDestroy() {
    // Clean up intersection observer
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  // Find all section elements for scrolling
  findSectionElements() {
    if (!this.structureContainer) {
      return;
    }

    const container = this.structureContainer.nativeElement;
    const sections = this.availableSections();
    let foundCount = 0;

    sections.forEach((sectionId) => {
      // Try multiple selectors to find the section
      let sectionEl =
        container.querySelector(`#${sectionId}`) ||
        container.querySelector(`[id="${sectionId}"]`) ||
        document.getElementById(sectionId);

      if (sectionEl) {
        this.sectionRefs[sectionId] = sectionEl;
        foundCount++;
      }
    });

    // If we didn't find all sections, retry with exponential backoff
    if (foundCount < sections.length && foundCount < 10) {
      // Prevent infinite retries
      const retryDelay = Math.min(500 * Math.pow(1.5, foundCount), 3000); // Max 3 seconds
      setTimeout(() => {
        this.findSectionElements();
      }, retryDelay);
    } else if (foundCount === sections.length) {
      // All sections found successfully!
    }
  }

  // Setup intersection observer for tracking active sections (Standard plan only)
  setupIntersectionObserver() {
    if (typeof window === 'undefined' || this.currentPlan !== 'standard') {
      return;
    }

    const options = {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // Trigger when section is 20% from top
      threshold: 0.1,
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          if (sectionId && this.activeSection() !== sectionId) {
            this.activeSection.set(sectionId);
          }
        }
      });
    }, options);

    // Observe all section elements
    Object.values(this.sectionRefs).forEach((sectionEl) => {
      this.intersectionObserver?.observe(sectionEl);
    });
  }

  // Add a convenience method
  getFontFamily(): string {
    if (!this.selectedFont) return '';
    return `${this.selectedFont.family}, ${this.selectedFont.fallback}`;
  }

  handleComponentSelection(componentKey: string): void {
    if (this.isViewOnly) return;

    // Create a simple object with a key and name.
    const selectedData = {
      key: componentKey,
      name: componentKey.charAt(0).toUpperCase() + componentKey.slice(1),
    };
    this.componentSelected.emit(selectedData);
  }

  handlePageSectionEdit(
    event: string | { key: string; name: string; path?: string }
  ) {
    let fullPath: string;

    // Handle both string and object event types
    if (typeof event === 'string') {
      fullPath = event;
    } else {
      fullPath = event.path || event.key;
    }

    // Split the fullPath, e.g. "pages.home.hero1" → ["pages", "home", "hero1"]
    const pathParts = fullPath.split('.');

    // Create a friendly name from the parts: "Pages Home Hero1"
    const sectionName = pathParts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    // Emit the event with the full key so that dynamic sidebar can look up "pages.home.hero1"
    this.componentSelected.emit({
      key: fullPath,
      name: sectionName,
      path: fullPath,
    });
  }

  // Handle section scrolling (from header navigation)
  handleSectionScroll(sectionId: string) {
    // Detect fullscreen mode by checking for .fullscreen-mode on body or parent
    const isFullscreen =
      document.body.classList.contains('fullscreen-mode') ||
      (this.structureContainer &&
        this.structureContainer.nativeElement.closest('.fullscreen-mode'));

    // Find the section element
    let sectionEl = this.sectionRefs[sectionId];
    if (!sectionEl) {
      sectionEl =
        document.getElementById(sectionId) ||
        document.querySelector(`#${sectionId}`) ||
        document.querySelector(`[id="${sectionId}"]`) ||
        (this.structureContainer?.nativeElement?.querySelector(
          `#${sectionId}`
        ) as HTMLElement);
      if (sectionEl) {
        this.sectionRefs[sectionId] = sectionEl;
      }
    }

    if (sectionEl) {
      // Dynamically calculate header height
      let headerHeight = 0;
      const headerEl = document.querySelector('header.structure-header');
      if (headerEl) {
        headerHeight = (headerEl as HTMLElement).offsetHeight;
      } else {
        headerHeight = 80; // fallback
      }

      // Scroll the correct container
      if (isFullscreen && this.structureContainer) {
        // Scroll the structure container
        const container = this.structureContainer.nativeElement;
        const elementPosition = sectionEl.offsetTop;
        const offsetPosition = Math.max(0, elementPosition - headerHeight);
        container.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      } else {
        // Scroll the window
        const elementPosition =
          sectionEl.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = Math.max(0, elementPosition - headerHeight);
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }

      // Fallback: use scrollIntoView if above fails (no delay)
      const scrolledEnough = isFullscreen
        ? Math.abs(
            this.structureContainer.nativeElement.scrollTop -
              (sectionEl.offsetTop - headerHeight)
          ) < 10
        : Math.abs(
            window.scrollY -
              (sectionEl.getBoundingClientRect().top +
                window.scrollY -
                headerHeight)
          ) < 10;
      if (!scrolledEnough) {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Update active section immediately for better UX
      this.activeSection.set(sectionId);
    }
  }

  // Get current active section for header navigation
  getCurrentActiveSection(): string {
    return this.activeSection();
  }

  // For premium structure only
  navigateToPage(page: string) {
    // Ensure we have a valid page
    if (!page) {
      return;
    }

    // Update the current page signal
    this.currentPage = page;

    // Get current query params to preserve them
    const currentQueryParams =
      this.router.routerState.snapshot.root.queryParams;

    // Navigate to the specific page route
    const url = `/preview/${page}`;

    // Navigate to the page while preserving query params
    this.router
      .navigate([url], {
        queryParams: currentQueryParams,
        queryParamsHandling: 'preserve',
      })
      .then((success) => {
        // Scroll to top after navigation
        if (success) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      })
      .catch((error) => {
        console.error('Navigation error:', error);
      });
  }
}
