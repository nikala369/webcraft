import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHoverWrapperComponent } from '../../../../../components/section-hover-wrapper/section-hover-wrapper.component';

@Component({
  selector: 'app-about-story-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  templateUrl: './about-story-section.component.html',
  styleUrls: ['./about-story-section.component.scss'],
})
export class AboutStorySectionComponent {
  @Input() data: any = {};
  @Input() isMobileLayout: boolean = false;
  @Input() isMobileView: string = 'view-desktop';
  @Input() businessType: string = 'restaurant';

  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  /**
   * Handle section edit - emit event to open customizer
   */
  handleSectionEdit(sectionId?: string): void {
    console.log('[AboutStorySection] handleSectionEdit called');
    const eventData = {
      key: 'story',
      name: 'Our Story',
      path: 'pages.about.story',
    };
    console.log(
      '[AboutStorySection] Emitting sectionSelected event:',
      eventData
    );
    this.sectionSelected.emit(eventData);
  }

  /**
   * Get story text based on business type
   */
  getStoryText(): string {
    const stories: Record<string, string> = {
      restaurant: `Our culinary journey began over two decades ago with a simple vision: to create a dining experience that brings people together through exceptional food and warm hospitality. What started as a small family kitchen has grown into a beloved destination for food lovers.`,
      salon: `Founded on the belief that beauty is an art form, our salon has been transforming lives for over 15 years. We've built our reputation on exceptional skill, innovative techniques, and a deep commitment to making every client feel their absolute best.`,
      architecture: `For over 20 years, we've been shaping skylines and creating spaces that inspire. Our architectural firm was founded on the principle that great design should enhance the human experience while respecting the environment.`,
      portfolio: `Our creative journey spans over a decade of pushing boundaries and bringing visions to life. We've worked with brands large and small, always maintaining our commitment to innovative design and exceptional execution.`,
      default: `Our company was founded on the principles of excellence, innovation, and dedication to our clients. Over the years, we've grown from a small team with big dreams to a leading force in our industry.`,
    };
    return this.data?.text || stories[this.businessType] || stories['default'];
  }

  /**
   * Get story highlights based on business type
   */
  getStoryHighlights(): Array<{
    icon: string;
    title: string;
    description: string;
  }> {
    const highlights: Record<
      string,
      Array<{ icon: string; title: string; description: string }>
    > = {
      restaurant: [
        {
          icon: 'fas fa-seedling',
          title: 'Farm to Table',
          description:
            'Partnering with local farmers for the freshest ingredients',
        },
        {
          icon: 'fas fa-users',
          title: 'Community First',
          description: 'Supporting local events and charitable causes',
        },
        {
          icon: 'fas fa-medal',
          title: 'Award Winning',
          description: 'Recognized for culinary excellence year after year',
        },
      ],
      salon: [
        {
          icon: 'fas fa-graduation-cap',
          title: 'Continuous Learning',
          description: 'Our team regularly trains with industry leaders',
        },
        {
          icon: 'fas fa-leaf',
          title: 'Eco-Friendly',
          description: 'Committed to sustainable beauty practices',
        },
        {
          icon: 'fas fa-heart',
          title: 'Client Focused',
          description:
            'Building lasting relationships through exceptional service',
        },
      ],
      architecture: [
        {
          icon: 'fas fa-lightbulb',
          title: 'Innovation First',
          description: 'Pioneering sustainable design solutions',
        },
        {
          icon: 'fas fa-award',
          title: 'Industry Recognition',
          description: 'Multiple awards for design excellence',
        },
        {
          icon: 'fas fa-globe',
          title: 'Global Reach',
          description: 'Projects spanning five continents',
        },
      ],
      default: [
        {
          icon: 'fas fa-rocket',
          title: 'Innovation',
          description:
            'Always pushing boundaries and exploring new possibilities',
        },
        {
          icon: 'fas fa-handshake',
          title: 'Partnership',
          description: 'Building lasting relationships with our clients',
        },
        {
          icon: 'fas fa-chart-line',
          title: 'Growth',
          description: 'Continuously evolving to meet changing needs',
        },
      ],
    };
    return highlights[this.businessType] || highlights['default'];
  }

  /**
   * Get story image based on business type
   */
  getStoryImage(): string {
    const images: Record<string, string> = {
      restaurant:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
      salon:
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80',
      architecture:
        'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=80',
      portfolio:
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
      default:
        'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80',
    };
    return this.data?.storyImage || images[this.businessType] || images['default'];
  }
}
