import { Component, Renderer2, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ThemeService } from '../../core/services/theme/theme.service';
import { ThemeSwitcherComponent } from './components/theme-switcher/theme-switcher.component';
import { FontSelectorComponent } from './components/font-selector/font-selector.component';
import { PreviewViewToggleComponent } from './components/preview-view-toggle/preview-view-toggle.component';
import { ComponentCustomizerComponent } from './components/component-customizer/component-customizer.component';
import { PremiumStructureComponent } from './premium-structure/premium-structure.component';
import { StandardStructureComponent } from './standard-structure/standard-structure.component';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { filter } from 'rxjs/operators';

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
    CommonModule,
  ],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent {
  themeService = inject(ThemeService);
  renderer = inject(Renderer2);
  route = inject(ActivatedRoute);
  router = inject(Router);

  selectedFont = '';
  // Signals
  isMobileView = signal(window.innerWidth <= 768);
  viewMode = signal<'view-desktop' | 'view-mobile'>('view-desktop');
  selectedComponent = signal<{
    key: keyof Customizations;
    name: string;
    path?: string;
  } | null>(null);
  currentPlan = signal<'standard' | 'premium'>('standard');
  currentPage = signal<string>('home');

  // Default Theme Id based on plan
  defaultThemeId = computed(() => (this.currentPlan() === 'standard' ? 1 : 4));

  // Customizations state
  customizations = signal<Customizations>({
    header: {
      backgroundColor: '#313d7a',
      textColor: '#f5f5f5',
      logoUrl: '',
      menuItems: [
        { id: 1, label: 'Home', link: '/' },
        { id: 2, label: 'About', link: '/about' },
        { id: 3, label: 'Contact', link: '/contact' },
      ],
    },
    pages: {
      home: {
        hero1: {
          backgroundImage: 'https://example.com/hero1.jpg',
          title: 'Grow Your Business With Us',
          subtitle: 'Professional solutions tailored to your business needs',
          layout: 'center',
          showLogo: true,
          titleColor: '#ffffff',
          subtitleColor: '#f0f0f0',
          textShadow: 'medium',
          showPrimaryButton: true,
          primaryButtonText: 'YOUR CUSTOM BUTTON',
          primaryButtonColor: '#ffffff',
          primaryButtonTextColor: '#000000',
          primaryButtonLink: '/contact',
        },
        hero2: {
          backgroundImage: 'https://example.com/hero2.jpg',
          title: 'Our Services',
          subtitle: 'Discover what we can do for you',
        },
      },
      about: {},
      contact: {},
    },
    footer: {
      backgroundColor: '#1a1a1a',
      textColor: '#ffffff',
      copyrightText: '© 2025 MyWebsite',
    },
  });

  // Computed selected customization for the modal
  selectedCustomization = computed(() => {
    const selected = this.selectedComponent();
    if (!selected) return null;

    // If there's a path, use it to get the nested data
    if (selected.path) {
      const pathParts = selected.path.split('.');
      let data = this.customizations() as any;

      // Navigate through the path to get the data
      for (const part of pathParts) {
        if (data && data[part]) {
          data = data[part];
        } else {
          data = {};
          break;
        }
      }

      return {
        key: selected.key,
        name: selected.name,
        path: selected.path,
        data: data,
      };
    }

    // Otherwise use the key directly
    return {
      key: selected.key,
      name: selected.name,
      data: this.customizations()[selected.key],
    };
  });

  constructor() {
    window.addEventListener('resize', this.updateIsMobile.bind(this));
    this.route.queryParams.subscribe((params) => {
      const plan = params['plan'] || 'standard';
      this.currentPlan.set(plan);
    });
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const routeData = this.route.firstChild?.snapshot.data;
        if (routeData && routeData['page']) {
          this.currentPage.set(routeData['page']);
        }
      });

    // Initial page setup from route
    const initialPage = this.route.firstChild?.snapshot.data['page'];
    if (initialPage) {
      this.currentPage.set(initialPage);
    }

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
    let styleTag = document.getElementById(
      'dynamic-theme-style'
    ) as HTMLStyleElement;
    if (!styleTag) {
      styleTag = this.renderer.createElement('style');
      this.renderer.setAttribute(styleTag, 'id', 'dynamic-theme-style');
      this.renderer.appendChild(document.head, styleTag);
    }
    styleTag.innerHTML = cssContent;
  }

  // Handler for selection coming from the child structure component
  handleComponentSelection(selected: {
    key: keyof Customizations;
    name: string;
    path?: string;
  }) {
    this.selectedComponent.set(selected);
  }

  // Handler for updates coming from the modal (using selectedCustomization)
  handleComponentUpdate(update: any) {
    const selected = this.selectedComponent();
    if (!selected) return;

    // If there's a path, update the nested data
    if (selected.path) {
      const pathParts = selected.path.split('.');

      this.customizations.update((current) => {
        // Create a deep copy to avoid mutating the original
        const updated = { ...current };

        // Navigate to the parent object that contains the property to update
        let target: any = updated;
        for (let i = 0; i < pathParts.length - 1; i++) {
          const part = pathParts[i];
          if (!target[part]) {
            target[part] = {};
          }
          target = target[part];
        }

        // Update the property
        const lastPart = pathParts[pathParts.length - 1];
        target[lastPart] = { ...target[lastPart], ...update };
        console.log(updated, 'updated content');
        return updated;
      });
    } else {
      // Original logic for top-level properties
      this.customizations.update((current) => ({
        ...current,
        [selected.key]: {
          ...current[selected.key],
          ...update,
        },
      }));
    }
  }

  // Handler for updates coming directly from the child structure
  handleComponentUpdateFromChild(
    key: keyof Customizations,
    update: Partial<Customizations[keyof Customizations]>
  ) {
    this.customizations.update((current) => ({
      ...current,
      [key]: { ...current[key], ...update },
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
          { id: 3, label: 'Contact', link: '/contact' },
        ],
      },
      pages: {
        home: {
          hero1: {
            backgroundImage: 'https://example.com/hero1.jpg',
            title: 'Grow Your Business With Us',
            subtitle: 'Professional solutions tailored to your business needs',
            layout: 'center',
            showLogo: true,
            titleColor: '#ffffff',
            subtitleColor: '#f0f0f0',
            textShadow: 'medium',
            showPrimaryButton: true,
            primaryButtonText: 'Get Started',
            primaryButtonColor: '#ff5722',
            primaryButtonTextColor: '#ffffff',
            primaryButtonLink: '/contact',
          },
          hero2: {
            backgroundImage: 'https://example.com/hero2.jpg',
            title: 'Our Services',
            subtitle: 'Discover what we can do for you',
          },
        },
        about: {},
        contact: {},
      },
      footer: {
        backgroundColor: '#1a1a1a',
        textColor: '#ffffff',
        copyrightText: '© 2025 MyWebsite',
      },
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
  pages: {
    home?: {
      hero1?: {
        backgroundImage: string;
        title: string;
        subtitle: string;
        layout?: 'center' | 'left' | 'right';
        showLogo?: boolean;
        titleColor?: string;
        subtitleColor?: string;
        textShadow?: 'none' | 'light' | 'medium' | 'heavy';
        showPrimaryButton?: boolean;
        primaryButtonText?: string;
        primaryButtonColor?: string;
        primaryButtonTextColor?: string;
        primaryButtonLink?: string;
      };
      hero2?: {
        backgroundImage: string;
        title: string;
        subtitle: string;
      };
    };
    about?: {};
    contact?: {};
  };
  footer: {
    backgroundColor: string;
    textColor: string;
    copyrightText: string;
  };
}
