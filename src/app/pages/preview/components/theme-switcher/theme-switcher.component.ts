import {Component, EventEmitter, Input, Output, signal} from '@angular/core';

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.scss'
})
export class ThemeSwitcherComponent {
  themes = signal(['theme1', 'theme2', 'theme3']);
  @Output() themeChange = new EventEmitter<string>();

  selectTheme(theme: string) {
    this.themeChange.emit(theme);
  }

}
