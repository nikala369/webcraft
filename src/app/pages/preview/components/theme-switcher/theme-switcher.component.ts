import { Component, EventEmitter, Input, Output, signal, computed, effect } from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss'
})
export class ThemeSwitcherComponent {
  themes = signal([
    { id: 1, name: 'Theme 1' },
    { id: 2, name: 'Theme 2' },
    { id: 3, name: 'Theme 3' },
    { id: 4, name: 'Theme 4' },
    { id: 5, name: 'Theme 5' },
    { id: 6, name: 'Theme 6' }
  ]);

  dropdownOpen = signal(false);
  private planSignal = signal<'standard' | 'premium'>('standard');

  @Input() set plan(value: 'standard' | 'premium') {
    this.planSignal.set(value);
  }

  @Output() themeChange = new EventEmitter<number>();

  // Dynamically update available themes based on the selected plan
  filteredThemes = computed(() => {
    return this.planSignal() === 'standard'
      ? this.themes().filter(theme => theme.id <= 3)
      : this.themes().filter(theme => theme.id >= 4);
  });

  selectedTheme = signal(this.filteredThemes()[0]);

  constructor() {
    // Automatically update selected theme when plan changes
    effect(() => {
      const availableThemes = this.filteredThemes();
      if (!availableThemes.includes(this.selectedTheme())) {
        console.log(availableThemes[0])
        this.selectedTheme.set(availableThemes[0]);
      }
    });
  }

  toggleDropdown() {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  selectTheme(theme: any) {
    this.selectedTheme.set(theme);
    this.themeChange.emit(theme.id);
    this.dropdownOpen.set(false);
  }
}
