import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHoverWrapperComponent } from '../../../../../components/section-hover-wrapper/section-hover-wrapper.component';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  social?: Array<{ icon: string; url: string }>;
}

@Component({
  selector: 'app-about-team-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  templateUrl: './about-team-section.component.html',
  styleUrls: ['./about-team-section.component.scss'],
})
export class AboutTeamSectionComponent {
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
    console.log('[AboutTeamSection] handleSectionEdit called');
    const eventData = {
      key: 'team',
      name: 'Our Team',
      path: 'pages.about.team',
    };
    console.log(
      '[AboutTeamSection] Emitting sectionSelected event:',
      eventData
    );
    this.sectionSelected.emit(eventData);
  }

  /**
   * Get team members based on business type
   */
  getTeamMembers(): TeamMember[] {
    const teams: Record<string, TeamMember[]> = {
      restaurant: [
        {
          name: 'Chef Michael Chen',
          role: 'Executive Chef',
          bio: 'Award-winning chef with 20 years of culinary excellence',
          image:
            'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80',
          social: [
            { icon: 'fab fa-instagram', url: '#' },
            { icon: 'fab fa-linkedin', url: '#' },
          ],
        },
        {
          name: 'Sarah Williams',
          role: 'Head Sommelier',
          bio: 'Certified sommelier specializing in wine pairings',
          image:
            'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&q=80',
          social: [
            { icon: 'fab fa-twitter', url: '#' },
            { icon: 'fab fa-linkedin', url: '#' },
          ],
        },
        {
          name: 'James Rodriguez',
          role: 'Pastry Chef',
          bio: 'Creating sweet masterpieces that delight the senses',
          image:
            'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&q=80',
          social: [{ icon: 'fab fa-instagram', url: '#' }],
        },
      ],
      salon: [
        {
          name: 'Emma Thompson',
          role: 'Master Stylist',
          bio: 'Specializing in color transformation and modern cuts',
          image:
            'https://images.unsplash.com/photo-1595959183082-7b570b7e08e2?w=400&q=80',
          social: [
            { icon: 'fab fa-instagram', url: '#' },
            { icon: 'fab fa-facebook', url: '#' },
          ],
        },
        {
          name: 'Maria Garcia',
          role: 'Color Specialist',
          bio: 'Expert in balayage and creative color techniques',
          image:
            'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=80',
          social: [{ icon: 'fab fa-instagram', url: '#' }],
        },
        {
          name: 'Lisa Chen',
          role: 'Nail Artist',
          bio: 'Creating stunning nail art and perfect manicures',
          image:
            'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80',
          social: [
            { icon: 'fab fa-tiktok', url: '#' },
            { icon: 'fab fa-instagram', url: '#' },
          ],
        },
      ],
      architecture: [
        {
          name: 'David Anderson',
          role: 'Principal Architect',
          bio: 'Leading sustainable design initiatives for 15+ years',
          image:
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
          social: [{ icon: 'fab fa-linkedin', url: '#' }],
        },
        {
          name: 'Rachel Foster',
          role: 'Design Director',
          bio: 'Specializing in modern residential architecture',
          image:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
          social: [
            { icon: 'fab fa-linkedin', url: '#' },
            { icon: 'fab fa-twitter', url: '#' },
          ],
        },
        {
          name: 'Mark Johnson',
          role: 'Project Manager',
          bio: 'Ensuring projects are delivered on time and budget',
          image:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
          social: [{ icon: 'fab fa-linkedin', url: '#' }],
        },
      ],
      default: [
        {
          name: 'John Smith',
          role: 'Founder & CEO',
          bio: 'Leading with vision and dedication to excellence',
          image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
          social: [
            { icon: 'fab fa-linkedin', url: '#' },
            { icon: 'fab fa-twitter', url: '#' },
          ],
        },
        {
          name: 'Jane Doe',
          role: 'Operations Director',
          bio: 'Ensuring smooth operations and client satisfaction',
          image:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
          social: [{ icon: 'fab fa-linkedin', url: '#' }],
        },
        {
          name: 'Mike Wilson',
          role: 'Lead Developer',
          bio: 'Building innovative solutions for our clients',
          image:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
          social: [
            { icon: 'fab fa-github', url: '#' },
            { icon: 'fab fa-linkedin', url: '#' },
          ],
        },
      ],
    };
    return (
      this.data?.teamMembers || teams[this.businessType] || teams['default']
    );
  }
}
