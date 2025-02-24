import { Component, Renderer2, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-preview',
  standalone: true,
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent {
  themeService = inject(ThemeService);
  renderer = inject(Renderer2);

  selectedTheme = signal<any>(null);
  sanitizedTemplate = signal<SafeHtml>('');
  selectedComponent = signal<any>(null);
  previewIframe: HTMLIFrameElement | null = null;

  customizations = signal<any>({
    color: '#2876FF',
    font: 'Roboto',
    headerText: 'Welcome!',
    logoUrl: '',
    heroImage: ''
  });

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadTheme(1); // Default theme
  }

  loadTheme(themeId: number | any) {
    this.themeService.getById(themeId).subscribe((theme) => {
      this.selectedTheme.set(theme);
      this.applyGlobalStyles(theme.baseCss);
      this.applyCustomizations();
    });
  }

  changeView(device: 'mobile' | 'desktop') {
    if (this.previewIframe) {
      this.previewIframe.classList.remove('mobile-view', 'desktop-view');
      this.previewIframe.classList.add(`${device}-view`);
    }
  }

  applyGlobalStyles(cssContent: string): void {
    let styleTag = document.getElementById('dynamic-theme-style') as HTMLStyleElement;

    if (!styleTag) {
      styleTag = this.renderer.createElement('style');
      this.renderer.setAttribute(styleTag, 'id', 'dynamic-theme-style');
      this.renderer.appendChild(document.head, styleTag);
    }

    styleTag.innerHTML = cssContent;
  }

  applyCustomizations() {
    let updatedHtml = this.selectedTheme()?.baseHtml;

    Object.keys(this.customizations()).forEach((key) => {
      const value = this.customizations()[key];
      const placeholder = `{{${key}}}`;
      updatedHtml = updatedHtml.replaceAll(placeholder, value);
    });

    const fullContent = `
      <style>${this.selectedTheme()?.baseCss}</style>
      ${updatedHtml}
      <script>
        document.querySelectorAll('[data-editable]').forEach(element => {
          element.addEventListener('click', (event) => {
            window.parent.postMessage({ id: element.dataset.editable }, '*');
          });
        });
      </script>
    `;

    this.sanitizedTemplate.set(this.sanitizer.bypassSecurityTrustHtml(fullContent));
  }

  // Listen for clicks inside the iframe
  initPreview() {
    window.addEventListener('message', (event) => {
      if (event.data.id) {
        this.handleComponentClick(event.data.id);
      }
    });
  }

  handleComponentClick(componentId: string) {
    const componentData = this.selectedTheme()?.editableFields[componentId];
    this.selectedComponent.set({ id: componentId, ...componentData });
  }

  handleComponentUpdate(update: any) {
    this.customizations.update((current) => ({
      ...current,
      ...update
    }));
    this.applyCustomizations();
  }

  handleImageUpload(file: File, type: 'logoUrl' | 'heroImage') {
    this.themeService.uploadFile(file).subscribe((response) => {
      this.customizations.update((c) => ({
        ...c,
        [type]: response.url
      }));
      this.applyCustomizations();
    });
  }

}
