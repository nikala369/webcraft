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
} from '@angular/core';
import { StructureHeaderComponent } from '../components/structure-header/structure-header.component';
import { StructureFooterComponent } from '../components/structure-footer/structure-footer.component';
import { CommonModule } from '@angular/common';
import { Customizations } from '../../../core/models/website-customizations';
import { SectionHoverWrapperComponent } from '../components/section-hover-wrapper/section-hover-wrapper.component';
import { Router } from '@angular/router';
import { HomeStandardComponent } from './home-standard/home-standard.component';
import { AboutStandardComponent } from './about-standard/about-standard.component';
import { FontOption } from '../components/font-selector/font-selector.component';
import { ScrollService } from '../../../core/services/shared/scroll/scroll.service';
import { BUSINESS_TYPE_SECTIONS } from '../../../core/models/business-types';

@Component({
  selector: 'app-standard-structure',
  standalone: true,
  imports: [
    StructureHeaderComponent,
    StructureFooterComponent,
    SectionHoverWrapperComponent,
    HomeStandardComponent,
    AboutStandardComponent,
    CommonModule,
  ],
  templateUrl: './standard-structure.component.html',
  styleUrls: ['./standard-structure.component.scss'],
})
export class StandardStructureComponent implements OnInit, AfterViewInit {
  @ViewChild('structureContainer') structureContainer!: ElementRef;
  @ViewChild(HomeStandardComponent) homeComponent!: HomeStandardComponent;

  // The parent passes in the customizations as a signal function for reactivity.
  @Input() customizations!: () => Customizations;
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

  constructor(private router: Router, private el: ElementRef) {}

  // Create computed signals for each page's customizations
  homeCustomizationsSignal = computed(() => {
    const homeData = this.customizations()?.pages?.home || {};
    console.log(
      'Standard structure computed homeCustomizationsSignal:',
      homeData
    );
    return homeData;
  });

  aboutCustomizationsSignal = computed(
    () => this.customizations()?.pages?.home?.about || {}
  );
  contactCustomizationsSignal = computed(
    () => this.customizations()?.pages?.home?.contact || {}
  );

  // Create a Signal from the customizations function
  // This is the complete data structure for components that need it
  wholeDataSignal = computed(() => {
    const fullData = this.customizations();
    console.log('Standard structure computed wholeDataSignal:', fullData);
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
          'services',
          'about',
          'contact',
        ]
      );
    }
    return ['hero', 'services', 'about', 'contact']; // Default sections
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
    }, 1000);
  }

  // Find all section elements for scrolling
  findSectionElements() {
    if (this.structureContainer) {
      const container = this.structureContainer.nativeElement;

      // Use the computed available sections from business type
      const sections = this.availableSections();

      sections.forEach((sectionId) => {
        const sectionEl = container.querySelector(`#${sectionId}`);
        if (sectionEl) {
          this.sectionRefs[sectionId] = sectionEl;
        }
      });

      console.log('Found section elements:', Object.keys(this.sectionRefs));
    }
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
    console.log(selectedData, 'selected data');
    this.componentSelected.emit(selectedData);
  }

  handlePageSectionEdit(fullPath: string) {
    console.log(
      `Standard-structure: handling page section edit for path: ${fullPath}`
    );

    // Special debug for about section
    if (fullPath.includes('about')) {
      console.log('DEBUG: Handling ABOUT section edit!');
    }

    // Split the fullPath, e.g. "pages.home.hero1" → ["pages", "home", "hero1"]
    const pathParts = fullPath.split('.');

    // Create a friendly name from the parts: "Pages Home Hero1"
    const sectionName = pathParts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    console.log(
      `Standard-structure: emitting component selected with key:${fullPath}, name:${sectionName}`
    );

    // Emit the event with the full key so that dynamic sidebar can look up "pages.home.hero1"
    this.componentSelected.emit({
      key: fullPath,
      name: sectionName,
      path: fullPath,
    });
  }

  // Handle section scrolling (from header navigation)
  handleSectionScroll(sectionId: string) {
    console.log('Scrolling to section:', sectionId);

    // Find the section element
    const sectionEl = this.sectionRefs[sectionId];

    if (sectionEl) {
      // Scroll the section into view with smooth behavior
      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Update active section
      this.activeSection.set(sectionId);
    } else {
      console.warn(`Section with ID "${sectionId}" not found`);
    }
  }

  // For premium structure only
  navigateToPage(page: string) {
    console.log('Navigating to page:', page);

    // Ensure we have a valid page
    if (!page) {
      console.error('No page specified for navigation');
      return;
    }

    const queryParams = {
      plan: this.currentPlan,
      businessType: this.businessType,
    };
    console.log('Using query params:', queryParams);

    // Use absolute path to ensure consistent navigation
    const url = `/preview/${page}`;
    console.log('Navigating to URL:', url);

    // Navigate to the page while preserving query params
    this.router
      .navigate([url], {
        queryParams: queryParams,
        queryParamsHandling: 'merge',
      })
      .then((success) => {
        console.log('Navigation result:', success ? 'Success' : 'Failed');
      })
      .catch((error) => {
        console.error('Navigation error:', error);
      });
  }
}
