import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SectionHoverWrapperComponent } from '../../../components/section-hover-wrapper/section-hover-wrapper.component';
import { AboutHeroSectionComponent } from './components/about-hero-section/about-hero-section.component';
import { AboutStorySectionComponent } from './components/about-story-section/about-story-section.component';
import { AboutTeamSectionComponent } from './components/about-team-section/about-team-section.component';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  social?: Array<{ icon: string; url: string }>;
}

interface CompanyValue {
  icon: string;
  title: string;
  description: string;
}

interface Testimonial {
  text: string;
  name: string;
  title: string;
  avatar: string;
}

interface HeroStat {
  number: string;
  label: string;
}

interface StoryHighlight {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-about-premium',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SectionHoverWrapperComponent,
    AboutHeroSectionComponent,
    AboutStorySectionComponent,
    AboutTeamSectionComponent,
  ],
  templateUrl: './about-premium.component.html',
  styleUrls: ['./about-premium.component.scss'],
})
export class AboutPremiumComponent {
  @Input({ required: true }) customizations!: Signal<any>;
  @Input() isMobileLayout: boolean = false;
  @Input() isMobileView: string = 'view-desktop';
  @Input() businessType: string = 'restaurant';

  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  // Computed signals for each section's data
  heroData = computed(() => {
    return this.customizations()?.hero || {};
  });

  storyData = computed(() => {
    return this.customizations()?.story || {};
  });

  teamData = computed(() => {
    return this.customizations()?.team || {};
  });

  valuesData = computed(() => {
    return this.customizations()?.values || {};
  });

  testimonialsData = computed(() => {
    return this.customizations()?.testimonials || {};
  });

  ctaData = computed(() => {
    return this.customizations()?.cta || {};
  });

  planType: 'premium' = 'premium';
  editable: boolean = true;

  handleSectionEdit(sectionId: string) {
    console.log('[AboutPremium] Edit requested for section:', sectionId);

    // Emit the section selected event to open the customizer
    // Map sectionId to the correct path for premium about sections
    let sectionPath = '';
    let sectionName = '';

    switch (sectionId) {
      case 'hero':
        sectionPath = 'pages.about.hero';
        sectionName = 'About Hero Section';
        break;
      case 'story':
        sectionPath = 'pages.about.story';
        sectionName = 'Our Story';
        break;
      case 'team':
        sectionPath = 'pages.about.team';
        sectionName = 'Our Team';
        break;
      case 'values':
        sectionPath = 'pages.about.values';
        sectionName = 'Our Values';
        break;
      case 'testimonials':
        sectionPath = 'pages.about.testimonials';
        sectionName = 'Testimonials';
        break;
      case 'cta':
        sectionPath = 'pages.about.cta';
        sectionName = 'Call to Action';
        break;
      default:
        sectionPath = `pages.about.${sectionId}`;
        sectionName = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    }

    this.sectionSelected.emit({
      key: sectionId,
      name: sectionName,
      path: sectionPath,
    });
  }

  /**
   * Handle section selection from child components
   */
  handleSectionSelection(event: { key: string; name: string; path?: string }) {
    console.log('[AboutPremium] handleSectionSelection received event:', event);
    this.sectionSelected.emit(event);
  }

  // Keep the existing methods for sections that don't have child components yet

  getCompanyValues(): CompanyValue[] {
    const values: Record<string, CompanyValue[]> = {
      restaurant: [
        {
          icon: 'fas fa-heart',
          title: 'Passion',
          description: 'Every dish is crafted with love and dedication',
        },
        {
          icon: 'fas fa-leaf',
          title: 'Sustainability',
          description: 'Committed to eco-friendly practices',
        },
        {
          icon: 'fas fa-users',
          title: 'Community',
          description: 'Building connections through food',
        },
        {
          icon: 'fas fa-star',
          title: 'Excellence',
          description: 'Striving for perfection in every detail',
        },
      ],
      salon: [
        {
          icon: 'fas fa-paint-brush',
          title: 'Artistry',
          description: 'Beauty is our canvas, you are our masterpiece',
        },
        {
          icon: 'fas fa-graduation-cap',
          title: 'Education',
          description: 'Continuous learning and skill development',
        },
        {
          icon: 'fas fa-shield-alt',
          title: 'Trust',
          description: 'Building confidence through expertise',
        },
        {
          icon: 'fas fa-sparkles',
          title: 'Innovation',
          description: 'Embracing the latest trends and techniques',
        },
      ],
      architecture: [
        {
          icon: 'fas fa-compass-drafting',
          title: 'Precision',
          description: 'Attention to every architectural detail',
        },
        {
          icon: 'fas fa-lightbulb',
          title: 'Innovation',
          description: 'Pushing boundaries of design',
        },
        {
          icon: 'fas fa-tree',
          title: 'Sustainability',
          description: 'Green building practices',
        },
        {
          icon: 'fas fa-handshake',
          title: 'Collaboration',
          description: 'Working together to realize visions',
        },
      ],
      default: [
        {
          icon: 'fas fa-rocket',
          title: 'Innovation',
          description: 'Embracing new ideas and technologies',
        },
        {
          icon: 'fas fa-shield-alt',
          title: 'Integrity',
          description: 'Honest and transparent in all dealings',
        },
        {
          icon: 'fas fa-trophy',
          title: 'Excellence',
          description: 'Committed to the highest standards',
        },
        {
          icon: 'fas fa-users',
          title: 'Teamwork',
          description: 'Success through collaboration',
        },
      ],
    };
    return values[this.businessType] || values['default'];
  }

  getTestimonials(): Testimonial[] {
    const testimonials: Record<string, Testimonial[]> = {
      restaurant: [
        {
          text: 'The best dining experience in the city! Every dish is a masterpiece and the service is impeccable.',
          name: 'Emily Johnson',
          title: 'Food Critic',
          avatar:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
        },
        {
          text: 'A culinary journey that exceeds all expectations. This is where memories are made.',
          name: 'Michael Brown',
          title: 'Regular Customer',
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
        },
        {
          text: 'Outstanding quality and attention to detail. My go-to place for special occasions.',
          name: 'Sarah Davis',
          title: 'Food Blogger',
          avatar:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
        },
      ],
      salon: [
        {
          text: 'They transformed my look completely! I feel like a new person. Highly recommend!',
          name: 'Jessica Martinez',
          title: 'Happy Client',
          avatar:
            'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&q=80',
        },
        {
          text: 'The team is incredibly talented and professional. Best salon experience ever!',
          name: 'Amanda Wilson',
          title: 'Regular Client',
          avatar:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
        },
        {
          text: 'They listen to what you want and deliver beyond expectations. Love my new style!',
          name: 'Rachel Green',
          title: 'Satisfied Customer',
          avatar:
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80',
        },
      ],
      default: [
        {
          text: 'Exceptional service and outstanding results. They exceeded all our expectations.',
          name: 'David Wilson',
          title: 'CEO, Tech Corp',
          avatar:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
        },
        {
          text: 'Professional, reliable, and innovative. A true partner in our success.',
          name: 'Lisa Anderson',
          title: 'Marketing Director',
          avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
        },
        {
          text: 'Their expertise and dedication made all the difference. Highly recommended!',
          name: 'Robert Chen',
          title: 'Business Owner',
          avatar:
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
        },
      ],
    };
    return testimonials[this.businessType] || testimonials['default'];
  }
}
