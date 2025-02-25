import { Component, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  isMenuOpen = signal(false);
  scrolled = false; // for controlling the background

  navLinks = [
    { path: '/about', label: 'About' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/learn-more', label: 'Learn more' },
    { path: '/contact', label: 'Contact' }
  ];

  constructor() {}

  // Listen for scroll events
  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = (window.pageYOffset > 50);
  }

  toggleMenu() {
    this.isMenuOpen.update(open => !open);
    document.body.style.overflow = this.isMenuOpen() ? 'hidden' : '';
  }

  closeMenu() {
    this.isMenuOpen.set(false);
    document.body.style.overflow = '';
  }
}
