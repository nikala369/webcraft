import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  Pipe,
  PipeTransform,
  OnInit,
  HostBinding,
  Signal,
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

// Form status type for showing success/error messages
interface FormStatus {
  type: 'success' | 'error';
  message: string;
}

@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent, ReplacePipe],
  templateUrl: './contact-section.component.html',
  styleUrls: ['./contact-section.component.scss'],
})
export class ContactSectionComponent implements OnInit {
  @Input({ required: true }) data!: Signal<any>;
  @Input() isMobileLayout: boolean = false;
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'restaurant';
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  // HostBinding for section styling from customizations
  @HostBinding('style.--section-bg-color') get sectionBgColor() {
    return this.getCustomization('backgroundColor') || '#f8f8f8';
  }

  @HostBinding('style.--text-color') get textColor() {
    return this.getCustomization('textColor') || '#333333';
  }

  @HostBinding('style.--heading-color') get headingColor() {
    return this.getCustomization('textColor') || '#222222';
  }

  @HostBinding('style.--primary-accent-color') get primaryAccentColor() {
    return this.themeColorsService.getPrimaryColor(this.planType);
  }

  @HostBinding('style.--primary-accent-color-rgb') get primaryAccentColorRgb() {
    const color = this.themeColorsService.getPrimaryColor(this.planType);
    return this.hexToRgb(color);
  }

  private themeColorsService = inject(ThemeColorsService);

  // Form status for showing feedback to the user
  formStatus: FormStatus | null = null;

  // Default contact information
  private defaultInfo = {
    address: '123 Business Street\nAnytown, ST 12345',
    email: 'info@yourbusiness.com',
    hours: 'Monday-Friday: 9am-5pm\nWeekends: Closed',
  };

  ngOnInit(): void {
    // Log customizations for debugging
    console.log('Contact section customizations:', this.data());
  }

  /**
   * Convert hex color to RGB format for CSS variables
   */
  private hexToRgb(hex: string): string {
    // Default to black if hex is invalid or undefined
    if (!hex || typeof hex !== 'string') {
      return '0, 0, 0';
    }

    // Remove # if present
    hex = hex.replace('#', '');

    // Handle shorthand (3 chars) hex
    if (hex.length === 3) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }

    // Parse RGB values with fallbacks for invalid values
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;

    return `${r}, ${g}, ${b}`;
  }

  /**
   * Get customization value safely from either direct or nested paths
   */
  getCustomization(key: string): any {
    // First check direct path
    if (this.data()?.[key] !== undefined) {
      return this.data()[key];
    }

    // Then check nested path
    if (this.data()?.pages?.home?.contact?.[key] !== undefined) {
      return this.data().pages.home.contact[key];
    }

    return null;
  }

  /**
   * Get section title based on business type
   */
  getSectionTitle(): string {
    const title = this.getCustomization('title');
    if (title) return title;

    return 'Contact Us';
  }

  /**
   * Get section subtitle based on business type
   */
  getSectionSubtitle(): string {
    const subtitle = this.getCustomization('subtitle');
    if (subtitle) return subtitle;

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
    const formTitle = this.getCustomization('formTitle');
    if (formTitle) return formTitle;

    const formTitles = {
      restaurant: 'Send a Message',
      salon: 'Send a Message',
      architecture: 'Send a Message',
      portfolio: 'Get in Touch',
    };

    return (
      formTitles[this.businessType as keyof typeof formTitles] ||
      'Send a Message'
    );
  }

  /**
   * Get contact form button text based on business type
   */
  getFormButtonText(): string {
    const buttonText = this.getCustomization('formButtonText');
    if (buttonText) return buttonText;

    return 'Send Message';
  }

  /**
   * Get contact info fields to show based on business type
   */
  getInfoFields(): string[] {
    // Only include address and email as standard fields
    const standardFields = ['email'];

    // Include address only if it should be shown (dependent on business type)
    if (this.shouldShowAddress()) {
      standardFields.unshift('address'); // Add address at the beginning
    }

    // For premium plans with certain business types, show hours
    if (this.planType === 'premium') {
      if (this.businessType === 'restaurant' || this.businessType === 'salon') {
        standardFields.push('hours');
      }
    }

    return standardFields;
  }

  /**
   * Determine if address should be shown
   * Portfolio businesses typically don't need an address
   */
  shouldShowAddress(): boolean {
    // Always show if it's explicitly set in customizations
    if (this.getCustomization('address')) {
      return true;
    }

    // For portfolio business type, don't show address by default
    if (this.businessType === 'portfolio') {
      return false;
    }

    // For all other business types, show address
    return true;
  }

  /**
   * Get contact icon based on field type
   */
  getFieldIcon(field: string): string {
    const icons = {
      address: 'assets/standard-contact/location-icon.svg',
      email: 'assets/standard-contact/email-icon.svg',
      hours: 'assets/standard-contact/clock-icon.svg',
    };

    return icons[field as keyof typeof icons] || '';
  }

  /**
   * Get field value or default if not set
   */
  getFieldValue(field: string): string {
    const value = this.getCustomization(field);
    if (value && typeof value === 'string') {
      return value;
    }

    // Use default values if available
    return (
      (this.defaultInfo[field as keyof typeof this.defaultInfo] as string) || ''
    );
  }

  /**
   * Get field label based on field type
   */
  getFieldLabel(field: string): string {
    const labels = {
      address: 'Our Location',
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
   * Get social media link
   */
  getSocialLink(platform: string): string {
    const socialUrls = this.getCustomization('socialUrls');
    if (socialUrls && socialUrls[platform]) {
      return socialUrls[platform];
    }

    // Default social media URLs
    const defaults = {
      facebook: 'https://facebook.com/',
      instagram: 'https://instagram.com/',
      twitter: 'https://twitter.com/',
      linkedin: 'https://linkedin.com/',
    };

    return defaults[platform as keyof typeof defaults] || '#';
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
   * Handle form submission with multiple email sending options
   */
  handleFormSubmit(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    // Basic form validation
    if (!form.checkValidity()) {
      this.formStatus = {
        type: 'error',
        message: 'Please fill all required fields correctly.',
      };
      return;
    }

    // Get form data
    const formData = new FormData(form);
    const formValues: Record<string, string> = {};

    // Convert FormData to a regular object
    formData.forEach((value, key) => {
      formValues[key] = value.toString();
    });

    // Add recipient email from customizations
    formValues['recipient'] = this.getFieldValue('email');

    console.log('Form submission:', formValues);

    // Show success message
    this.formStatus = {
      type: 'success',
      message: 'Thank you! Your message has been received.',
    };

    // Reset form after successful submission
    form.reset();
  }

  /**
   * Get a mailto link for the email field
   */
  getEmailMailtoLink(): string {
    const email = this.getFieldValue('email');
    if (!email) return 'mailto:info@example.com';

    return `mailto:${email}`;
  }

  /**
   * Format email address for display
   */
  getFormattedEmail(): string {
    return this.getFieldValue('email');
  }
}
