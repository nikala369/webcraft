import {Component, inject, Renderer2} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ThemeService} from "./core/services/theme/theme.service";
import {ScrollService} from "./core/services/shared/scroll/scroll.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})

export class AppComponent {
  title = 'Auto Website Builder';
  themeService = inject(ThemeService)
  renderer = inject(Renderer2)
  scrollService = inject(ScrollService)


  ngOnInit() {
    this.themeService.getAll().subscribe({
      next: (res) => {
      }
    })
    this.themeService.getById(1).subscribe({
      next: (res) => {
        this.applyGlobalStyles(res.cssContent);
      }
    })
  }

  applyGlobalStyles(cssContent: string): void {

    let styleTag = document.getElementById('dynamic-theme-style') as HTMLStyleElement;
    if (!styleTag) {
      styleTag = this.renderer.createElement('style');
      this.renderer.setAttribute(styleTag, 'id', 'dynamic-theme-style');
      this.renderer.appendChild(document.head, styleTag);
    }

    console.log('cssContent', cssContent)
    styleTag.innerHTML = cssContent;
  }


}
