import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  computed,
  signal, inject,
} from '@angular/core';
import { StructureHeaderComponent } from '../components/structure-header/structure-header.component';
import { StructureFooterComponent } from '../components/structure-footer/structure-footer.component';
import { CommonModule } from '@angular/common';
import { Customizations } from '../preview.component';
import { SectionHoverWrapperComponent } from '../components/section-hover-wrapper/section-hover-wrapper.component';
import { Router } from '@angular/router';
import { HomeStandardComponent } from './home-standard/home-standard.component';
import { AboutStandardComponent } from './about-standard/about-standard.component';
import { ContactStandardComponent } from './contact-standard/contact-standard.component';
import { FontOption } from '../components/font-selector/font-selector.component';
import {ScrollService} from "../../../core/services/shared/scroll/scroll.service";

@Component({
  selector: 'app-standard-structure',
  standalone: true,
  imports: [
    StructureHeaderComponent,
    StructureFooterComponent,
    SectionHoverWrapperComponent,
    HomeStandardComponent,
    AboutStandardComponent,
    ContactStandardComponent,
    CommonModule,
  ],
  templateUrl: './standard-structure.component.html',
  styleUrls: ['./standard-structure.component.scss'],
})
export class StandardStructureComponent implements OnInit {
  // The parent passes in the customizations as a signal function for reactivity.
  @Input() customizations!: () => Customizations;
  @Input() isMobileLayout = false;
  @Input() isMobileView: any;
  @Input() isViewOnly: any;
  @Input() selectedFont: FontOption | null = null;
  @Input() currentPage: string = 'home';
  @Input() currentPlan: string = 'standard';

  // When a section is clicked, we emit an event with the section key.
  @Output() componentSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  constructor(private router: Router) {}

  // Create computed signals for each page's customizations
  homeCustomizationsSignal = computed(
    () => this.customizations()?.pages?.home || {}
  );
  aboutCustomizationsSignal = computed(
    () => this.customizations()?.pages?.about || {}
  );
  contactCustomizationsSignal = computed(
    () => this.customizations()?.pages?.contact || {}
  );
  // Create a Signal from the customizations function
  wholeDataSignal = computed(() => this.customizations());

  ngOnInit() {
    console.log(this.customizations(), 'main data in standard structure');
    console.log('Current page in standard structure:', this.currentPage);
    console.log('Current plan in standard structure:', this.currentPlan);
  }

  // Add a convenience method
  getFontFamily(): string {
    if (!this.selectedFont) return '';
    return `${this.selectedFont.family}, ${this.selectedFont.fallback}`;
  }

  handleComponentSelection(componentKey: keyof Customizations): void {
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

  // Navigate to a different page while preserving the current plan
  navigateToPage(page: string) {
    console.log('Navigating to page:', page);

    // Ensure we have a valid page
    if (!page) {
      console.error('No page specified for navigation');
      return;
    }

    const queryParams = { plan: this.currentPlan };
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
