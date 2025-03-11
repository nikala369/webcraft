import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FontOption {
  id: number;
  name?: string;
  family: string;
  weights?: number[];
  category?: 'sans-serif' | 'serif' | 'display' | 'monospace';
  fallback: string;
}

@Component({
  selector: 'app-font-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './font-selector.component.html',
  styleUrl: './font-selector.component.scss',
})
export class FontSelectorComponent {
  // List of available fonts with their weights and categories
  fonts = signal<FontOption[]>([
    {
      id: 1,
      name: 'Inter',
      family: 'Inter',
      weights: [300, 400, 500, 600, 700],
      category: 'sans-serif',
      fallback: 'system-ui, sans-serif',
    },
    {
      id: 2,
      name: 'Roboto',
      family: 'Roboto',
      weights: [300, 400, 500, 700],
      category: 'sans-serif',
      fallback: 'Arial, sans-serif',
    },
    {
      id: 3,
      name: 'Open Sans',
      family: 'Open Sans',
      weights: [300, 400, 600, 700],
      category: 'sans-serif',
      fallback: 'Helvetica, sans-serif',
    },
    {
      id: 4,
      name: 'Montserrat',
      family: 'Montserrat',
      weights: [300, 400, 500, 600, 700],
      category: 'sans-serif',
      fallback: 'Verdana, sans-serif',
    },
    {
      id: 5,
      name: 'Playfair Display',
      family: 'Playfair Display',
      weights: [400, 500, 600, 700],
      category: 'serif',
      fallback: 'Georgia, serif',
    },
    {
      id: 6,
      name: 'Merriweather',
      family: 'Merriweather',
      weights: [300, 400, 700],
      category: 'serif',
      fallback: 'Times New Roman, serif',
    },
    {
      id: 7,
      name: 'Poppins',
      family: 'Poppins',
      weights: [300, 400, 500, 600, 700],
      category: 'sans-serif',
      fallback: 'Arial, sans-serif',
    },
    {
      id: 8,
      name: 'Lato',
      family: 'Lato',
      weights: [300, 400, 700, 900],
      category: 'sans-serif',
      fallback: 'Helvetica, sans-serif',
    },
    {
      id: 9,
      name: 'Source Code Pro',
      family: 'Source Code Pro',
      weights: [400, 500, 600, 700],
      category: 'monospace',
      fallback: 'monospace',
    },
    {
      id: 10,
      name: 'Nunito',
      family: 'Nunito',
      weights: [300, 400, 600, 700],
      category: 'sans-serif',
      fallback: 'Arial, sans-serif',
    },
  ]);

  dropdownOpen = signal(false);
  selectedFont = signal(this.fonts()[0]); // Set default font as first item

  @Input() set currentFont(fontId: number) {
    if (fontId) {
      const font = this.fonts().find((f) => f.id === fontId);
      if (font) {
        this.selectedFont.set(font);
      }
    }
  }

  @Output() fontChange = new EventEmitter<FontOption>();

  constructor() {
    // Preload all fonts when component initializes
    this.preloadFonts();
  }

  // Preload all fonts to ensure they're available
  preloadFonts() {
    this.fonts().forEach((font) => {
      const link = document.createElement('link');
      // Use optional chaining and provide a fallback weight of 400 if weights is undefined
      const weightsParam = font.weights?.join(';') || '400';
      link.href = `https://fonts.googleapis.com/css2?family=${font.family.replace(
        ' ',
        '+'
      )}:wght@${weightsParam}&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    });
  }

  // Toggle dropdown open/close
  toggleDropdown() {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  // Handle font selection
  selectFont(font: FontOption) {
    this.selectedFont.set(font);
    this.fontChange.emit(font);
    this.dropdownOpen.set(false);
  }

  // Get the full font family with fallbacks
  getFontFamily(font: FontOption): any {
    return `${font.family}, ${font.fallback}`;
  }
}
