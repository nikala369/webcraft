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

  navLinks = [
    { path: '/about', label: 'About' },
    { path: '/packages', label: 'Packages' },
    { path: '/contact', label: 'Contact' }
  ];

  toggleMenu() {
    this.isMenuOpen.update(open => !open);
    // Prevent scrolling when sidebar is open
    document.body.style.overflow = this.isMenuOpen() ? 'hidden' : '';
  }

  closeMenu() {
    this.isMenuOpen.set(false);
    document.body.style.overflow = '';
  }

  @HostListener('window:keydown.escape')
  handleEscape() {
    if (this.isMenuOpen()) {
      this.closeMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // If clicking outside .header and menu is open, close it
    if (!target.closest('.header') && this.isMenuOpen()) {
      this.closeMenu();
    }
  }
}
