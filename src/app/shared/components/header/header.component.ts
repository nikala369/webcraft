import {
  Component,
  HostListener,
  inject,
  signal,
  Output,
  EventEmitter,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ScrollService } from '../../../core/services/shared/scroll/scroll.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  isMenuOpen = signal(false);
  modalStateService = inject(ScrollService);
  authService = inject(AuthService);
  scrolled = false;

  // Event to toggle the profile sidebar in parent component
  @Output() toggleSidebar = new EventEmitter<void>();

  navLinks = [
    { path: '/about', label: 'About' },
    { path: '/pricing', label: 'Plan' },
    { path: '/learn-more', label: 'Learn more' },
    { path: '/contact', label: 'Contact' },
  ];

  // Links to show in profile menu when authenticated
  profileLinks = [
    { path: '/app/templates', label: 'My Templates', icon: 'template' },
    { path: '/app/builds', label: 'Builds', icon: 'build' },
    { path: '/app/domains', label: 'Domain Settings', icon: 'domain' },
    { path: '/app/settings', label: 'Account Settings', icon: 'settings' },
  ];

  constructor() {}

  // Listen for scroll events
  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.pageYOffset > 50;
  }

  toggleMenu() {
    this.isMenuOpen.update((open) => !open);
    document.body.style.overflow = this.isMenuOpen() ? 'hidden' : '';
  }

  closeMenu() {
    this.isMenuOpen.set(false);
    document.body.style.overflow = '';
  }

  // Method to open the full profile sidebar
  openProfileSidebar() {
    this.toggleSidebar.emit();
  }

  logout() {
    this.authService.logout();

    // If mobile menu is open, close it
    if (this.isMenuOpen()) {
      this.closeMenu();
    }
  }

  getInitials(): string {
    const user = this.authService.currentUser();
    if (!user || !user.username) return '?';

    return user.username.substring(0, 2).toUpperCase();
  }
}
