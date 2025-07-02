import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SectionHoverWrapperComponent } from '../../../../../components/section-hover-wrapper/section-hover-wrapper.component';

@Component({
  selector: 'app-about-preview-section',
  standalone: true,
  imports: [CommonModule, RouterModule, SectionHoverWrapperComponent],
  templateUrl: './about-preview-section.component.html',
  styleUrls: ['./about-preview-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPreviewSectionComponent implements OnInit, OnChanges {
  @Input({ required: true }) data!: Signal<any>;
  @Input() isMobileLayout: boolean = false;
  @Input() isMobileView: string = 'view-desktop';
  @Input() planType: 'standard' | 'premium' = 'premium';
  @Input() businessType: string = 'restaurant';
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  // Stable signals for animations to prevent flickering
  keyFeatures = signal<
    Array<{ icon: string; title: string; description: string }>
  >([]);
  businessStats = signal<Array<{ number: string; label: string }>>([]);

  ngOnInit() {
    console.log('[AboutPreviewSection] ngOnInit - data signal:', this.data);
    console.log('[AboutPreviewSection] ngOnInit - data value:', this.data());
    console.log('[AboutPreviewSection] businessType:', this.businessType);
    // Initialize stable data once to prevent flickering
    this.keyFeatures.set(this.getKeyFeatures());
    this.businessStats.set(this.getBusinessStats());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      console.log('[AboutPreviewSection] data input changed:', changes['data']);
      console.log('[AboutPreviewSection] new data value:', this.data());
    }
    if (changes['businessType']) {
      // Update stable data when business type changes
      this.keyFeatures.set(this.getKeyFeatures());
      this.businessStats.set(this.getBusinessStats());
    }
  }

  /**
   * Handle section edit click
   */
  handleSectionEdit(): void {
    console.log('[AboutPreviewSection] handleSectionEdit called');
    this.sectionSelected.emit({
      key: 'aboutPreview',
      name: 'About Preview Section',
      path: 'pages.home.aboutPreview',
    });
  }

  /**
   * Get section title
   */
  getTitle(): string {
    return this.data()?.title || 'About Us';
  }

  /**
   * Get section subtitle
   */
  getSubtitle(): string {
    return this.data()?.subtitle || 'Discover what makes us unique';
  }

  /**
   * Get story title
   */
  getStoryTitle(): string {
    return this.data()?.storyTitle || 'Our Mission';
  }

  /**
   * Get story description
   */
  getStoryDescription(): string {
    return (
      this.data()?.storyDescription ||
      'We are committed to excellence in everything we do, delivering exceptional value and service to our clients.'
    );
  }

  /**
   * Get link text
   */
  getLinkText(): string {
    return this.data()?.linkText || 'Learn More About Us';
  }

  /**
   * Check if stats should be shown
   */
  shouldShowStats(): boolean {
    return this.data()?.showStats !== false;
  }

  /**
   * Check if features should be shown
   */
  shouldShowFeatures(): boolean {
    return this.data()?.showFeatures !== false;
  }

  /**
   * Get business stats - returns stable data
   */
  getBusinessStats(): Array<{ number: string; label: string }> {
    // Check if custom stats are provided in data
    const dataValue = this.data();
    if (dataValue?.stats && Array.isArray(dataValue.stats)) {
      return dataValue.stats;
    }

    // Otherwise return business-type specific defaults
    const stats = {
      restaurant: [
        { number: '15+', label: 'Years of Excellence' },
        { number: '50K+', label: 'Happy Customers' },
        { number: '25+', label: 'Expert Chefs' },
        { number: '100+', label: 'Signature Dishes' },
      ],
      salon: [
        { number: '10+', label: 'Years in Business' },
        { number: '20K+', label: 'Happy Clients' },
        { number: '15+', label: 'Expert Stylists' },
        { number: '50+', label: 'Services Offered' },
      ],
      architecture: [
        { number: '20+', label: 'Years Experience' },
        { number: '200+', label: 'Projects Completed' },
        { number: '30+', label: 'Awards Won' },
        { number: '95%', label: 'Client Satisfaction' },
      ],
      portfolio: [
        { number: '8+', label: 'Years Experience' },
        { number: '150+', label: 'Projects Delivered' },
        { number: '50+', label: 'Happy Clients' },
        { number: '15+', label: 'Industries Served' },
      ],
    };

    return (
      stats[this.businessType as keyof typeof stats] || [
        { number: '10+', label: 'Years Experience' },
        { number: '100+', label: 'Projects Completed' },
        { number: '50+', label: 'Happy Clients' },
        { number: '98%', label: 'Success Rate' },
      ]
    );
  }

  /**
   * Get key features - returns stable data
   */
  getKeyFeatures(): Array<{
    icon: string;
    title: string;
    description: string;
  }> {
    // Check if custom features are provided in data
    const dataValue = this.data();
    if (dataValue?.features && Array.isArray(dataValue.features)) {
      return dataValue.features;
    }

    // Otherwise return business-type specific defaults
    const features = {
      restaurant: [
        {
          icon: '🍽️',
          title: 'Farm to Table',
          description: 'Fresh, locally sourced ingredients daily',
        },
        {
          icon: '👨‍🍳',
          title: 'Expert Chefs',
          description: 'Award-winning culinary team',
        },
        {
          icon: '🌟',
          title: 'Fine Dining',
          description: 'Exceptional ambiance and service',
        },
      ],
      salon: [
        {
          icon: '✂️',
          title: 'Expert Stylists',
          description: 'Certified professionals with years of experience',
        },
        {
          icon: '🌿',
          title: 'Premium Products',
          description: 'Using only the best brands and organic options',
        },
        {
          icon: '💆‍♀️',
          title: 'Relaxing Experience',
          description: 'Luxurious atmosphere for your comfort',
        },
      ],
      architecture: [
        {
          icon: '🏗️',
          title: 'Innovative Design',
          description: 'Cutting-edge architectural solutions',
        },
        {
          icon: '🌱',
          title: 'Sustainable',
          description: 'Eco-friendly and energy-efficient designs',
        },
        {
          icon: '🎯',
          title: 'Client-Focused',
          description: 'Tailored to your specific needs',
        },
      ],
      portfolio: [
        {
          icon: '🎨',
          title: 'Creative Excellence',
          description: 'Unique and impactful design solutions',
        },
        {
          icon: '💡',
          title: 'Strategic Thinking',
          description: 'Data-driven creative decisions',
        },
        {
          icon: '🚀',
          title: 'Fast Delivery',
          description: 'Efficient workflow and timely results',
        },
      ],
    };

    return (
      features[this.businessType as keyof typeof features] || [
        {
          icon: '✨',
          title: 'Quality Service',
          description: 'Commitment to excellence in everything we do',
        },
        {
          icon: '🤝',
          title: 'Customer Focus',
          description: 'Your satisfaction is our priority',
        },
        {
          icon: '💡',
          title: 'Innovation',
          description: 'Always improving and evolving',
        },
      ]
    );
  }

  /**
   * Get background color
   */
  getBackgroundColor(): string {
    return this.data()?.backgroundColor || '#f8f9fa';
  }

  /**
   * Get text color
   */
  getTextColor(): string {
    return this.data()?.textColor || '#333333';
  }

  /**
   * Get accent color
   */
  getAccentColor(): string {
    return this.data()?.accentColor || '#9e6aff';
  }
}
