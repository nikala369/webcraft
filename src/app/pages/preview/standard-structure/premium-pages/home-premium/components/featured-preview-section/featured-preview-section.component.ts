import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHoverWrapperComponent } from '../../../../../components/section-hover-wrapper/section-hover-wrapper.component';

interface FeaturedItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  link?: string;
}

@Component({
  selector: 'app-featured-preview-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  templateUrl: './featured-preview-section.component.html',
  styleUrls: ['./featured-preview-section.component.scss'],
})
export class FeaturedPreviewSectionComponent {
  @Input({ required: true }) data!: Signal<any>;
  @Input() isMobileLayout: boolean = false;
  @Input() planType: 'standard' | 'premium' = 'premium';
  @Input() businessType: string = 'restaurant';
  @Input() editable: boolean = true;
  @Input() isMobileView: string = 'view-desktop';
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  handleSectionSelection(event: { key: string; name: string; path?: string }) {
    this.sectionSelected.emit(event);
  }

  handleSectionEdit(sectionId: string) {
    // Open the customizer or handle edit logic for the section
    // Example: emit an event, open a sidebar, etc.
    console.log('Edit requested for section:', sectionId);
    // You can emit an event or call a service here
  }

  getFeaturedTitle(): string {
    return this.data()?.title || 'Featured';
  }

  getFeaturedSubtitle(): string {
    return this.data()?.subtitle || 'Subtitle';
  }

  getFeaturedItems(): FeaturedItem[] {
    return Array.isArray(this.data()?.items) ? this.data().items : [];
  }

  getCtaText(): string {
    switch (this.businessType) {
      case 'restaurant':
        return 'View Full Menu';
      case 'salon':
        return 'Book Service';
      case 'architecture':
        return 'View Projects';
      case 'portfolio':
        return 'See All Work';
      default:
        return 'Learn More';
    }
  }

  getCtaLink(): string {
    switch (this.businessType) {
      case 'restaurant':
        return '/menu';
      case 'salon':
        return '/services';
      case 'architecture':
        return '/projects';
      case 'portfolio':
        return '/projects';
      default:
        return '#';
    }
  }
}
