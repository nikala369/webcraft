import { Component, Renderer2, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ThemeService } from '../../core/services/theme/theme.service';
import { ThemeSwitcherComponent } from "./components/theme-switcher/theme-switcher.component";
import { FontSelectorComponent } from "./components/font-selector/font-selector.component";
import { PreviewViewToggleComponent } from "./components/preview-view-toggle/preview-view-toggle.component";
import { ComponentCustomizerComponent } from "./components/component-customizer/component-customizer.component";
import { PremiumStructureComponent } from "./premium-structure/premium-structure.component";
import { StandardStructureComponent } from "./standard-structure/standard-structure.component";
import { CommonModule, UpperCasePipe } from "@angular/common";

@Component({
  selector: 'app-preview',
  standalone: true,
  imports: [
    ThemeSwitcherComponent,
    FontSelectorComponent,
    PreviewViewToggleComponent,
    ComponentCustomizerComponent,
    PremiumStructureComponent,
    StandardStructureComponent,
    UpperCasePipe,
    CommonModule
  ],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent {
  themeService = inject(ThemeService);
  renderer = inject(Renderer2);
  route = inject(ActivatedRoute);

  selectedFont = '';
  // Signals
  isMobileView = signal(window.innerWidth <= 768);
  viewMode = signal<'view-desktop' | 'view-mobile'>('view-desktop');
  selectedComponent = signal<{ key: keyof Customizations; name: string } | null>(null);
  currentPlan = signal<'standard' | 'premium'>('standard');

  // Default Theme Id based on plan
  defaultThemeId = computed(() => (this.currentPlan() === 'standard' ? 1 : 4));

  // Customizations state
  customizations = signal<Customizations>({
    header: {
      backgroundColor: '#8080d7',
      textColor: '#f5f5f5',
      logoUrl: '',
      menuItems: [
        { id: 1, label: 'Home', link: '/' },
        { id: 2, label: 'About', link: '/about' },
        { id: 3, label: 'Contact', link: '/contact' }
      ]
    },
    hero: {
      backgroundImage: 'https://example.com/hero.jpg',
      title: 'Your Perfect Website',
      subtitle: 'Fast, beautiful, and easy to customize'
    },
    footer: {
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      copyrightText: '© 2025 MyWebsite'
    }
  });

  // Computed selected customization for the modal
  selectedCustomization = computed(() => {
    const key = this.selectedComponent()?.key;
    return key ? {
      key,
      data: this.customizations()[key]
    } : null;
  });

  constructor() {
    window.addEventListener('resize', this.updateIsMobile.bind(this));
    this.route.queryParams.subscribe((params) => {
      const plan = params['plan'] || 'standard';
      this.currentPlan.set(plan);
    });
  }

  ngOnInit(): void {
    this.loadTheme(this.defaultThemeId());
    this.ensureValidViewMode();
  }

  // Ensure correct view mode when resizing
  ensureValidViewMode() {
    if (!this.isMobileView() && this.viewMode() === 'view-mobile') {
      this.viewMode.set('view-desktop');
    }
  }

  // Update mobile view signal on window resize
  updateIsMobile() {
    const isNowMobile = window.innerWidth <= 768;
    if (this.isMobileView() !== isNowMobile) {
      this.isMobileView.set(isNowMobile);
      this.ensureValidViewMode();
    }
  }

  // Load theme CSS from backend and apply global styles
  loadTheme(themeId: number) {
    this.themeService.getById(themeId).subscribe((theme) => {
      this.applyGlobalStyles(theme.cssContent);
    });
  }

  // Toggle between desktop and mobile preview modes
  toggleView(mode: 'view-desktop' | 'view-mobile') {
    this.viewMode.set(mode);
  }

  // Apply the theme styles by creating/updating a style tag
  applyGlobalStyles(cssContent: string): void {
    let styleTag = document.getElementById('dynamic-theme-style') as HTMLStyleElement;
    if (!styleTag) {
      styleTag = this.renderer.createElement('style');
      this.renderer.setAttribute(styleTag, 'id', 'dynamic-theme-style');
      this.renderer.appendChild(document.head, styleTag);
    }
    styleTag.innerHTML = cssContent;
  }

  // Handler for selection coming from the child structure component
  handleComponentSelection(selected: { key: keyof Customizations; name: string }) {
    this.selectedComponent.set(selected);
  }

  // Handler for updates coming from the modal (using selectedCustomization)
  handleComponentUpdate(update: any) {
    const key = this.selectedComponent()?.key;
    if (!key) return;

    this.customizations.update(current => ({
      ...current,
      [key]: {
        ...current[key],
        ...update
      }
    }));
  }

  // Handler for updates coming directly from the child structure
  handleComponentUpdateFromChild(key: keyof Customizations, update: Partial<Customizations[keyof Customizations]>) {
    this.customizations.update(current => ({
      ...current,
      [key]: { ...current[key], ...update }
    }));
  }

  handleFontUpdate(font: any) {
    this.selectedFont = font;
  }

  // Save all customizations (e.g. send to backend)
  saveAllChanges() {
    console.log('Saved customizations:', this.customizations());
  }

  // Reset customizations and clear any selected component
  resetCustomizations() {
    if (confirm('Are you sure you want to reset all changes?')) {
      this.customizations.set(this.defaultCustomizations());
      this.selectedComponent.set(null);
    }
  }

  // Default customization values
  defaultCustomizations(): Customizations {
    return {
      header: {
        backgroundColor: '#2876FF',
        textColor: '#ffffff',
        logoUrl: '',
        menuItems: [
          { id: 1, label: 'Home', link: '/' },
          { id: 2, label: 'About', link: '/about' },
          { id: 3, label: 'Contact', link: '/contact' }
        ]
      },
      hero: {
        backgroundImage: 'https://example.com/hero.jpg',
        title: '',
        subtitle: ''
      },
      footer: {
        backgroundColor: '#1a1a1a',
        textColor: '#ffffff',
        copyrightText: '© 2025 MyWebsite'
      }
    };
  }
}

export interface Customizations {
  header: {
    backgroundColor: string;
    textColor: string;
    logoUrl: string;
    menuItems: { id: number; label: string; link: string }[];
  };
  hero: {
    backgroundImage: string;
    title: string;
    subtitle: string;
  };
  footer: {
    backgroundColor: string;
    textColor: string;
    copyrightText: string;
  };
}
