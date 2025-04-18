import { Component, inject, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ThemeService } from './core/services/theme/theme.service';
import { ScrollService } from './core/services/shared/scroll/scroll.service';
import { ConfirmationMessageComponent } from './shared/components/confirmation-message/confirmation-message.component';
import { AuthService } from './core/services/auth/auth.service';
import { SessionService } from './core/services/auth/session.service';
import { SessionTimeoutComponent } from './shared/components/session-timeout/session-timeout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ConfirmationMessageComponent,
    SessionTimeoutComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Auto Website Builder';
  themeService = inject(ThemeService);
  renderer = inject(Renderer2);
  scrollService = inject(ScrollService);
  authService = inject(AuthService);
  sessionService = inject(SessionService);

  ngOnInit() {
    // Theme initialization
    // this.themeService.getAll().subscribe({
    //   next: (res) => {},
    // });
    // this.themeService.getById(1).subscribe({
    //   next: (res) => {
    //     this.applyGlobalStyles(res.cssContent);
    //   },
    // });
  }

  applyGlobalStyles(cssContent: string): void {
    let styleTag = document.getElementById(
      'dynamic-theme-style'
    ) as HTMLStyleElement;
    if (!styleTag) {
      styleTag = this.renderer.createElement('style');
      this.renderer.setAttribute(styleTag, 'id', 'dynamic-theme-style');
      this.renderer.appendChild(document.head, styleTag);
    }

    console.log('cssContent', cssContent);
    styleTag.innerHTML = cssContent;
  }
}
