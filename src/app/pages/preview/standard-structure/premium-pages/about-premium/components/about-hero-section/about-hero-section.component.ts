import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHoverWrapperComponent } from '../../../../../components/section-hover-wrapper/section-hover-wrapper.component';

@Component({
  selector: 'app-about-hero-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  templateUrl: './about-hero-section.component.html',
  styleUrls: ['./about-hero-section.component.scss'],
})
export class AboutHeroSectionComponent {
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
    this.sectionSelected.emit({
      key: 'hero',
      name: 'About Hero Section',
      path: 'pages.about.hero',
    });
  }

  /**
   * Get business type specific hero stats
   */
  getHeroStats(): Array<{ number: string; label: string }> {
    const stats: Record<string, Array<{ number: string; label: string }>> = {
      restaurant: [
        { number: '15+', label: 'Years Experience' },
        { number: '5★', label: 'Customer Rating' },
        { number: '50K+', label: 'Happy Customers' },
        { number: '25+', label: 'Awards Won' },
      ],
      salon: [
        { number: '12+', label: 'Years Experience' },
        { number: '15+', label: 'Expert Stylists' },
        { number: '10K+', label: 'Satisfied Clients' },
        { number: '20+', label: 'Beauty Awards' },
      ],
      architecture: [
        { number: '20+', label: 'Years Experience' },
        { number: '100+', label: 'Projects Completed' },
        { number: '50+', label: 'Happy Clients' },
        { number: '15+', label: 'Design Awards' },
      ],
      default: [
        { number: '10+', label: 'Years Experience' },
        { number: '100+', label: 'Projects Completed' },
        { number: '50+', label: 'Happy Clients' },
        { number: '5★', label: 'Rating' },
      ],
    };
    return stats[this.businessType] || stats['default'];
  }

  /**
   * Get business type specific title
   */
  getBusinessTypeTitle(): string {
    const titles: Record<string, string> = {
      restaurant: 'Our Culinary Journey',
      salon: 'Beauty & Excellence',
      architecture: 'Design Innovation',
      portfolio: 'Creative Excellence',
      default: 'About Our Company',
    };
    return titles[this.businessType] || titles['default'];
  }

  /**
   * Get business type specific subtitle
   */
  getBusinessTypeSubtitle(): string {
    const subtitles: Record<string, string> = {
      restaurant:
        'Building excellence through dedication and passion for culinary arts',
      salon: 'Transforming beauty with skill, artistry, and years of expertise',
      architecture:
        'Creating spaces that inspire and endure through innovative design',
      portfolio:
        'Bringing creative visions to life through thoughtful design and execution',
      default: 'Building excellence through dedication and innovation',
    };
    return subtitles[this.businessType] || subtitles['default'];
  }
}
