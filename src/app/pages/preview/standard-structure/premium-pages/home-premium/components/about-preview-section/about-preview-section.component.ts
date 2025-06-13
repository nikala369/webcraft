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

interface AboutColumn {
  icon: string;
  title: string;
  description: string;
}

interface BusinessFeature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about-preview-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  templateUrl: './about-preview-section.component.html',
  styleUrls: ['./about-preview-section.component.scss'],
})
export class AboutPreviewSectionComponent {
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

  getAboutTitle(): string {
    const data = this.data();
    if (data?.title) return data.title;

    switch (this.businessType) {
      case 'restaurant':
        return 'About Our Restaurant';
      case 'salon':
        return 'About Our Salon';
      case 'architecture':
        return 'About Our Firm';
      case 'portfolio':
        return 'About Me';
      default:
        return 'About Us';
    }
  }

  getAboutColumns(): AboutColumn[] {
    switch (this.businessType) {
      case 'restaurant':
        return [
          {
            icon: 'fas fa-utensils',
            title: 'Our Story',
            description:
              'Founded with a passion for exceptional cuisine and warm hospitality, we bring authentic flavors to your table.',
          },
          {
            icon: 'fas fa-heart',
            title: 'Our Mission',
            description:
              'To create memorable dining experiences through fresh ingredients, innovative recipes, and outstanding service.',
          },
          {
            icon: 'fas fa-star',
            title: 'Our Values',
            description:
              'Quality, authenticity, and community are at the heart of everything we do in our kitchen and dining room.',
          },
        ];

      case 'salon':
        return [
          {
            icon: 'fas fa-cut',
            title: 'Our Story',
            description:
              'Established by passionate stylists dedicated to bringing out the best in every client through expert care and creativity.',
          },
          {
            icon: 'fas fa-heart',
            title: 'Our Mission',
            description:
              'To enhance natural beauty and boost confidence through personalized styling and premium beauty treatments.',
          },
          {
            icon: 'fas fa-star',
            title: 'Our Values',
            description:
              'Excellence, creativity, and client satisfaction drive our commitment to exceptional beauty services.',
          },
        ];

      case 'architecture':
        return [
          {
            icon: 'fas fa-drafting-compass',
            title: 'Our Story',
            description:
              'Founded by visionary architects committed to creating spaces that inspire and transform communities.',
          },
          {
            icon: 'fas fa-lightbulb',
            title: 'Our Mission',
            description:
              "To design innovative, sustainable spaces that enhance lives and reflect our clients' unique vision.",
          },
          {
            icon: 'fas fa-award',
            title: 'Our Values',
            description:
              'Innovation, sustainability, and client collaboration are the pillars of our design philosophy.',
          },
        ];

      case 'portfolio':
        return [
          {
            icon: 'fas fa-palette',
            title: 'My Story',
            description:
              'A creative professional passionate about bringing ideas to life through innovative design and strategic thinking.',
          },
          {
            icon: 'fas fa-target',
            title: 'My Mission',
            description:
              'To help brands and individuals tell their stories through compelling visual design and user experiences.',
          },
          {
            icon: 'fas fa-gem',
            title: 'My Values',
            description:
              'Creativity, authenticity, and attention to detail guide every project I undertake.',
          },
        ];

      default:
        return [
          {
            icon: 'fas fa-building',
            title: 'Our Story',
            description:
              "Built on a foundation of excellence and innovation, we've been serving our community with dedication.",
          },
          {
            icon: 'fas fa-handshake',
            title: 'Our Mission',
            description:
              'To provide exceptional services that exceed expectations and build lasting relationships.',
          },
          {
            icon: 'fas fa-trophy',
            title: 'Our Values',
            description:
              'Integrity, quality, and customer satisfaction are the core values that drive our success.',
          },
        ];
    }
  }

  getBusinessFeatures(): BusinessFeature[] {
    switch (this.businessType) {
      case 'restaurant':
        return [
          {
            icon: 'fas fa-leaf',
            title: 'Fresh Ingredients',
            description:
              'Locally sourced, seasonal ingredients for the finest flavors',
          },
          {
            icon: 'fas fa-chef-hat',
            title: 'Expert Chefs',
            description:
              'Skilled culinary professionals with years of experience',
          },
          {
            icon: 'fas fa-wine-glass',
            title: 'Curated Selection',
            description:
              'Carefully chosen wines and beverages to complement every meal',
          },
          {
            icon: 'fas fa-clock',
            title: 'Timely Service',
            description: 'Efficient service without compromising on quality',
          },
        ];

      case 'salon':
        return [
          {
            icon: 'fas fa-scissors',
            title: 'Expert Stylists',
            description:
              'Certified professionals with advanced training and experience',
          },
          {
            icon: 'fas fa-spa',
            title: 'Premium Products',
            description: 'High-quality, professional-grade beauty products',
          },
          {
            icon: 'fas fa-calendar-check',
            title: 'Flexible Scheduling',
            description:
              'Convenient appointment times to fit your busy lifestyle',
          },
          {
            icon: 'fas fa-smile',
            title: 'Personalized Care',
            description: 'Customized treatments tailored to your unique needs',
          },
        ];

      case 'architecture':
        return [
          {
            icon: 'fas fa-ruler-combined',
            title: 'Innovative Design',
            description:
              'Cutting-edge architectural solutions for modern living',
          },
          {
            icon: 'fas fa-recycle',
            title: 'Sustainable Practices',
            description:
              'Eco-friendly designs that minimize environmental impact',
          },
          {
            icon: 'fas fa-users',
            title: 'Collaborative Process',
            description:
              'Working closely with clients throughout every project phase',
          },
          {
            icon: 'fas fa-medal',
            title: 'Award-Winning',
            description:
              'Recognized excellence in architectural design and innovation',
          },
        ];

      case 'portfolio':
        return [
          {
            icon: 'fas fa-magic',
            title: 'Creative Solutions',
            description: 'Innovative approaches to complex design challenges',
          },
          {
            icon: 'fas fa-mobile-alt',
            title: 'Responsive Design',
            description:
              'Seamless experiences across all devices and platforms',
          },
          {
            icon: 'fas fa-rocket',
            title: 'Fast Delivery',
            description:
              'Efficient project completion without sacrificing quality',
          },
          {
            icon: 'fas fa-comments',
            title: 'Clear Communication',
            description: 'Regular updates and transparent project management',
          },
        ];

      default:
        return [
          {
            icon: 'fas fa-check-circle',
            title: 'Quality Assurance',
            description:
              'Rigorous standards ensure exceptional results every time',
          },
          {
            icon: 'fas fa-headset',
            title: 'Expert Support',
            description:
              'Dedicated team available to assist with all your needs',
          },
          {
            icon: 'fas fa-shield-alt',
            title: 'Reliable Service',
            description: 'Consistent, dependable solutions you can count on',
          },
          {
            icon: 'fas fa-thumbs-up',
            title: 'Customer Satisfaction',
            description:
              'Committed to exceeding expectations and building trust',
          },
        ];
    }
  }
}
 