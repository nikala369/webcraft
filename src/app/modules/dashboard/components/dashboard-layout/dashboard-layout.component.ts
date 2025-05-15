import {
  Component,
  OnInit,
  inject,
  ElementRef,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterModule,
  Router,
  NavigationEnd,
  Event,
  ActivatedRoute,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { Location } from '@angular/common';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
})
export class DashboardLayoutComponent implements OnInit {
  // Route tracking
  currentRoute: string = '';

  // User information
  userName: string = '';
  userEmail: string = '';

  // Template information
  templateType: string = '';
  templatePlan: string = '';

  // Navigation items
  navItems: NavItem[] = [
    { label: 'My Templates', route: '/app/templates', icon: 'template' },
    { label: 'My Builds', route: '/app/builds', icon: 'build' },
    { label: 'Domain Settings', route: '/app/domains', icon: 'domain' },
    { label: 'Account Settings', route: '/app/settings', icon: 'settings' },
  ];

  // Service injections
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private location = inject(Location);
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnInit(): void {
    // Initialize user information from AuthService
    this.loadUserInfo();

    // Set current route immediately on initialization
    this.currentRoute = this.router.url;

    // Listen for route changes to update the current route
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });
  }

  /**
   * Load user information from the auth service
   */
  private loadUserInfo(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.userName = user.username || 'User';
      this.userEmail = user.email || '';
    }
  }

  /**
   * Get user initials for the avatar
   */
  getInitials(): string {
    if (!this.userName) return 'U';

    const names = this.userName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    } else {
      return (
        names[0].charAt(0) + names[names.length - 1].charAt(0)
      ).toUpperCase();
    }
  }

  /**
   * Check if a nav item is active
   */
  isActive(route: string): boolean {
    return this.currentRoute.includes(route);
  }

  /**
   * Close the dashboard and navigate based on template configuration
   * Now with smooth exit animation
   */
  closeDashboard(): void {
    // First, add the closing animation class
    const dashboardElement =
      this.elementRef.nativeElement.querySelector('.dashboard-layout');
    this.renderer.addClass(dashboardElement, 'closing');

    // Wait for animation to complete before navigating
    setTimeout(() => {
      // Check if we have a template type and plan before navigating
      if (this.templateType && this.templatePlan) {
        // Navigate to preview with the template configuration
        this.router.navigate(['/preview'], {
          queryParams: {
            businessType: this.templateType,
            plan: this.templatePlan,
          },
        });
      } else {
        // Default navigation to pricing page
        this.router.navigate(['/pricing']);
      }
    }, 250); // Match animation duration (slightly shorter to prevent black flash)
  }

  /**
   * Create a new website
   */
  createNewSite(): void {
    this.router.navigate(['/preview'], {
      queryParams: {
        newTemplate: 'true',
      },
    });
  }
}
