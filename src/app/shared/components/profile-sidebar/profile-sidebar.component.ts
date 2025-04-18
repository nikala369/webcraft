import {
  Component,
  Inject,
  inject,
  Input,
  PLATFORM_ID,
  signal,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  NavigationEnd,
} from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { trigger, style, animate, transition } from '@angular/animations';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './profile-sidebar.component.html',
  styleUrls: ['./profile-sidebar.component.scss'],
  animations: [
    trigger('sidebarAnimation', [
      transition(':enter', [
        style({ right: '-360px', opacity: 0 }),
        animate('300ms ease-out', style({ right: '0', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ right: '-360px', opacity: 0 })),
      ]),
    ]),
    trigger('overlayAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('linkAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-10px)' }),
        animate(
          '200ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
  ],
})
export class ProfileSidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen = signal(false);

  isMobileDevice = signal(false);
  activeView = signal<'desktop' | 'mobile'>('desktop');

  // Track which links to animate
  animateLinks = signal(false);

  // Track active route for sidebar highlighting
  activeRoute = signal('');
  private routerSubscription?: Subscription;

  authService = inject(AuthService);
  private router = inject(Router);

  // Links for the sidebar navigation
  navLinks = [
    {
      path: '/app/templates',
      label: 'My Templates',
      icon: 'template',
      exact: false,
    },
    { path: '/app/builds', label: 'My Builds', icon: 'build', exact: false },
    {
      path: '/app/domains',
      label: 'Domain Settings',
      icon: 'domain',
      exact: false,
    },
    {
      path: '/app/settings',
      label: 'Account Settings',
      icon: 'settings',
      exact: false,
    },
  ];

  // main website nav links (e.g. for mobile).
  mainNavLinks = [
    { path: '/about', label: 'About', exact: true },
    { path: '/pricing', label: 'Plan', exact: true },
    { path: '/learn-more', label: 'Learn more', exact: true },
    { path: '/contact', label: 'Contact', exact: true },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkViewport();
      window.addEventListener('resize', this.checkViewport.bind(this));
    }
  }

  ngOnInit(): void {
    // Set active route based on current URL
    if (isPlatformBrowser(this.platformId)) {
      this.updateActiveRoute(this.router.url);

      // Subscribe to router events to update active state
      this.routerSubscription = this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event: any) => {
          this.updateActiveRoute(event.urlAfterRedirects);
        });

      // Set with a slight delay to trigger animations after component renders
      setTimeout(() => {
        this.animateLinks.set(true);
      }, 100);
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.checkViewport.bind(this));
    }
  }

  /**
   * Update the active route for sidebar highlighting
   */
  private updateActiveRoute(url: string): void {
    this.activeRoute.set(url);
  }

  private checkViewport(): void {
    if (window.matchMedia('(max-width: 768px)').matches) {
      this.isMobileDevice.set(true);
      this.activeView.set('mobile');
    } else {
      this.isMobileDevice.set(false);
      this.activeView.set('desktop');
    }
  }

  /**
   * Get the current user from auth service
   */
  currentUser() {
    return this.authService.currentUser();
  }

  /**
   * Toggle sidebar visibility
   */
  toggle(): void {
    this.isOpen.update((current) => !current);

    // If opening the sidebar, ensure the body is non-scrollable
    if (isPlatformBrowser(this.platformId) && this.isOpen()) {
      document.body.style.overflow = 'hidden';
    } else if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  /**
   * Close the sidebar
   */
  close(): void {
    this.isOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  /**
   * Get user initials for avatar
   */
  getInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';

    const displayName = user.username || user.email || '';
    if (!displayName) return '?';

    return displayName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Handle logout
   */
  logout(): void {
    this.authService.logout();
    this.close();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Get the current user plan name
   */
  getUserPlan(): string {
    const user = this.authService.currentUser();
    return user?.subscription?.plan || 'Free';
  }

  /**
   * Get CSS class for the plan badge
   */
  getUserPlanClass(): string {
    const plan = this.getUserPlan().toLowerCase();
    return `plan-${plan}`;
  }

  /**
   * Get the plan expiry date if available
   */
  getUserPlanExpiryDate(): Date | null {
    const user = this.authService.currentUser();
    return user?.subscription?.expiryDate
      ? new Date(user.subscription.expiryDate)
      : null;
  }

  /**
   * Check if the user has a premium plan
   */
  isPremiumUser(): boolean {
    const plan = this.getUserPlan().toLowerCase();
    return plan === 'premium' || plan === 'pro';
  }

  /**
   * Navigate to the plans/pricing page
   */
  navigateToPlans(): void {
    this.close();
    this.router.navigate(['/pricing']);
  }

  /**
   * Navigate to dashboard items with smooth transition
   */
  navigateToDashboard(path: string): void {
    // First close the sidebar
    this.close();

    // Add a small delay before navigation to allow sidebar closing animation
    setTimeout(() => {
      this.router.navigate([path]);
    }, 300);
  }

  /**
   * Check if a route is active (for highlighting)
   */
  isRouteActive(path: string): boolean {
    return this.activeRoute().includes(path);
  }
}
