import {
  Component,
  Renderer2,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  effect,
} from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ThemeService } from '../../core/services/theme/theme.service';
import { ThemeSwitcherComponent } from './components/theme-switcher/theme-switcher.component';
import {
  FontOption,
  FontSelectorComponent,
} from './components/font-selector/font-selector.component';
import { PreviewViewToggleComponent } from './components/preview-view-toggle/preview-view-toggle.component';
import { ComponentCustomizerComponent } from './components/component-customizer/component-customizer.component';
import { PremiumStructureComponent } from './premium-structure/premium-structure.component';
import { StandardStructureComponent } from './standard-structure/standard-structure.component';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ScrollService } from '../../core/services/shared/scroll/scroll.service';

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
export class PreviewComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  private renderer = inject(Renderer2);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  modalStateService = inject(ScrollService);
  private destroy$ = new Subject<void>();

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
  selectedFont = signal<FontOption | null>(null);

  // Signal to track fullscreen state
  private fullscreenState = signal(false);
  isFullscreen = this.fullscreenState.asReadonly();
  private preFullscreenScrollPosition = 0;

  // Default Theme Id based on plan
  defaultThemeId = computed(() => (this.currentPlan() === 'standard' ? 1 : 4));

  // Customizations from theme service or default
  customizations = signal<Customizations>({
    fontConfig: {
      fontId: 1,
      family: 'Arial',
      fallback: 'sans-serif',
    },
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
          backgroundImage: 'assets/standard-hero1/background-image1.jpg',
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
    effect(
      () => {
        this.modalStateService.setModalOpen(this.selectedComponent() !== null);
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    // Handle window resize
    window.addEventListener('resize', this.updateIsMobile.bind(this));

    // Handle route parameters
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const plan = params['plan'] || 'standard';
        this.currentPlan.set(plan as 'standard' | 'premium');
      });

    // Handle navigation events for page changes
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const routeData = this.route.firstChild?.snapshot.data;
        if (routeData && routeData['page']) {
          const newPage = routeData['page'];
          // Only scroll to top if the page actually changed
          if (this.currentPage() !== newPage) {
            this.currentPage.set(newPage);
            // Scroll the preview area to top when changing pages
            const previewWrapper = document.querySelector('.preview-wrapper');
            if (previewWrapper) {
              previewWrapper.scrollTop = 0;
            }
          }
        }
      });

    // Initial page setup from route
    const initialPage = this.route.firstChild?.snapshot.data['page'];
    if (initialPage) {
      this.currentPage.set(initialPage);
    }

    // Scroll to top when initially entering preview page
    window.scrollTo(0, 0);

    // Load initial theme based on plan
    this.loadTheme(this.defaultThemeId());

    // Ensure view mode is valid
    this.ensureValidViewMode();

    // Add fullscreen change event listener
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);

    // Initial class application
    if (this.isFullscreen()) {
      document.body.classList.add('fullscreen-mode');
    }
  }

  ngOnDestroy(): void {
    // Clean up event listeners
    window.removeEventListener('resize', this.updateIsMobile.bind(this));
    document.removeEventListener(
      'fullscreenchange',
      this.handleFullscreenChange
    );

    // Complete all observables
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Handle fullscreen change events from browser
  handleFullscreenChange = (): void => {
    // If browser ESC key is used to exit fullscreen, make sure we update our state
    if (!document.fullscreenElement && this.isFullscreen()) {
      this.fullscreenState.set(false);

      // Restore main website header z-index
      const mainHeader = document.querySelector('.header') as HTMLElement;
      if (mainHeader) {
        mainHeader.style.zIndex = '1000';
        document.body.style.overflow = ''; // Restore scrolling
      }

      // Restore scroll position when exiting via ESC key
      setTimeout(() => {
        window.scrollTo({
          top: this.preFullscreenScrollPosition,
          behavior: 'auto',
        });
      }, 0);
    }

    // Add fullscreen class based on our internal state, not browser fullscreen
    if (this.isFullscreen()) {
      document.body.classList.add('fullscreen-mode');
    } else {
      document.body.classList.remove('fullscreen-mode');
    }
  };

  // Toggle fullscreen state
  toggleFullscreen(): void {
    if (!this.isFullscreen()) {
      // Store current scroll position before entering fullscreen
      this.preFullscreenScrollPosition = window.scrollY;

      // Enter fullscreen
      this.fullscreenState.set(true);

      // Lower main website header z-index
      const mainHeader = document.querySelector('.header') as HTMLElement;
      if (mainHeader) {
        mainHeader.style.zIndex = '500';
        document.body.style.overflow = 'hidden'; // Prevent scrolling of background
      }
    } else {
      // Exit fullscreen
      this.fullscreenState.set(false);

      // Restore main website header z-index
      const mainHeader = document.querySelector('.header') as HTMLElement;
      if (mainHeader) {
        mainHeader.style.zIndex = '1000';
        document.body.style.overflow = ''; // Restore scrolling
      }

      // After UI updates have been processed, restore the scroll position
      setTimeout(() => {
        window.scrollTo({
          top: this.preFullscreenScrollPosition,
          behavior: 'auto', // Use 'auto' instead of 'smooth' to avoid visible scrolling
        });
      }, 0);
    }
  }

  // Ensure correct view mode when resizing
  ensureValidViewMode(): void {
    if (!this.isMobileView() && this.viewMode() === 'view-mobile') {
      this.viewMode.set('view-desktop');
    }
  }

  // Update mobile view signal on window resize
  updateIsMobile(): void {
    const isNowMobile = window.innerWidth <= 768;
    if (this.isMobileView() !== isNowMobile) {
      this.isMobileView.set(isNowMobile);
      this.ensureValidViewMode();
    }
  }

  // Load theme CSS from backend and apply global styles
  loadTheme(themeId: number): void {
    this.themeService.getById(themeId).subscribe((theme) => {
      this.applyGlobalStyles(theme.cssContent);
      // Update customizations from theme data
      if (theme.customizations) {
        this.customizations.set(theme.customizations);

        // Update selectedFont signal if fontConfig exists in the loaded theme
        if (theme.customizations.fontConfig) {
          const fontConfig = theme.customizations.fontConfig;
          this.selectedFont.set({
            id: fontConfig.fontId,
            family: fontConfig.family,
            fallback: fontConfig.fallback,
          });
        }
      }
    });
  }

  // Toggle between desktop and mobile preview modes
  toggleView(mode: 'view-desktop' | 'view-mobile'): void {
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
    key: string;
    name: string;
    path?: string;
  }): void {
    // We know that the key being emitted should be one of the keys in Customizations,
    this.selectedComponent.set({
      key: selected.key as keyof Customizations,
      name: selected.name,
      path: selected.path,
    });
  }

  // Handler for updates coming from the modal (using selectedCustomization)
  handleComponentUpdate(update: any): void {
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

  // Update the handleFontUpdate method
  handleFontUpdate(font: FontOption): void {
    // Store the complete FontOption object instead of just the string
    this.selectedFont.set(font);

    // Update customizations with minimal required data
    this.customizations.update((current) => ({
      ...current,
      fontConfig: {
        fontId: font.id,
        family: font.family,
        fallback: font.fallback,
      },
    }));
  }

  // Save all customizations (e.g. send to backend)
  saveAllChanges(): void {
    console.log('Saved customizations:', this.customizations());
  }

  // Reset customizations and clear any selected component
  resetCustomizations(): void {
    if (confirm('Are you sure you want to reset all changes?')) {
      // Load default customizations from the theme service
      this.loadTheme(this.defaultThemeId());
      this.selectedComponent.set(null);
    }
  }
}

export interface Customizations {
  fontConfig: {
    fontId: number;
    family: string;
    fallback: string;
  };
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
