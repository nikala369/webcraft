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

@Component({
  selector: 'app-cta-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  templateUrl: './cta-section.component.html',
  styleUrls: ['./cta-section.component.scss'],
})
export class CtaSectionComponent {
  @Input({ required: true }) data!: Signal<any>;
  @Input() isMobileLayout: boolean = false;
  @Input() planType: 'standard' | 'premium' = 'premium';
  @Input() businessType: string = 'restaurant';
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  handleSectionSelection(event: { key: string; name: string; path?: string }) {
    this.sectionSelected.emit(event);
  }

  getCtaTitle(): string {
    const customTitle = this.data()?.title;
    if (customTitle) return customTitle;

    switch (this.businessType) {
      case 'restaurant':
        return 'Ready to Dine With Us?';
      case 'salon':
        return 'Book Your Transformation';
      case 'architecture':
        return 'Start Your Project';
      case 'portfolio':
        return "Let's Work Together";
      default:
        return 'Ready to Get Started?';
    }
  }

  getCtaSubtitle(): string {
    const customSubtitle = this.data()?.subtitle;
    if (customSubtitle) return customSubtitle;

    switch (this.businessType) {
      case 'restaurant':
        return 'Experience exceptional cuisine and service. Reserve your table today and taste the difference.';
      case 'salon':
        return 'Transform your look with our expert stylists. Book your appointment and discover your new style.';
      case 'architecture':
        return "Turn your vision into reality with our expert design team. Let's create something extraordinary together.";
      case 'portfolio':
        return "Ready to bring your creative vision to life? Let's collaborate and create something amazing.";
      default:
        return 'Join us today and experience the difference we can make for you.';
    }
  }

  getPrimaryButtonText(): string {
    const customText = this.data()?.primaryButtonText;
    if (customText) return customText;

    switch (this.businessType) {
      case 'restaurant':
        return 'Make Reservation';
      case 'salon':
        return 'Book Appointment';
      case 'architecture':
        return 'Start Project';
      case 'portfolio':
        return 'Get Started';
      default:
        return 'Get Started';
    }
  }

  getSecondaryButtonText(): string {
    const customText = this.data()?.secondaryButtonText;
    if (customText) return customText;

    switch (this.businessType) {
      case 'restaurant':
        return 'View Menu';
      case 'salon':
        return 'View Services';
      case 'architecture':
        return 'View Portfolio';
      case 'portfolio':
        return 'View Work';
      default:
        return 'Learn More';
    }
  }

  getPrimaryButtonLink(): string {
    switch (this.businessType) {
      case 'restaurant':
        return '/contact#reservation';
      case 'salon':
        return '/contact#booking';
      case 'architecture':
        return '/contact#consultation';
      case 'portfolio':
        return '/contact';
      default:
        return '/contact';
    }
  }

  getSecondaryButtonLink(): string {
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

  getBackgroundColor(): string {
    return this.data()?.backgroundColor || '#4a8dff';
  }
}
