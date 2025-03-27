import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHoverWrapperComponent } from '../../../../components/section-hover-wrapper/section-hover-wrapper.component';
import { ThemeColorsService } from '../../../../../../core/services/theme/theme-colors.service';

// Add a simple pipe to handle newline replacement
@Pipe({
  name: 'replace',
  standalone: true,
})
export class ReplacePipe implements PipeTransform {
  transform(value: string, search: string, replacement: string): string {
    if (!value) return '';
    return value.replace(new RegExp(search, 'g'), replacement);
  }
}

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent, ReplacePipe],
  templateUrl: './contact-section.component.html',
  styleUrls: ['./contact-section.component.scss'],
})
export class ContactSectionComponent {
  @Input() customizations: any;
  @Input() isMobileLayout: boolean = false;
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'restaurant';
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  private themeColorsService = inject(ThemeColorsService);

  // Default contact information
  private defaultInfo = {
    address: '123 Business Street\nAnytown, ST 12345',
    phone: '(123) 456-7890',
    email: 'info@yourbusiness.com',
    hours: 'Monday-Friday: 9am-5pm\nWeekends: Closed',
    socials: {
      facebook: 'https://facebook.com/',
      instagram: 'https://instagram.com/',
      twitter: 'https://twitter.com/',
      linkedin: 'https://linkedin.com/',
    },
  };

  /**
   * Get section title based on business type
   */
  getSectionTitle(): string {
    if (this.customizations?.pages?.home?.contact?.title) {
      return this.customizations.pages.home.contact.title;
    }

    return 'Contact Us';
  }

  /**
   * Get section subtitle based on business type
   */
  getSectionSubtitle(): string {
    if (this.customizations?.pages?.home?.contact?.subtitle) {
      return this.customizations.pages.home.contact.subtitle;
    }

    const subtitles = {
      restaurant: 'Make a reservation or get in touch with our team',
      salon: 'Book an appointment or reach out with questions',
      architecture: "Let's discuss your project requirements",
      portfolio: 'Get in touch for collaboration opportunities',
    };

    return (
      subtitles[this.businessType as keyof typeof subtitles] ||
      "We'd love to hear from you"
    );
  }

  /**
   * Get contact form title based on business type
   */
  getFormTitle(): string {
    if (this.customizations?.pages?.home?.contact?.formTitle) {
      return this.customizations.pages.home.contact.formTitle;
    }

    const formTitles = {
      restaurant: 'Make a Reservation',
      salon: 'Book an Appointment',
      architecture: 'Request a Consultation',
      portfolio: 'Send a Message',
    };

    return (
      formTitles[this.businessType as keyof typeof formTitles] ||
      'Send us a Message'
    );
  }

  /**
   * Get contact form button text based on business type
   */
  getFormButtonText(): string {
    if (this.customizations?.pages?.home?.contact?.formButtonText) {
      return this.customizations.pages.home.contact.formButtonText;
    }

    const buttonTexts = {
      restaurant: 'Reserve Now',
      salon: 'Book Now',
      architecture: 'Request Consultation',
      portfolio: 'Send Message',
    };

    return (
      buttonTexts[this.businessType as keyof typeof buttonTexts] ||
      'Send Message'
    );
  }

  /**
   * Get contact info fields to show based on business type
   */
  getInfoFields(): string[] {
    const standardFields = ['address', 'phone', 'email'];

    if (this.planType === 'premium') {
      if (this.businessType === 'restaurant' || this.businessType === 'salon') {
        return [...standardFields, 'hours'];
      }
    }

    return standardFields;
  }

  /**
   * Get contact icon based on field type
   */
  getFieldIcon(field: string): string {
    const icons = {
      address: 'assets/standard-contact/location-icon.svg',
      phone: 'assets/standard-contact/phone-icon.svg',
      email: 'assets/standard-contact/email-icon.svg',
      hours: 'assets/standard-contact/clock-icon.svg',
    };

    return icons[field as keyof typeof icons] || '';
  }

  /**
   * Get field value or default if not set
   */
  getFieldValue(field: string): string {
    return (
      this.customizations?.pages?.home?.contact?.[field] ||
      this.defaultInfo[field as keyof typeof this.defaultInfo]
    );
  }

  /**
   * Get field label based on field type
   */
  getFieldLabel(field: string): string {
    const labels = {
      address: 'Our Location',
      phone: 'Phone Number',
      email: 'Email Address',
      hours: 'Business Hours',
    };

    return labels[field as keyof typeof labels] || field;
  }

  /**
   * Check if social media links should be displayed
   */
  shouldShowSocial(): boolean {
    return this.planType === 'premium';
  }

  /**
   * Get social media link or default
   */
  getSocialLink(platform: string): string {
    return (
      this.customizations?.pages?.home?.contact?.socials?.[platform] ||
      this.defaultInfo.socials[
        platform as keyof typeof this.defaultInfo.socials
      ]
    );
  }

  /**
   * Handle section selection
   */
  handleSectionSelection() {
    this.sectionSelected.emit({
      key: 'contact',
      name: 'Contact Section',
      path: 'pages.home.contact',
    });
  }

  /**
   * Check if form should include date/time fields (restaurants & salons)
   */
  includeBookingFields(): boolean {
    return (
      (this.businessType === 'restaurant' || this.businessType === 'salon') &&
      this.planType === 'premium'
    );
  }

  /**
   * Display "People/Party Size" field for restaurants
   */
  includePartySize(): boolean {
    return this.businessType === 'restaurant' && this.planType === 'premium';
  }

  /**
   * Display "Service Selection" field for salons
   */
  includeServiceSelection(): boolean {
    return this.businessType === 'salon' && this.planType === 'premium';
  }
}
