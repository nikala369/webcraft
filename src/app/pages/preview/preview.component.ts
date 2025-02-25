import { Component, Renderer2, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ThemeService } from '../../core/services/theme/theme.service';
import {ThemeSwitcherComponent} from "./components/theme-switcher/theme-switcher.component";
import {FontSelectorComponent} from "./components/font-selector/font-selector.component";
import {PreviewViewToggleComponent} from "./components/preview-view-toggle/preview-view-toggle.component";
import {ComponentCustomizerComponent} from "./components/component-customizer/component-customizer.component";
import {PremiumStructureComponent} from "./premium-structure/premium-structure.component";
import {StandardStructureComponent} from "./standard-structure/standard-structure.component";
import {UpperCasePipe} from "@angular/common";

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
    UpperCasePipe
  ],
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent {
  themeService = inject(ThemeService);
  renderer = inject(Renderer2);

  selectedTheme = signal<any>(null);
  selectedComponent = signal<any>(null);
  currentPlan = signal<'standard' | 'premium'>('standard');

  customizations = signal<any>({
    color: '#2876FF',
    font: 'Roboto',
    headerText: 'Welcome!',
    logoUrl: '',
    heroImage: ''
  });

  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe((params) => {
      const plan = params['plan'] || 'standard';
      this.changePlan(plan);
    });
  }

  ngOnInit(): void {
    this.loadDefaultTheme(); // Load default theme based on plan
  }

  loadDefaultTheme() {
    const themeId = this.currentPlan() === 'standard' ? 1 : 4;
    this.loadTheme(themeId);
  }

  loadTheme(themeId: any) {
    console.log(themeId, 'themeId');
    this.themeService.getById(themeId).subscribe((theme) => {
      this.selectedTheme.set(theme);
      this.applyGlobalStyles(theme.cssContent);
    });
  }

  changePlan(plan: 'standard' | 'premium') {
    this.currentPlan.set(plan);
  }

  changeView(device: 'mobile' | 'desktop') {
    const viewClass = `${device}-view`;
    document.body.classList.remove('mobile-view', 'desktop-view');
    document.body.classList.add(viewClass);
  }

  applyGlobalStyles(cssContent: any): void {
    let styleTag = document.getElementById('dynamic-theme-style') as HTMLStyleElement;

    if (!styleTag) {
      styleTag = this.renderer.createElement('style');
      this.renderer.setAttribute(styleTag, 'id', 'dynamic-theme-style');
      this.renderer.appendChild(document.head, styleTag);
    }

    styleTag.innerHTML = cssContent;
  }

  // Handle Customization Update (from Modal)
  handleComponentUpdate(update: any) {
    this.customizations.update((current) => ({
      ...current,
      ...update
    }));
  }

  // Select a component for customization
  handleComponentClick(componentId: string) {
    const componentData = this.selectedTheme()?.editableFields[componentId];
    this.selectedComponent.set({ id: componentId, ...componentData });
  }

  selectTheme(themeId: number) {
    this.loadTheme(themeId);
  }

  saveAllChanges() {
    console.log('All changes saved:', this.customizations());
  }

  resetCustomizations() {
    if (confirm('Are you sure you want to reset all changes?')) {
      this.customizations.set({
        color: '#2876FF',
        font: 'Roboto',
        headerText: 'Welcome!',
        logoUrl: '',
        heroImage: ''
      });
    }
  }
}
