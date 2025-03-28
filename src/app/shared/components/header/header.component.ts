import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ScrollService } from '../../../core/services/shared/scroll/scroll.service';

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
  scrolled = false;

  navLinks = [
    { path: '/about', label: 'About' },
    { path: '/pricing', label: 'Plan' },
    { path: '/learn-more', label: 'Learn more' },
    { path: '/contact', label: 'Contact' },
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
}
