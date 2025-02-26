import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-font-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './font-selector.component.html',
  styleUrl: './font-selector.component.scss'
})
export class FontSelectorComponent {
  // List of available fonts
  fonts = signal([
    { id: 1, name: 'Inter', family: 'Inter, sans-serif' },
    { id: 2, name: 'Roboto', family: 'Roboto, sans-serif' },
    { id: 3, name: 'Open Sans', family: 'Open Sans, sans-serif' },
    { id: 4, name: 'Montserrat', family: 'Montserrat, sans-serif' },
    { id: 5, name: 'Playfair Display', family: 'Playfair Display, serif' },
    { id: 6, name: 'Source Code Pro', family: 'Source Code Pro, monospace' }
  ]);

  dropdownOpen = signal(false);
  selectedFont = signal(this.fonts()[0]); // Set default font as first item

  @Output() fontChange = new EventEmitter<string>();

  // Toggle dropdown open/close
  toggleDropdown() {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  // Handle font selection
  selectFont(font: any) {
    this.selectedFont.set(font);
    this.fontChange.emit(font.family);
    this.dropdownOpen.set(false);
  }
}
