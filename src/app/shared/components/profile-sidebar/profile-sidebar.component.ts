import {Component, Inject, inject, Input, PLATFORM_ID, signal} from '@angular/core';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile-sidebar.component.html',
  styleUrls: ['./profile-sidebar.component.scss'],
})
export class ProfileSidebarComponent {
  @Input() isOpen = signal(false);

  isMobileDevice = signal(false);
  activeView = signal<'desktop' | 'mobile'>('desktop');

  authService = inject(AuthService);
  router = inject(Router);

  // Links for the sidebar navigation
  navLinks = [
    { path: '/app/templates', label: 'My Templates', icon: 'template' },
    { path: '/app/builds', label: 'My Builds', icon: 'build' },
    { path: '/app/domains', label: 'Domain Settings', icon: 'domain' },
    { path: '/app/settings', label: 'Account Settings', icon: 'settings' },
  ];

  // main website nav links (e.g. for mobile).
  mainNavLinks = [
    { path: '/about', label: 'About' },
    { path: '/pricing', label: 'Plan' },
    { path: '/learn-more', label: 'Learn more' },
    { path: '/contact', label: 'Contact' },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkViewport();
      window.addEventListener('resize', this.checkViewport.bind(this));
    }
  }

  private checkViewport(): void {
    if(window.matchMedia('(max-width: 768px)').matches) {
      this.isMobileDevice.set(true);
      this.activeView.set('mobile');
    } else {
      this.isMobileDevice.set(false);
      this.activeView.set('desktop');
    }
  }

  /**
   * Close the sidebar
   */
  close() {
    this.isOpen.set(false);
  }

  /**
   * Get user initials for avatar display
   */
  getInitials(): string {
    const user = this.authService.currentUser();
    if (!user || !user.username) return '?';

    return user.username.substring(0, 2).toUpperCase();
  }

  /**
   * Log out the current user
   */
  logout() {
    this.close();
    this.authService.logout();
  }
}
