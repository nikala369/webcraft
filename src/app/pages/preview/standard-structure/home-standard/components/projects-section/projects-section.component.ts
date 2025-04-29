import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionHoverWrapperComponent } from '../../../../components/section-hover-wrapper/section-hover-wrapper.component';
import { ThemeColorsService } from '../../../../../../core/services/theme/theme-colors.service';

interface ProjectItem {
  title: string;
  description: string;
  image: string;
  category?: string;
  client?: string;
  date?: string;
  featured?: boolean;
  link?: string;
}

@Component({
  selector: 'app-projects-section',
  standalone: true,
  imports: [CommonModule, SectionHoverWrapperComponent],
  templateUrl: './projects-section.component.html',
  styleUrls: ['./projects-section.component.scss'],
})
export class ProjectsSectionComponent {
  @Input({ required: true }) data!: Signal<any>;
  @Input() isMobileLayout: boolean = false;
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'architecture';
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  private themeColorsService = inject(ThemeColorsService);

  // Default projects for Architecture
  private defaultArchitectureProjects: ProjectItem[] = [
    {
      title: 'Modern Residential Villa',
      description:
        'Contemporary villa design with sustainable materials and open living spaces.',
      image: 'assets/standard-projects/project1.jpg',
      category: 'Residential',
      client: 'Private Client',
      date: '2023',
    },
    {
      title: 'Urban Office Complex',
      description:
        'Multi-functional office space with a focus on collaboration and employee wellbeing.',
      image: 'assets/standard-projects/project2.jpg',
      category: 'Commercial',
      client: 'TechCorp Inc.',
      date: '2022',
    },
    {
      title: 'Waterfront Restaurant',
      description:
        'Sustainable restaurant design with panoramic views of the waterfront.',
      image: 'assets/standard-projects/project3.jpg',
      category: 'Hospitality',
      client: 'Oceanside Dining Group',
      date: '2022',
    },
  ];

  // Default projects for Portfolio
  private defaultPortfolioProjects: ProjectItem[] = [
    {
      title: 'E-commerce Website Redesign',
      description:
        'Complete redesign of an e-commerce platform with improved UX and conversion rates.',
      image: 'assets/standard-projects/project1.jpg',
      category: 'Web Design',
      client: 'Fashion Retailer',
      date: '2023',
    },
    {
      title: 'Brand Identity System',
      description:
        'Comprehensive brand identity including logo, color scheme, typography, and brand guidelines.',
      image: 'assets/standard-projects/project2.jpg',
      category: 'Branding',
      client: 'Tech Startup',
      date: '2022',
    },
    {
      title: 'Mobile App User Interface',
      description:
        'Intuitive mobile app interface design for a fitness tracking application.',
      image: 'assets/standard-projects/project3.jpg',
      category: 'UI/UX Design',
      client: 'Health Tech Company',
      date: '2022',
    },
  ];

  /**
   * Get section title based on business type
   */
  getSectionTitle(): string {
    const data = this.data();
    if (data?.pages?.home?.projects?.title) {
      return data.pages.home.projects.title;
    }

    return this.businessType === 'architecture'
      ? 'Featured Projects'
      : 'My Portfolio';
  }

  /**
   * Get section subtitle based on business type
   */
  getSectionSubtitle(): string {
    const data = this.data();
    if (data?.pages?.home?.projects?.subtitle) {
      return data.pages.home.projects.subtitle;
    }

    if (this.businessType === 'architecture') {
      return 'Explore our innovative architectural designs and solutions';
    } else {
      return 'A selection of my creative work and professional projects';
    }
  }

  /**
   * Get projects based on business type or customizations
   */
  getProjects(): ProjectItem[] {
    const data = this.data();
    if (data?.pages?.home?.projects?.items) {
      return data.pages.home.projects.items;
    }

    return this.businessType === 'architecture'
      ? this.defaultArchitectureProjects
      : this.defaultPortfolioProjects;
  }

  /**
   * Handle section selection
   */
  handleSectionSelection() {
    this.sectionSelected.emit({
      key: 'projects',
      name: 'Projects Section',
      path: 'pages.home.projects',
    });
  }

  /**
   * Check if a project is featured
   */
  isProjectFeatured(project: ProjectItem): boolean {
    const data = this.data();
    return project.featured === true;
  }

  /**
   * Check if projects should display categories
   */
  showCategories(): boolean {
    const data = this.data();
    return this.planType === 'premium';
  }

  /**
   * Check if a project has client information
   */
  hasClient(project: ProjectItem): boolean {
    const data = this.data();
    return !!project.client && this.planType === 'premium';
  }

  /**
   * Check if a project has date information
   */
  hasDate(project: ProjectItem): boolean {
    const data = this.data();
    return !!project.date && this.planType === 'premium';
  }

  /**
   * Check if a project has a category assigned
   */
  hasCategory(project: ProjectItem): boolean {
    const data = this.data();
    return !!project.category;
  }

  /**
   * Get a list of all project categories
   */
  getProjectCategories(): string[] {
    const data = this.data();
    const categories = new Set<string>();

    this.getProjects().forEach((project) => {
      if (project.category) {
        categories.add(project.category);
      }
    });

    return Array.from(categories);
  }

  /**
   * Calculate animation delay based on index
   */
  getAnimationDelay(index: number): object {
    const data = this.data();
    const delay = 0.1 + index * 0.1;
    return {
      'animation-delay': `${delay}s`,
    };
  }
}
