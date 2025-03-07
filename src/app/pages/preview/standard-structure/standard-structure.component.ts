import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  computed,
  signal,
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
  @Input() selectedFont: any;
  @Input() currentPage: string = 'home';
  @Input() currentPlan: string = 'standard';

  // When a section is clicked, we emit an event with the section key.
  @Output() componentSelected = new EventEmitter<{
    key: keyof Customizations;
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

  handleComponentSelection(componentKey: keyof Customizations): void {
    // Create a simple object with a key and name.
    const selectedData = {
      key: componentKey,
      name: componentKey.charAt(0).toUpperCase() + componentKey.slice(1),
    };
    console.log(selectedData, 'selected data');
    this.componentSelected.emit(selectedData);
  }

  handlePageSectionEdit(fullPath: string) {
    // Parse the path to get the component key
    const pathParts = fullPath.split('.');

    // Create a name for the section
    const sectionName = pathParts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    // Emit the selection to the parent
    this.componentSelected.emit({
      key: 'pages' as keyof Customizations, // Use 'pages' as the key
      name: sectionName,
      path: fullPath, // Pass the full path for nested handling
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
