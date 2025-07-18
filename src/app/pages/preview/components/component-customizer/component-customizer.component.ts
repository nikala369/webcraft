import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener,
  AfterViewInit,
  signal,
  computed,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Services
import { ModalService } from '../../../../core/services/modal/modal.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { CustomizerSoundService } from '../../../../core/services/audio/customizer-sound.service';
import { ImageService } from '../../../../core/services/shared/image/image.service';

// Components & Directives
import {
  DraggableDirective,
  DragPosition,
} from '../../../../shared/directives/draggable.directive';
import { ResizableDirective } from '../../../../shared/directives/resizable.directive';
import { CustomSelectComponent } from '../../../../shared/components/custom-select/custom-select.component';
import { ReactiveImageComponent } from '../../../../shared/components/reactive-image/reactive-image.component';

// Data & Configuration
import { FieldConfig, getPlanSpecificConfig } from './customizing-form-config';

// Types
type CustomizerData = Record<string, unknown>;

@Component({
  selector: 'app-component-customizer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CustomSelectComponent,
    ReactiveImageComponent,
    DraggableDirective,
    ResizableDirective,
  ],
  templateUrl: './component-customizer.component.html',
  styleUrls: ['./component-customizer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({
          transform: 'translateY(-100%)',
          opacity: 0,
        }),
        animate(
          '400ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({
            transform: 'translateY(0)',
            opacity: 1,
          })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({
            transform: 'translateY(-100%)',
            opacity: 0,
          })
        ),
      ]),
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('200ms ease', style({ opacity: 0 }))]),
    ]),
  ],
})
export class ComponentCustomizerComponent implements OnInit, OnDestroy {
  @ViewChild(DraggableDirective) draggableDirective!: DraggableDirective;
  @ViewChild(ResizableDirective) resizableDirective!: ResizableDirective;

  private _componentKey!: string;
  @Input() set componentKey(value: string) {
    if (this._componentKey !== value) {
      console.log(
        `[ComponentCustomizer] componentKey changing from ${this._componentKey} to ${value}`
      );
      this._componentKey = value;
      // Clear cached config when component key changes
      this._cachedFieldsConfig = null;
      // Reset active category to ensure proper initialization
      this.activeCategory.set('general');
    }
  }
  get componentKey(): string {
    return this._componentKey;
  }

  /**
   * Get component key as a regular property (not signal)
   */
  getComponentKey(): string {
    return this._componentKey;
  }

  @Input() componentPath?: string;
  @Input() userTemplateId?: string;

  private _planType: string = 'standard';
  @Input() set planType(value: string) {
    if (this._planType !== value) {
      console.log(
        `[ComponentCustomizer] Plan type changed from ${this._planType} to ${value} - clearing cache`
      );
      this._planType = value;
      // Clear cached config when plan type changes
      this._cachedFieldsConfig = null;
    }
  }
  get planType(): string {
    return this._planType;
  }

  @Input() businessType!: string;
  originalData: any;
  isVisible = signal(false);
  isReady = signal(false);
  isDragging = signal(false);
  isResizing = signal(false);

  // Use a signal for activeCategory for better state management
  activeCategory = signal('general');

  // Store last-used tab per component with session storage persistence
  private lastActiveCategory: Record<string, string> = {};
  private readonly TAB_MEMORY_KEY = 'webcraft_customizer_tab_memory';

  // Inject the toast service
  private toastService = inject(ToastService);
  private modalService = inject(ModalService);
  private customizerSoundService = inject(CustomizerSoundService);
  private imageService = inject(ImageService);
  private cdr = inject(ChangeDetectorRef);

  // Data structure for storing video placeholder metadata
  videoPlaceholders: Record<string, { fileName: string; timestamp: string }> =
    {};

  // Window dimensions for resizing
  maxResizeHeight = signal<number>(window.innerHeight - 40);

  @HostListener('window:resize')
  onWindowResize() {
    this.maxResizeHeight.set(window.innerHeight - 40);
  }

  @Input() set initialData(value: any) {
    console.log(
      `[ComponentCustomizer] initialData setter called for ${this.componentKey} with:`,
      value
    );

    // DEBUG: Special logging for backgroundAnimation field
    if (
      this.componentKey === 'pages.home.hero1' ||
      this.componentKey.includes('hero')
    ) {
      console.log(
        `[ComponentCustomizer] HERO BACKGROUND ANIMATION DEBUG - Initial data:`,
        {
          componentKey: this.componentKey,
          backgroundAnimation: value?.backgroundAnimation,
          hasBackgroundAnimation: value && 'backgroundAnimation' in value,
        }
      );
    }

    if (value) {
      // Store original for reset functionality
      this.originalData = structuredClone(value);

      // Get fields configuration
      const configFields = this.getFieldsConfig();
      console.log(
        `[ComponentCustomizer] Config fields for ${this.componentKey}:`,
        configFields
      );

      // Start with component ID and existing data
      const mergedData = { id: this.componentKey, ...value };

      // Apply default values for fields that don't have data
      if (configFields && configFields.length > 0) {
        // Apply defaults from field config where missing
        configFields.forEach((field: FieldConfig) => {
          // DEBUG: Special logging for backgroundAnimation field
          if (
            field.key === 'backgroundAnimation' &&
            (this.componentKey === 'pages.home.hero1' ||
              this.componentKey.includes('hero'))
          ) {
            console.log(
              `[ComponentCustomizer] BACKGROUND ANIMATION DEFAULT CHECK:`,
              {
                fieldKey: field.key,
                fieldDefaultValue: field.defaultValue,
                currentValue: mergedData[field.key],
                currentValueType: typeof mergedData[field.key],
                isUndefined: mergedData[field.key] === undefined,
                isNull: mergedData[field.key] === null,
                isEmpty: mergedData[field.key] === '',
                willApplyDefault:
                  field.defaultValue !== undefined &&
                  (mergedData[field.key] === undefined ||
                    mergedData[field.key] === null),
              }
            );
          }

          // Handle nested fields (like socialUrls.facebook)
          if (field.key.includes('.')) {
            const [parentKey, childKey] = field.key.split('.');

            // Initialize parent object if it doesn't exist
            if (!mergedData[parentKey]) {
              mergedData[parentKey] = {};
            }

            // Only set default if child property doesn't exist
            if (
              field.defaultValue !== undefined &&
              (mergedData[parentKey][childKey] === undefined ||
                mergedData[parentKey][childKey] === null)
            ) {
              mergedData[parentKey][childKey] = field.defaultValue;
            }
          } else {
            // Handle regular fields - BE CAREFUL WITH DEFAULTS
            if (
              field.defaultValue !== undefined &&
              (mergedData[field.key] === undefined ||
                mergedData[field.key] === null)
            ) {
              // CRITICAL FIX: For backgroundAnimation, only apply 'none' default if there's truly no value
              // This prevents overriding saved values like 'gradient-shift' with 'none'
              if (
                field.key === 'backgroundAnimation' &&
                (this.componentKey === 'pages.home.hero1' ||
                  this.componentKey.includes('hero'))
              ) {
                // Only apply default if the field is completely missing from the data
                if (
                  !(field.key in mergedData) ||
                  mergedData[field.key] === null ||
                  mergedData[field.key] === undefined
                ) {
                  mergedData[field.key] = field.defaultValue;
                  console.log(
                    `[ComponentCustomizer] Applied default for backgroundAnimation: ${field.defaultValue}`
                  );
                }
              } else {
                mergedData[field.key] = field.defaultValue;
              }
            }
          }
        });
      }

      // Special handling for menu section - ensure categories are properly initialized
      if (
        this.componentKey === 'pages.home.menu' ||
        this.componentKey.includes('menu')
      ) {
        if (
          !mergedData.categories ||
          !Array.isArray(mergedData.categories) ||
          mergedData.categories.length === 0
        ) {
          console.log(
            '[ComponentCustomizer] Initializing empty menu data with default categories'
          );
          mergedData.categories = [
            {
              id: 'cat1',
              name: 'Starters',
              description: 'Perfect appetizers to begin your meal.',
              items: [
                {
                  id: 'item1',
                  name: 'Bruschetta',
                  description:
                    'Toasted bread with fresh tomatoes, garlic, and basil.',
                  price: '$8.99',
                  featured: true,
                },
                {
                  id: 'item2',
                  name: 'Soup of the Day',
                  description: 'Ask your server about our daily special.',
                  price: '$7.99',
                },
              ],
            },
            {
              id: 'cat2',
              name: 'Main Courses',
              description: 'Our signature dishes and specialties.',
              items: [
                {
                  id: 'item3',
                  name: 'Grilled Salmon',
                  description:
                    'Fresh Atlantic salmon with seasonal vegetables.',
                  price: '$24.99',
                  featured: true,
                },
                {
                  id: 'item4',
                  name: 'Pasta Primavera',
                  description:
                    'Fresh pasta with seasonal vegetables in light cream sauce.',
                  price: '$18.99',
                },
              ],
            },
          ];
        }
      }

      // Smart CTA button logging for hero sections
      if (this.componentKey.includes('hero1')) {
        console.log(
          `[SmartCTA] Hero1 configuration for business type: ${this.businessType}`
        );
        console.log(`[SmartCTA] Plan: ${this.planType}`);
        console.log(`[SmartCTA] Button text default: ${mergedData.buttonText}`);
        console.log(
          `[SmartCTA] Button scroll target: ${mergedData.buttonScrollTargetID}`
        );
        console.log(`[SmartCTA] Button link: ${mergedData.buttonLink}`);
      }

      // DEBUG: Final backgroundAnimation value check
      if (
        this.componentKey === 'pages.home.hero1' ||
        this.componentKey.includes('hero')
      ) {
        console.log(
          `[ComponentCustomizer] HERO BACKGROUND ANIMATION DEBUG - Final merged data:`,
          {
            componentKey: this.componentKey,
            finalBackgroundAnimation: mergedData.backgroundAnimation,
            originalBackgroundAnimation: value?.backgroundAnimation,
            wasDefaultApplied:
              mergedData.backgroundAnimation === 'none' &&
              (!value?.backgroundAnimation ||
                value?.backgroundAnimation === undefined ||
                value?.backgroundAnimation === null),
          }
        );
      }

      // Set the local data signal
      this.localData.set(mergedData);
      console.log(
        `[ComponentCustomizer] Final merged data for ${this.componentKey}:`,
        {
          mergedData,
          backgroundAnimation: mergedData.backgroundAnimation,
          textAnimation: mergedData.textAnimation,
          hasBackgroundAnimation: 'backgroundAnimation' in mergedData,
          hasTextAnimation: 'textAnimation' in mergedData,
        }
      );
    } else {
      console.warn('Component customizer received null/undefined initial data');
      // Initialize with empty object and component ID
      this.localData.set({ id: this.componentKey });
    }
  }

  @Output() update = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  // Component data handling
  localData = signal<any>({});

  // Cache field configuration to prevent recalculation and disappearing fields
  private _cachedFieldsConfig: FieldConfig[] | null = null;

  // Create stable field objects that won't recreate on data changes
  private fieldCache = new Map<string, any>();

  // Convert field visibility checks to computed signals
  visibleFields = computed(() => {
    const fields = this.fieldsForCategory();
    const data = this.localData();

    // Create stable field objects with memoization
    return fields.map((field) => {
      const cacheKey = `${this.componentKey}-${field.key}`;
      let baseField = this.fieldCache.get(cacheKey);

      if (!baseField) {
        baseField = {
          ...field,
          id: cacheKey, // Stable ID for trackBy
        };
        this.fieldCache.set(cacheKey, baseField);
      }

      // Return field with computed visibility and label visibility
      return {
        ...field,
        isVisible: this.checkFieldVisibility(field, data),
        // @ts-ignore - Type mismatch in legacy field config
        showLabel: field.type !== 'boolean',
        value: this.getFieldValueComputed(field.key, data),
      };
    });
  });

  // Track by function for stable rendering
  trackByFieldId = (index: number, field: any): string => {
    return field.id;
  };

  // Check field visibility without DOM queries
  private checkFieldVisibility(field: FieldConfig, data: any): boolean {
    // For header component, handle gradient field visibility
    if (this.componentKey === 'header' && this.planType === 'premium') {
      if (
        field.key === 'customGradientColor1' ||
        field.key === 'customGradientColor2' ||
        field.key === 'customGradientAngle'
      ) {
        return data['headerBackgroundType'] === 'custom';
      }
    }

    // Background type dependent fields
    if (field.key === 'backgroundImage') {
      return data['backgroundType'] === 'image' || !data['backgroundType'];
    }

    if (field.key === 'backgroundVideo') {
      return data['backgroundType'] === 'video';
    }

    return true;
  }

  // Get field value without function calls in template
  private getFieldValueComputed(fieldKey: string, data: any): any {
    // Check if this is a nested field (contains a dot)
    if (fieldKey.includes('.')) {
      const [parentKey, childKey] = fieldKey.split('.');
      return data[parentKey]?.[childKey] ?? '';
    }
    // Regular field - use nullish coalescing to preserve falsy values like 'false', '0'
    const value = data[fieldKey] ?? '';

    // DEBUG: Special logging for backgroundAnimation field
    if (
      fieldKey === 'backgroundAnimation' &&
      (this.componentKey === 'pages.home.hero1' ||
        this.componentKey.includes('hero'))
    ) {
      console.log(
        `[ComponentCustomizer] getFieldValueComputed for backgroundAnimation:`,
        {
          fieldKey,
          rawValue: data[fieldKey],
          finalValue: value,
          dataKeys: Object.keys(data),
          componentKey: this.componentKey,
        }
      );
    }

    return value;
  }

  /**
   * Get image URL for display from objectId, temporary file, or legacy URL
   * This is now handled by the ImageService and ReactiveImageComponent
   */
  getImageUrl(imageValue: any): string {
    return this.imageService.getImageUrl(imageValue);
  }

  // Convert select options to computed signal
  selectOptionsMap = computed(() => {
    const fields = this.getFieldsConfig();
    const optionsMap: Record<string, any[]> = {};

    fields.forEach((field) => {
      if (field.type === 'select' && field.options) {
        optionsMap[field.key] = field.options.map((option) => ({
          value: option.value,
          label: option.label,
          icon:
            (option as any).icon ||
            (option.label.includes('🌅')
              ? option.label.split(' ')[0]
              : undefined),
        }));
      }
    });

    console.log(
      `[ComponentCustomizer] selectOptionsMap for ${this.componentKey}:`,
      optionsMap
    );
    return optionsMap;
  });

  // Category validation as computed signal
  categoryValidationStatus = computed(() => {
    const data = this.localData();
    const result: Record<string, boolean> = {};

    // Get all available categories
    const categories = this.categories().map((cat) => cat.id);

    // Initialize all categories as valid
    categories.forEach((cat: string) => {
      result[cat] = true;
    });

    // Special case for hero section
    if (this.componentKey.includes('hero')) {
      const contentValid = this.isContentCategoryValidComputed(data);
      result['content'] = contentValid;
      return result;
    }

    // For other components, check each required field
    const requiredFields = this.getFieldsConfig().filter(
      (field) => field.required === true
    );

    requiredFields.forEach((field) => {
      const isValid =
        field.type === 'text'
          ? data[field.key]?.trim?.() !== ''
          : data[field.key] !== undefined && data[field.key] !== null;

      if (!isValid && field.category) {
        result[field.category] = false;
      }
    });

    return result;
  });

  // Special validation for content category in hero section
  private isContentCategoryValidComputed(data: any): boolean {
    if (data.backgroundType === 'video') {
      return !!data.backgroundVideo;
    }

    if (data.backgroundType === 'image' || !data.backgroundType) {
      return !!data.backgroundImage;
    }

    return true;
  }

  // Helper to get field config for this component
  getFieldsConfig(): FieldConfig[] {
    // Return cached config if available
    if (this._cachedFieldsConfig) {
      return this._cachedFieldsConfig;
    }

    try {
      // Safety checks
      if (!this.componentKey) {
        console.warn('getFieldsConfig called without componentKey');
        return [];
      }

      if (!this.planType) {
        console.warn('getFieldsConfig called without planType');
        return [];
      }

      console.log(`[ComponentCustomizer] getFieldsConfig called for:`, {
        componentKey: this.componentKey,
        planType: this.planType,
        businessType: this.businessType,
      });

      // Use the plan-specific config function to get fields appropriate for the plan type
      // Pass business type for smart defaults
      const config = getPlanSpecificConfig(
        this.componentKey,
        this.planType as 'standard' | 'premium',
        this.businessType // Pass business type for smart CTA defaults
      );

      console.log(
        `[ComponentCustomizer] getPlanSpecificConfig returned:`,
        config
      );

      // Debug log for header configuration
      if (this.componentKey === 'header') {
        console.log(
          `[ComponentCustomizer] Loading config for header with plan: ${this.planType}`
        );
        console.log(
          `[ComponentCustomizer] Header config fields:`,
          // @ts-ignore - Legacy config mapping
          config.map((f) => f.key)
        );
        const headerBgType = config.find(
          (f: any) => f.key === 'headerBackgroundType'
        );
        if (headerBgType) {
          console.log(
            `[ComponentCustomizer] headerBackgroundType options:`,
            headerBgType.options
          );
        }
      }

      // Safety check for config result
      if (!Array.isArray(config)) {
        console.warn('getPlanSpecificConfig returned non-array:', config);
        return [];
      }

      // Cache the configuration
      this._cachedFieldsConfig = config;
      return config;
    } catch (error) {
      console.error('Error in getFieldsConfig:', error);
      return [];
    }
  }

  // Form validation signal
  isValid = computed(() => {
    const data = this.localData();
    const requiredFields = this.getFieldsConfig().filter(
      (field) => field.required === true
    );

    // Special validation for hero section with background type
    if (this.componentKey.includes('hero') && data.backgroundType) {
      // For video background, require backgroundVideo
      if (data.backgroundType === 'video') {
        return !!data.backgroundVideo;
      }

      // For image background, require backgroundImage
      if (data.backgroundType === 'image') {
        return !!data.backgroundImage;
      }
    }

    // Regular validation for other components
    return requiredFields.every((field: FieldConfig) => {
      if (field.type === 'text') {
        return data[field.key]?.trim?.() !== '';
      }
      return data[field.key] !== undefined && data[field.key] !== null;
    });
  });

  // Make categories a computed signal based on field configurations
  categories = computed(() => {
    const allFields = this.getFieldsConfig();
    const availableCategories: { id: string; label: string }[] = [];

    if (allFields.some((field) => field.category === 'general')) {
      availableCategories.push({ id: 'general', label: 'General' });
    }
    if (allFields.some((field) => field.category === 'content')) {
      availableCategories.push({ id: 'content', label: 'Content' });
    }
    if (allFields.some((field) => field.category === 'styling')) {
      availableCategories.push({ id: 'styling', label: 'Styling' });
    }

    if (availableCategories.length === 0) {
      // Fallback if no categories found
      availableCategories.push({ id: 'general', label: 'General' });
    }
    return availableCategories;
  });

  // Convert getFieldsForCategory to a computed signal to prevent infinite loops
  fieldsForCategory = computed(() => {
    try {
      const allFields = this.getFieldsConfig();
      if (!Array.isArray(allFields)) return [];

      const currentActiveCategory = this.activeCategory(); // Use signal value

      // Debug: Log fields for standard plan header styling
      if (
        this.componentKey === 'header' &&
        this.planType === 'standard' &&
        currentActiveCategory === 'styling'
      ) {
        console.log(
          '[PremiumUpsell] STANDARD HEADER STYLING FIELDS:',
          allFields.map((f) => ({ key: f.key, category: f.category }))
        );

        const hasHeaderBgType = allFields.some(
          (f) => f.key === 'headerBackgroundType'
        );
        console.log(
          '[PremiumUpsell] headerBackgroundType field present:',
          hasHeaderBgType
        );
      }

      const categoryFields = allFields.filter(
        (field) => field && field.category === currentActiveCategory
      );

      // GUARD: If there are no fields for the active category, return []
      if (!categoryFields.length) {
        console.warn('No fields found for category:', currentActiveCategory);
        return [];
      }

      // Filter fields based on component and plan logic (STATIC FILTERING ONLY)
      let filteredFields = categoryFields;

      if (
        this.componentKey === 'header' &&
        currentActiveCategory === 'content'
      ) {
        // For standard plan, hide the ability to add/remove menu items
        filteredFields = categoryFields.filter((field) => {
          if (this.planType === 'standard' && field.key === 'menuItems') {
            return false;
          }
          return true;
        });
      }

      // Only apply static filtering that doesn't depend on changing data
      return filteredFields.filter((field) => {
        // Safety check: if field is undefined or null, don't show it
        if (!field || !field.key) {
          return false;
        }

        // For header component, STATIC filtering only
        if (this.componentKey === 'header') {
          // For standard plan, these fields should never exist in the config anyway
          if (
            this.planType === 'standard' &&
            (field.key === 'customGradientColor1' ||
              field.key === 'customGradientColor2' ||
              field.key === 'customGradientAngle')
          ) {
            return false;
          }
        }

        // All other fields are shown by default
        return true;
      });
    } catch (error) {
      console.error('Error in fieldsForCategory computed:', error);
      return [];
    }
  });

  constructor(private el: ElementRef) {}

  // Helper to validate and set activeCategory
  private validateActiveCategory() {
    const currentCats = this.categories();
    const currentActive = this.activeCategory();
    if (
      currentCats.length > 0 &&
      !currentCats.some((cat) => cat.id === currentActive)
    ) {
      this.activeCategory.set(currentCats[0].id);
    }
  }

  /**
   * ngOnChanges - Handle input changes and state initialization
   * This is the proper Angular lifecycle hook for reacting to @Input changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    // Initialize state when inputs change
    if (
      changes['componentKey'] ||
      changes['initialData'] ||
      changes['planType'] ||
      changes['businessType']
    ) {
      // Initialize local data
      if (this.initialData) {
        this.localData.set({
          id: this.componentKey,
          ...structuredClone(this.initialData),
        });
        this.originalData = structuredClone(this.initialData);
      }

      // Load tab memory
      this.loadTabMemoryFromStorage();

      // Do NOT clear position here! Only on ngOnInit/open/reset.

      // CRITICAL FIX: Only make visible when componentKey changes (new component selected)
      if (changes['componentKey'] && this.componentKey) {
        console.log(
          '[ComponentCustomizer] New component selected:',
          this.componentKey
        );

        // Make visible for editing
        this.isVisible.set(true);

        // Play opening sound effect
        this.customizerSoundService.play(true);

        // Restore last active or default category BEFORE animation
        this.restoreActiveCategory();

        // Trigger slide-down animation after a brief delay so sidebar starts hidden then animates
        requestAnimationFrame(() => {
          this.isReady.set(true);
        });
      } else if (
        changes['initialData'] ||
        changes['planType'] ||
        changes['businessType']
      ) {
        // For other input changes, just update the data without showing sidebar
        console.log(
          '[ComponentCustomizer] Input updated without opening sidebar'
        );

        // Only restore category if already visible
        if (this.isVisible()) {
          this.restoreActiveCategory();
        }
      }
    }
  }

  /**
   * ngOnInit - Signal that component is ready for animation
   * This is simplified to only handle the readiness signal
   */
  ngOnInit(): void {
    // Load tab memory from session storage
    this.loadTabMemoryFromStorage();

    // Clear saved position and size to ensure default position
    this.clearSavedPositionAndSize();

    // Initialize drag position tracking
    this.initializeDragPositionTracking();

    // Signal that component is ready
    this.isReady.set(true);

    // Make component visible to trigger :enter animation
    setTimeout(() => {
      this.isVisible.set(true);
    }, 50); // Small delay to ensure DOM is ready
  }

  /**
   * ngOnDestroy - Cleanup resources
   */
  ngOnDestroy(): void {
    // Clear any pending uploads
    this.pendingUploads.clear();

    // Reset signals
    this.isVisible.set(false);
    this.isReady.set(false);
  }

  /**
   * Initialize drag position tracking for reset button functionality
   */
  private initializeDragPositionTracking(): void {
    // Set up initial position tracking
    this.dragPosition.set({ x: 0, y: 0 });
    this.defaultPosition.set({ x: 0, y: 0 });
  }

  /**
   * Initialize component state based on inputs
   */
  private initializeComponentState(): void {
    console.log('[ComponentCustomizer] Initializing component state:', {
      componentKey: this.componentKey,
      hasOriginalData: !!this.originalData,
      originalData: this.originalData,
      originalDataKeys: this.originalData ? Object.keys(this.originalData) : [],
      // For menu components specifically
      isMenuComponent: this.componentKey === 'menu',
      menuData: this.componentKey === 'menu' ? this.originalData : null,
      menuCategories:
        this.componentKey === 'menu' ? this.originalData?.categories : null,
      menuCategoriesCount:
        this.componentKey === 'menu'
          ? this.originalData?.categories?.length || 0
          : 0,
    });

    // Ensure componentKey is set
    if (!this.componentKey) {
      console.error(
        '[ComponentCustomizer] Cannot initialize without componentKey'
      );
      return;
    }

    // Clear cached config when component key or plan changes
    this._cachedFieldsConfig = null;

    // Initialize with merged data if we have initial data
    if (this.originalData) {
      this.setupInitialData();
    } else {
      // Initialize with empty object and component ID
      this.localData.set({ id: this.componentKey });
    }

    // Restore last-used tab if valid, else default to first
    this.restoreActiveCategory();
  }

  /**
   * Setup initial data with field defaults
   */
  private setupInitialData(): void {
    // Store original for reset functionality
    const originalCopy = structuredClone(this.originalData);

    // Get fields configuration
    const configFields = this.getFieldsConfig();
    console.log('[ComponentCustomizer] Config fields:', configFields);

    // Start with component ID and existing data
    const mergedData = { id: this.componentKey, ...originalCopy };

    // Special handling for menu component to ensure proper categories structure
    if (this.componentKey === 'menu' && originalCopy) {
      console.log('[ComponentCustomizer] Setting up menu data:', {
        originalData: originalCopy,
        hasCategories: !!originalCopy.categories,
        categoriesCount: originalCopy.categories?.length || 0,
        hasMenuProperty: !!originalCopy.menu,
        menuCategories: originalCopy.menu?.categories,
      });

      // Ensure categories are properly structured
      if (originalCopy.categories && Array.isArray(originalCopy.categories)) {
        mergedData.categories = originalCopy.categories;
      } else if (
        originalCopy.menu?.categories &&
        Array.isArray(originalCopy.menu.categories)
      ) {
        mergedData.categories = originalCopy.menu.categories;
      }

      console.log('[ComponentCustomizer] Menu data after setup:', {
        mergedData,
        hasCategories: !!mergedData.categories,
        categoriesCount: mergedData.categories?.length || 0,
      });
    }

    // Apply default values for fields that don't have data
    if (configFields && configFields.length > 0) {
      configFields.forEach((field: FieldConfig) => {
        // Handle nested fields (like socialUrls.facebook)
        if (field.key.includes('.')) {
          const [parentKey, childKey] = field.key.split('.');

          // Initialize parent object if it doesn't exist
          if (!mergedData[parentKey]) {
            mergedData[parentKey] = {};
          }

          // Only set default if child property doesn't exist
          if (
            field.defaultValue !== undefined &&
            (mergedData[parentKey][childKey] === undefined ||
              mergedData[parentKey][childKey] === null)
          ) {
            mergedData[parentKey][childKey] = field.defaultValue;
          }
        } else {
          // Handle direct properties
          if (
            field.defaultValue !== undefined &&
            (mergedData[field.key] === undefined ||
              mergedData[field.key] === null ||
              mergedData[field.key] === '')
          ) {
            mergedData[field.key] = field.defaultValue;
          }
        }
      });
    }

    // Set the merged data
    this.localData.set(mergedData);

    console.log('[ComponentCustomizer] Final merged data:', {
      componentKey: this.componentKey,
      mergedData,
      isMenuComponent: this.componentKey === 'menu',
      finalCategories:
        this.componentKey === 'menu' ? mergedData.categories : null,
    });
  }

  /**
   * Restore active category from memory or set default
   */
  private restoreActiveCategory(): void {
    const availableCategories = this.categories();
    const lastCategory = this.lastActiveCategory[this.componentKey];

    if (
      lastCategory &&
      availableCategories.some((c) => c.id === lastCategory)
    ) {
      this.activeCategory.set(lastCategory);
    } else if (availableCategories.length > 0) {
      this.activeCategory.set(availableCategories[0].id);
    } else {
      // Force general category as fallback
      this.activeCategory.set('general');
    }

    // Validate activeCategory after setting
    this.validateActiveCategory();

    // Check validation status and auto-select category with errors if any
    const validationStatus = this.categoryValidationStatus();
    const invalidCategory = Object.entries(validationStatus).find(
      ([_category, isValid]) => !isValid
    )?.[0];

    if (
      invalidCategory &&
      availableCategories.some((c) => c.id === invalidCategory)
    ) {
      this.activeCategory.set(invalidCategory);
    }
  }

  // Get formatted component title for display
  getComponentTitle(): string {
    // Special case for hero1 in standard plan
    if (
      this.componentKey === 'pages.home.hero1' &&
      this.planType === 'standard'
    ) {
      return 'Standard Hero';
    }

    const parts = this.componentKey.split('.');
    const rawName = parts[parts.length - 1];
    return (
      rawName.charAt(0).toUpperCase() +
      rawName.slice(1).replace(/([A-Z])/g, ' $1')
    );
  }

  hasContentFields(): boolean {
    const config = this.getFieldsConfig();
    return config.some(
      (field: any) =>
        field.type === 'text' ||
        field.type === 'textarea' ||
        field.type === 'file' ||
        field.type === 'list'
    );
  }

  setActiveCategory(categoryId: string) {
    // Only set if valid
    if (this.categories().some((c) => c.id === categoryId)) {
      this.activeCategory.set(categoryId);
      this.lastActiveCategory[this.componentKey] = categoryId;

      // Persist to session storage
      this.saveTabMemoryToStorage();
    } else {
      this.validateActiveCategory();
    }
  }

  /**
   * Load tab memory from session storage
   */
  private loadTabMemoryFromStorage(): void {
    try {
      const stored = sessionStorage.getItem(this.TAB_MEMORY_KEY);
      if (stored) {
        this.lastActiveCategory = JSON.parse(stored);
      }
    } catch (error) {
      this.lastActiveCategory = {};
    }
  }

  /**
   * Save tab memory to session storage
   */
  private saveTabMemoryToStorage(): void {
    try {
      sessionStorage.setItem(
        this.TAB_MEMORY_KEY,
        JSON.stringify(this.lastActiveCategory)
      );
    } catch (error) {
      // Silently fail if storage is not available
    }
  }

  // DEPRECATED: Remove this method since we now use the computed signal
  getFieldsForCategory() {
    // Return the computed signal value for backward compatibility
    return this.fieldsForCategory();
  }

  // Check if we should show presets for this component
  hasPresets(): boolean {
    // Add component types that support presets
    return ['header', 'services', 'hero1', 'footer'].includes(
      this.componentKey
    );
  }

  getPresets() {
    if (this.componentKey === 'header') {
      return [
        { id: 'light', label: 'Light Theme' },
        { id: 'dark', label: 'Dark Theme' },
        { id: 'colorful', label: 'Colorful' },
        { id: 'gradient', label: 'Gradient' },
      ];
    }

    // Add presets for other components as needed
    return [];
  }

  applyPreset(presetId: string): void {
    if (this.componentKey === 'header') {
      if (presetId === 'light') {
        // A light theme with a soft light-gray background and dark text.
        this.localData.update((data) => ({
          ...data,
          backgroundColor: '#808080', // Soft light gray, not pure white
          textColor: '#ffffff',
          position: 'fixed',
        }));
      } else if (presetId === 'dark') {
        // A dark theme with a deep gray background and light text.
        this.localData.update((data) => ({
          ...data,
          backgroundColor: '#121212', // Deep gray
          textColor: '#ffffff', // Near white text for contrast
          position: 'fixed',
        }));
      } else if (presetId === 'colorful') {
        // A transparent header with white text.
        this.localData.update((data) => ({
          ...data,
          backgroundColor: '#ffb86d',
          textColor: '#ffffff',
          position: 'fixed',
        }));
      } else if (presetId === 'gradient') {
        // A gradient header with modern blue tones and white text.
        this.localData.update((data) => ({
          ...data,
          backgroundColor: 'linear-gradient(135deg, #3a8dff 0%, #0066ff 100%)',
          textColor: '#ffffff',
          position: 'fixed',
        }));
      }
    }
  }

  // Helper for displaying field labels
  shouldShowLabel(field: FieldConfig | any): boolean {
    return field.type !== 'boolean';
  }

  // Helper to determine if the entire field should be displayed
  shouldShowField(field: FieldConfig | any): boolean {
    // For header component, handle gradient field visibility dynamically
    if (this.componentKey === 'header' && this.planType === 'premium') {
      // Only show custom gradient fields if custom is selected
      if (
        field.key === 'customGradientColor1' ||
        field.key === 'customGradientColor2' ||
        field.key === 'customGradientAngle'
      ) {
        const val = this.localData()['headerBackgroundType'];
        return val === 'custom';
      }
    }

    // All other fields are shown by default
    return true;
  }

  // Helper to determine if the entire field label row should be displayed
  shouldShowFieldLabel(field: FieldConfig | any): boolean {
    // Hide backgroundImage label when video is selected
    if (
      field.key === 'backgroundImage' &&
      this.localData()['backgroundType'] === 'video'
    ) {
      return false;
    }

    // Hide backgroundVideo label when image is selected or no type is specified
    if (
      field.key === 'backgroundVideo' &&
      (this.localData()['backgroundType'] === 'image' ||
        !this.localData()['backgroundType'])
    ) {
      return false;
    }

    // Show all other field labels
    return true;
  }

  updateBooleanField(fieldKey: string, value: boolean): void {
    this.localData.update((data) => ({ ...data, [fieldKey]: value }));
  }

  /**
   * Get field value handling nested objects
   */
  getFieldValue(fieldKey: string): any {
    const data = this.localData();

    // Check if this is a nested field (contains a dot)
    if (fieldKey.includes('.')) {
      const [parentKey, childKey] = fieldKey.split('.');
      return data[parentKey]?.[childKey] || '';
    }

    // Regular field
    return data[fieldKey] || '';
  }

  /**
   * Update text field handling to support nested objects
   */
  updateTextField(fieldKey: string, value: string): void {
    // Check if this is a nested field (contains a dot)
    if (fieldKey.includes('.')) {
      const [parentKey, childKey] = fieldKey.split('.');

      this.localData.update((data) => {
        // Create the parent object if it doesn't exist
        if (!data[parentKey]) {
          data[parentKey] = {};
        }

        // Update the nested property
        return {
          ...data,
          [parentKey]: {
            ...data[parentKey],
            [childKey]: value,
          },
        };
      });
    } else {
      // Regular field update
      this.localData.update((data) => ({ ...data, [fieldKey]: value }));
    }
  }

  /**
   * Handle select field changes with special handling for background type
   * @param fieldKey The field key being updated
   * @param value The new value
   */
  updateSelectField(fieldKey: string, value: string | boolean): void {
    // Find field config to determine expected type
    const field = this.getFieldsConfig().find((f) => f.key === fieldKey);

    let typedValue: any = value;

    // Convert string "true"/"false" to actual boolean if necessary
    if (field?.options?.some((opt) => typeof opt.value === 'boolean')) {
      if (value === 'true') typedValue = true;
      if (value === 'false') typedValue = false;
    }

    // Handle numeric values
    if (
      field?.options?.some((opt) => typeof opt.value === 'number') &&
      !isNaN(Number(value))
    ) {
      typedValue = Number(value);
    }

    // Update the field value
    this.localData.update((data) => ({ ...data, [fieldKey]: typedValue }));

    // DEBUG: Special logging for backgroundAnimation field
    if (fieldKey === 'backgroundAnimation') {
      console.log('[ComponentCustomizer] backgroundAnimation updated:', {
        fieldKey,
        typedValue,
        newBackgroundAnimation: this.localData().backgroundAnimation,
        componentKey: this.componentKey,
      });
    }

    // SPECIAL HANDLING: When headerBackgroundType changes to 'custom', apply default values for gradient fields
    if (fieldKey === 'headerBackgroundType' && typedValue === 'custom') {
      const allFields = this.getFieldsConfig();

      // Apply defaults for gradient fields that are now visible and don't have values
      this.localData.update((data) => {
        const updatedData = { ...data };

        // Apply default for customGradientAngle if not set
        if (!updatedData['customGradientAngle']) {
          const gradientAngleField = allFields.find(
            (f) => f.key === 'customGradientAngle'
          );
          if (gradientAngleField?.defaultValue !== undefined) {
            updatedData['customGradientAngle'] =
              gradientAngleField.defaultValue;
          }
        }

        // Apply default for customGradientColor1 if not set
        if (!updatedData['customGradientColor1']) {
          const gradientColor1Field = allFields.find(
            (f) => f.key === 'customGradientColor1'
          );
          if (gradientColor1Field?.defaultValue !== undefined) {
            updatedData['customGradientColor1'] =
              gradientColor1Field.defaultValue;
          }
        }

        // Apply default for customGradientColor2 if not set
        if (!updatedData['customGradientColor2']) {
          const gradientColor2Field = allFields.find(
            (f) => f.key === 'customGradientColor2'
          );
          if (gradientColor2Field?.defaultValue !== undefined) {
            updatedData['customGradientColor2'] =
              gradientColor2Field.defaultValue;
          }
        }

        return updatedData;
      });
    }

    // Special handling for hero section background type - using ViewChild for scrolling
    if (fieldKey === 'backgroundType') {
      // Switching between image and video modes
      const currentData = this.localData();

      // If switching to video mode
      if (typedValue === 'video') {
        // If we don't have a video yet, notify user
        if (!currentData['backgroundVideo']) {
          this.toastService.info('Please upload a video for the background');
        }
      }
      // If switching to image mode
      else if (typedValue === 'image') {
        // If we don't have an image yet, notify user
        if (!currentData['backgroundImage']) {
          this.toastService.info('Please upload an image for the background');
        }
      }
    }
  }

  updateColorField(fieldKey: string, value: string) {
    this.localData.update((current) => {
      return { ...current, [fieldKey]: value };
    });
  }

  // Check if user can add/remove list items based on plan type and component
  canModifyList(fieldKey: string): boolean {
    // For header menuItems in standard plan, don't allow adding/removing
    if (
      this.componentKey === 'header' &&
      fieldKey === 'menuItems' &&
      this.planType === 'standard'
    ) {
      return false;
    }

    // For premium plan, allow adding up to 5 menu items
    if (
      this.componentKey === 'header' &&
      fieldKey === 'menuItems' &&
      this.planType === 'premium'
    ) {
      const currentItems = this.localData()[fieldKey] || [];
      // Allow adding only if less than 5 items exist
      return currentItems.length < 5;
    }

    // Default - allow modifications
    return true;
  }

  // Check if user can remove list items based on plan type and component
  canRemoveListItem(fieldKey: string): boolean {
    // For header menuItems in standard plan, don't allow removing
    if (
      this.componentKey === 'header' &&
      fieldKey === 'menuItems' &&
      this.planType === 'standard'
    ) {
      return false;
    }

    // For premium plan, make sure at least 3 menu items remain
    if (
      this.componentKey === 'header' &&
      fieldKey === 'menuItems' &&
      this.planType === 'premium'
    ) {
      const currentItems = this.localData()[fieldKey] || [];
      // Allow removing only if more than 3 items exist
      return currentItems.length > 3;
    }

    // Default - allow removals
    return true;
  }

  addListItem(fieldKey: string) {
    // Check if we can add items
    if (!this.canModifyList(fieldKey)) {
      return;
    }

    this.localData.update((current) => {
      const list = current[fieldKey] ? [...current[fieldKey]] : [];

      // Check if list items are objects or simple values
      if (list.length > 0 && typeof list[0] === 'object') {
        // Generate a unique ID for the new item
        const maxId = list.reduce(
          (max, item) => (item.id > max ? item.id : max),
          0
        );

        list.push({ id: maxId + 1, label: '', link: '/' });
      } else {
        list.push('');
      }

      return { ...current, [fieldKey]: list };
    });
  }

  removeListItem(fieldKey: string, index: number) {
    // Check if we can remove items
    if (!this.canRemoveListItem(fieldKey)) {
      return;
    }

    this.localData.update((current) => {
      const list = [...current[fieldKey]];
      list.splice(index, 1);
      return { ...current, [fieldKey]: list };
    });
  }

  /**
   * Update a list field's item label at a given index
   */
  public updateListField(fieldKey: string, index: number, value: string): void {
    this.localData.update((current) => {
      const list = Array.isArray(current[fieldKey])
        ? [...current[fieldKey]]
        : [];
      if (list.length > index) {
        // If the item is an object (e.g., {label, link}), update label
        if (typeof list[index] === 'object' && list[index] !== null) {
          list[index] = { ...list[index], label: value };
        } else {
          // Otherwise, just update the value
          list[index] = value;
        }
      }
      return { ...current, [fieldKey]: list };
    });
  }

  // Store pending file uploads
  private pendingUploads = new Map<string, File>();

  /**
   * Handle file selection (not upload yet)
   */
  handleFileUpload(event: Event, fieldKey: string): void {
    console.log(`Handling file selection for ${fieldKey}`);
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      console.log('No file selected');
      // Clear pending upload if any
      this.pendingUploads.delete(fieldKey);
      return;
    }

    const file = files[0];
    console.log(
      'File selected:',
      file.name,
      'Size:',
      file.size,
      'Type:',
      file.type
    );

    // Get max file size based on file type
    let maxSize = 1024 * 1024 * 2; // Default 2MB for images
    if (file.type.includes('video')) {
      maxSize = 1024 * 1024 * 10; // 10MB for videos
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      this.toastService.error(
        `File size exceeds ${maxSizeMB}MB limit. Please choose a smaller file.`
      );
      // Reset the input to clear the invalid selection
      input.value = '';
      this.pendingUploads.delete(fieldKey);
      return;
    }

    // Store the file for later upload on apply changes
    this.pendingUploads.set(fieldKey, file);

    // Create temporary preview URL for immediate display
    const tempUrl = URL.createObjectURL(file);

    // Update local data with temporary marker
    const updatedData = { ...this.localData() };
    updatedData[fieldKey] = `temp:${tempUrl}`;

    this.localData.set(updatedData);
    console.log(`Stored file for ${fieldKey}, will upload on apply changes`);

    this.toastService.success(
      'File selected. Click "Apply Changes" to upload.'
    );
  }

  /**
   * Store a placeholder for video files to avoid storage quota issues
   */
  private storeVideoPlaceholder(fieldKey: string, fileName: string): void {
    // Update stored data with placeholder
    this.videoPlaceholders = {
      ...this.videoPlaceholders,
      [fieldKey]: {
        fileName: fileName,
        timestamp: new Date().toISOString(),
      },
    };

    // Update session storage for persistence
    sessionStorage.setItem(
      'videoPlaceholders',
      JSON.stringify(this.videoPlaceholders)
    );
    console.log('Stored video placeholder:', this.videoPlaceholders);
  }

  /**
   * Check if a field is required
   */
  isFieldRequired(fieldKey: string): boolean {
    const field = this.getFieldsConfig().find((f) => f.key === fieldKey);
    if (!field) return false;

    // Check field.required property first
    if (field.required !== undefined) {
      return field.required;
    }

    // For backward compatibility, check validation if defined
    if (
      field &&
      typeof field === 'object' &&
      'validation' in field &&
      field.validation
    ) {
      const validation = field.validation as Record<string, unknown>;
      if ('required' in validation) {
        return !!validation['required'];
      }
    }

    return false;
  }

  // Handle backdrop click
  handleBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('sidebar-backdrop')) {
      this.cancel();
    }
  }

  /**
   * Updates a specific field in the local data
   */
  private updateLocalData(fieldKey: string, value: any): void {
    // Update the signal with the new data
    this.localData.update((data) => {
      const updatedData = {
        ...data,
        [fieldKey]: value,
      };
      return updatedData;
    });

    // Show success message
    this.toastService.success('Changes saved successfully');

    // Apply changes to parent component without closing sidebar
    this.applyChanges(false);
  }

  /**
   * Direct application of customizations with file uploads
   * This uploads pending files first, then applies changes
   */
  applyChanges(closeSidebar: boolean = false): void {
    // Check if we have pending uploads
    if (this.pendingUploads.size > 0) {
      this.uploadPendingFiles()
        .then(() => {
          this.finalizeApplyChanges(closeSidebar);
        })
        .catch((error) => {
          console.error('Error uploading files:', error);
          this.toastService.error('Failed to upload files. Please try again.');
        });
    } else {
      // No pending uploads, apply changes directly
      this.finalizeApplyChanges(closeSidebar);
    }
  }

  /**
   * Upload all pending files to backend
   */
  private async uploadPendingFiles(): Promise<void> {
    if (!this.userTemplateId) {
      throw new Error('Template ID is required for file upload.');
    }

    this.toastService.info('Uploading files...');

    const uploadPromises: Promise<void>[] = [];

    for (const [fieldKey, file] of this.pendingUploads.entries()) {
      const uploadPromise = this.imageService
        .uploadImage(file, this.userTemplateId, fieldKey)
        .toPromise()
        .then((objectId) => {
          console.log(`File uploaded for ${fieldKey}, objectId:`, objectId);

          // Validate objectId format
          if (
            !objectId ||
            typeof objectId !== 'string' ||
            objectId.includes('{')
          ) {
            console.error('Invalid objectId received:', objectId);
            throw new Error('Invalid response from server');
          }

          // Get current temp value before updating
          const currentValue = this.localData()[fieldKey];

          // Update local data with the objectId (replace temp URL)
          this.localData.update((data) => {
            const updated = { ...data };
            updated[fieldKey] = objectId;
            return updated;
          });

          // Clean up temp URL using the value we captured before update
          if (
            typeof currentValue === 'string' &&
            currentValue.startsWith('temp:')
          ) {
            const tempUrl = currentValue.replace('temp:', '');
            if (tempUrl.startsWith('blob:')) {
              URL.revokeObjectURL(tempUrl);
              console.log(`Cleaned up temp URL for ${fieldKey}`);
            }
          }

          // Trigger change detection to update the UI immediately
          this.cdr.detectChanges();
        })
        .catch((error) => {
          console.error(`Upload failed for ${fieldKey}:`, error);
          throw error;
        });

      uploadPromises.push(uploadPromise);
    }

    // Wait for all uploads to complete
    await Promise.all(uploadPromises);

    // Clear pending uploads
    this.pendingUploads.clear();

    this.toastService.success('Files uploaded successfully!');
  }

  /**
   * Finalize applying changes after uploads are complete
   */
  private finalizeApplyChanges(closeSidebar: boolean = false): void {
    const result = { ...this.localData() };

    console.log(
      '[ComponentCustomizer] finalizeApplyChanges - initial result:',
      {
        componentKey: this.componentKey,
        result,
        backgroundAnimation: result.backgroundAnimation,
        textAnimation: result.textAnimation,
        hasBackgroundAnimation: 'backgroundAnimation' in result,
        hasTextAnimation: 'textAnimation' in result,
      }
    );

    // Remove the ID field we added for internal tracking
    if (result.id === this.componentKey) {
      delete result.id;
    }

    // Clean any temp: prefixes that might still be there
    Object.keys(result).forEach((key) => {
      if (typeof result[key] === 'string' && result[key].startsWith('temp:')) {
        // This shouldn't happen if uploads worked, but clean it up just in case
        console.warn(`Found temp value for ${key} after upload, removing`);
        delete result[key];
      }
    });

    // Process nested object values (like socialUrls.facebook)
    const nestedProperties: Record<string, any> = {};

    // Find all properties with dots to handle nested objects
    Object.keys(result).forEach((key) => {
      if (key.includes('.')) {
        const [parent, child] = key.split('.');

        // Initialize parent object if needed
        if (!nestedProperties[parent]) {
          nestedProperties[parent] = {};
        }

        // Set child property
        nestedProperties[parent][child] = result[key];

        // Delete the dotted property
        delete result[key];
      }
    });

    // Merge nested properties back into result, preserving existing nested data
    Object.keys(nestedProperties).forEach((parent) => {
      // Preserve existing nested data and merge with new changes
      const existingParentData = result[parent] || {};
      result[parent] = {
        ...existingParentData,
        ...nestedProperties[parent],
      };
    });

    console.log(
      '[ComponentCustomizer] finalizeApplyChanges - final result to emit:',
      result
    );

    // DEBUG: Special logging for backgroundAnimation field
    if (
      (this.componentKey === 'pages.home.hero1' ||
        this.componentKey.includes('hero')) &&
      'backgroundAnimation' in result
    ) {
      console.log(
        '[ComponentCustomizer] HERO BACKGROUND ANIMATION DEBUG - finalizeApplyChanges result:',
        {
          componentKey: this.componentKey,
          backgroundAnimation: result.backgroundAnimation,
        }
      );
    }

    // Emit update event with the result
    this.update.emit(result);

    // Show success toast
    this.toastService.success('Changes applied successfully!');

    // Only trigger closing animation if closeSidebar is true
    // DO NOT reset position when applying changes - keep sidebar where user positioned it
    if (closeSidebar) {
      this.startClosingAnimation();
    }
  }

  cancel(): void {
    // Reset to original data
    if (this.originalData) {
      this.localData.set({
        id: this.componentKey,
        ...structuredClone(this.originalData),
      });
    }

    // Play closing sound effect
    this.customizerSoundService.play(false);

    // Simply set visible to false - Angular animations will handle the rest
    this.isVisible.set(false);

    // Emit close after animation completes
    setTimeout(() => {
      this.close.emit();
    }, 200); // Match the :leave animation duration
  }

  startClosingAnimation(): void {
    // Play closing sound effect
    this.customizerSoundService.play(false);

    // Simplified - just trigger the :leave animation
    this.isVisible.set(false);

    // Emit close after animation completes
    setTimeout(() => {
      this.close.emit();
    }, 200); // Match the :leave animation duration
  }

  /**
   * Trigger the actual closing animation - now simplified
   */
  private triggerClosingAnimation(
    container: Element | null,
    sidebar: Element | null
  ): void {
    // This method is now simplified - just delegate to startClosingAnimation
    this.startClosingAnimation();
  }

  // Check which categories have required but invalid fields
  getCategoryValidationStatus(): Record<string, boolean> {
    const data = this.localData();
    const result: Record<string, boolean> = {};

    // Get all available categories
    const categories = this.categories().map((cat) => cat.id);

    // Initialize all categories as valid
    categories.forEach((cat: string) => {
      result[cat] = true;
    });

    // Special case for hero section
    if (this.componentKey.includes('hero')) {
      const contentValid = this.isContentCategoryValid();
      result['content'] = contentValid;
      return result;
    }

    // For other components, check each required field
    const requiredFields = this.getFieldsConfig().filter(
      (field) => field.required === true
    );

    requiredFields.forEach((field) => {
      const isValid =
        field.type === 'text'
          ? data[field.key]?.trim?.() !== ''
          : data[field.key] !== undefined && data[field.key] !== null;

      if (!isValid && field.category) {
        result[field.category] = false;
      }
    });

    return result;
  }

  // Special validation for content category in hero section
  isContentCategoryValid(): boolean {
    const data = this.localData();

    if (data.backgroundType === 'video') {
      return !!data.backgroundVideo;
    }

    if (data.backgroundType === 'image' || !data.backgroundType) {
      return !!data.backgroundImage;
    }

    return true;
  }

  /**
   * Legacy handler for backwards compatibility
   * @deprecated Use handleFileUpload instead
   */
  handleFileChange(event: Event, fieldKey: string): void {
    // Forward to the new method
    this.handleFileUpload(event, fieldKey);
  }

  /**
   * Helper method for tracking by index in ngFor loops
   */
  trackByIndex(index: number): number {
    return index;
  }

  /**
   * Get a summary string for specialized lists (e.g., "2 Categories, 15 Items")
   */
  getSpecializedListSummary(fieldKey: string): string {
    const data = this.localData()[fieldKey];
    if (!Array.isArray(data)) {
      return '0 Items';
    }

    // Specific logic for menu categories
    if (fieldKey === 'categories') {
      const categoryCount = data.length;
      const itemCount = data.reduce(
        (sum, category) => sum + (category.items?.length || 0),
        0
      );
      const catLabel = categoryCount === 1 ? 'Category' : 'Categories';
      const itemLabel = itemCount === 1 ? 'Item' : 'Items';
      return `${categoryCount} ${catLabel}, ${itemCount} ${itemLabel}`;
    }

    // Generic summary for other lists (like services, projects)
    const count = data.length;
    const itemLabel = count === 1 ? 'Item' : 'Items';
    return `${count} ${itemLabel}`;
  }

  /**
   * Get the label for the specialized editor button based on the field key.
   */
  getSpecializedEditorLabel(fieldKey: string): string {
    switch (fieldKey) {
      case 'categories':
        return 'Edit Menu Items';
      case 'services':
        return 'Edit Services';
      case 'projects':
        return 'Edit Projects';
      default:
        return 'Edit Items';
    }
  }

  /**
   * Opens the modal for the specialized editor (Menu, Services, Projects).
   */
  openSpecializedEditor(fieldKey: string): void {
    try {
      // Get the current data for this field
      const currentData = this.localData()[fieldKey] || [];

      // Handle different specialized editors based on field key and component key
      switch (fieldKey) {
        case 'categories': // Menu items editor
          import('../menu-editor/menu-editor.component').then((m) => {
            // Extract menu categories using robust method
            const menuCategories = this.extractMenuCategories();

            console.log(
              '[ComponentCustomizer] Opening menu editor with categories:',
              {
                menuCategories,
                categoriesCount: menuCategories.length,
                isArray: Array.isArray(menuCategories),
                firstCategory: menuCategories[0],
                extractedFrom: 'extractMenuCategories()',
              }
            );

            // Configure the modal with properly structured data
            const modalConfig = {
              width: '85vw',
              height: '85vh',
              data: {
                initialCategories: menuCategories,
                planType: this.planType || 'standard',
                userTemplateId: this.userTemplateId, // Pass userTemplateId for image uploads
                onSave: (updatedCategories: any[]) => {
                  console.log(
                    '[ComponentCustomizer] Menu editor onSave called with:',
                    {
                      updatedCategories,
                      categoriesCount: updatedCategories.length,
                      firstCategory: updatedCategories[0],
                      isValidData:
                        updatedCategories.length > 0 &&
                        updatedCategories[0] &&
                        typeof updatedCategories[0] === 'object' &&
                        'name' in updatedCategories[0] &&
                        'items' in updatedCategories[0],
                    }
                  );

                  // Validate the categories data before saving
                  if (
                    !updatedCategories ||
                    !Array.isArray(updatedCategories) ||
                    updatedCategories.length === 0
                  ) {
                    console.warn(
                      '[ComponentCustomizer] Invalid or empty categories data received from menu editor'
                    );
                    this.toastService.error(
                      'Invalid menu data received. Please try again.'
                    );
                    return;
                  }

                  // Validate each category structure
                  const isValidCategories = updatedCategories.every(
                    (cat) =>
                      cat &&
                      typeof cat === 'object' &&
                      'name' in cat &&
                      'items' in cat &&
                      Array.isArray(cat.items)
                  );

                  if (!isValidCategories) {
                    console.warn(
                      '[ComponentCustomizer] Invalid category structure received from menu editor'
                    );
                    this.toastService.error(
                      'Invalid menu category structure. Please try again.'
                    );
                    return;
                  }

                  // IMPORTANT: Save the categories array as the 'categories' field
                  // This ensures the menu section component can access it via data().categories
                  this.updateLocalData(fieldKey, updatedCategories);

                  // Debug log the local data after update
                  console.log(
                    '[ComponentCustomizer] Local data after menu update:',
                    {
                      fieldKey,
                      localData: this.localData(),
                      menuCategories: this.localData().categories,
                      isValidSavedData:
                        this.localData().categories &&
                        Array.isArray(this.localData().categories) &&
                        this.localData().categories.length > 0,
                      localDataStructure: JSON.stringify(
                        this.localData(),
                        null,
                        2
                      ),
                    }
                  );

                  // CRITICAL: Automatically apply changes to parent component
                  // This ensures the menu data is properly saved to the template
                  this.applyChanges(false);

                  // Close the modal
                  this.modalService.close();

                  // Show success message to user
                  this.toastService.success('Menu updated successfully!');
                },
              },
            };

            // Debug log the data being passed to menu editor
            console.log(
              '[ComponentCustomizer] Opening menu editor with data:',
              {
                fieldKey,
                currentData,
                menuCategories,
                isArray: Array.isArray(menuCategories),
                dataLength: menuCategories.length,
                localData: this.localData(),
                originalData: this.originalData,
              }
            );

            // Open the modal with the MenuEditorComponent
            this.modalService.open(m.MenuEditorComponent, modalConfig);
          });
          break;

        case 'items': // Services editor
          if (this.componentKey.includes('services')) {
            import('../services-editor/services-editor.component').then((m) => {
              // Configure the modal with properly structured data
              const modalConfig = {
                width: '85vw',
                height: '85vh',
                data: {
                  initialServices: Array.isArray(currentData)
                    ? currentData
                    : [],
                  planType: this.planType || 'standard',
                  businessType: this.businessType || 'salon',
                  onSave: (updatedServices: any[]) => {
                    // Update the local data
                    this.updateLocalData(fieldKey, updatedServices);
                    // Immediately apply changes to parent without closing sidebar
                    this.applyChanges(false);
                  },
                },
              };

              // Open the modal with the ServicesEditorComponent
              this.modalService.open(m.ServicesEditorComponent, modalConfig);
            });
          } else {
            console.error(
              `Unknown specialized editor for field: ${fieldKey} in component: ${this.componentKey}`
            );
          }
          break;

        // Other specialized editors can be added here
        default:
          console.error(`Unknown specialized editor for field: ${fieldKey}`);
      }
    } catch (error) {
      console.error(`Error opening specialized editor for ${fieldKey}:`, error);
      this.toastService.error('Failed to open editor. Please try again.');
    }
  }

  /**
   * Show notification when standard user tries to access video backgrounds
   */
  showVideoPremiumNotice(): void {
    this.toastService.error(
      'Video backgrounds are available in Premium plan. Upgrade to unlock this feature!'
    );
  }

  /**
   * Convert field options to custom select format
   */
  getSelectOptions(field: FieldConfig): any[] {
    if (!field.options) return [];

    return field.options.map((option) => ({
      value: option.value,
      label: option.label,
      icon:
        (option as any).icon ||
        (option.label.includes('🌅') ? option.label.split(' ')[0] : undefined),
    }));
  }

  // Draggable state - now always true
  isDraggable = signal<boolean>(true);
  dragPosition = signal<DragPosition>({ x: 0, y: 0 });
  savedPosition = signal<DragPosition | null>(null);
  defaultPosition = signal<DragPosition>({ x: 0, y: 0 }); // Default position

  // Unique position key for each component
  positionKey = computed(() => `customizer-position-${this.componentKey}`);

  // Resizable state - now always true
  isResizable = signal<boolean>(true);
  sidebarSize = signal<{ width: number; height: number }>({
    width: 340,
    height: window.innerHeight - 100, // Better default height
  });
  sizeKey = computed(() => `customizer-size-${this.componentKey}`);

  // Window reference for template
  get window() {
    return window;
  }

  // Check if sidebar has moved from default position
  hasMovedFromDefault(): boolean {
    const pos = this.dragPosition();
    const defaultPos = this.defaultPosition();
    // Consider moved if more than 5px from default
    return (
      Math.abs(pos.x - defaultPos.x) > 5 || Math.abs(pos.y - defaultPos.y) > 5
    );
  }

  // Reset to default position
  resetToDefault(): void {
    // Reset position using the ViewChild reference
    if (this.draggableDirective) {
      this.draggableDirective.setPosition(0, 0);
      this.dragPosition.set({ x: 0, y: 0 });
    } else {
      // Fallback: just update the signal
      this.dragPosition.set({ x: 0, y: 0 });
    }

    // Reset size using the ViewChild reference
    if (this.resizableDirective) {
      const defaultWidth = 340;
      const defaultHeight = window.innerHeight - 100;
      this.resizableDirective.resetSize(defaultWidth, defaultHeight);
      this.sidebarSize.set({ width: defaultWidth, height: defaultHeight });
    } else {
      // Fallback: just update the signal
      this.sidebarSize.set({
        width: 340,
        height: window.innerHeight - 100,
      });
    }

    // Clear saved position and size
    const posKey = this.positionKey();
    const szKey = this.sizeKey();
    if (posKey) {
      localStorage.removeItem(posKey);
    }
    if (szKey) {
      localStorage.removeItem(szKey);
    }
  }

  // Handle drag events
  onDragStart(event: any): void {
    this.isDragging.set(true);
  }

  onDragMove(event: any): void {
    // Update drag position during move for accurate reset detection
    if (event && typeof event.x === 'number' && typeof event.y === 'number') {
      this.dragPosition.set({ x: event.x, y: event.y });
    }
  }

  onDragEnd(event: any): void {
    this.isDragging.set(false);
    // Update final drag position
    if (event && typeof event.x === 'number' && typeof event.y === 'number') {
      this.dragPosition.set({ x: event.x, y: event.y });
    }
  }

  // Handle resize events
  onResizeStart(event: any): void {
    this.isResizing.set(true);
  }

  onResizing(event: any): void {
    if (!event?.size) return;

    const newHeight = event.size.height;
    const headerHeight = 60;
    const tabsHeight = 48;
    const footerHeight = 60;
    const padding = 40;
    const contentHeight =
      newHeight - headerHeight - tabsHeight - footerHeight - padding;

    // You can emit this height if needed for content adjustment
  }

  onResizeEnd(event: any): void {
    this.isResizing.set(false);
  }

  // Load saved position on init
  private loadSavedPosition(): void {
    // Remove this method or leave it empty since we always want default position
    // Position and size are now handled by clearSavedPositionAndSize()
  }

  // Clear saved position and size to ensure default position on open
  private clearSavedPositionAndSize(): void {
    const posKey = this.positionKey();
    const szKey = this.sizeKey();

    // Clear saved position
    if (posKey) {
      localStorage.removeItem(posKey);
    }

    // Clear saved size
    if (szKey) {
      localStorage.removeItem(szKey);
    }

    // Set to default values
    this.dragPosition.set({ x: 0, y: 0 });
    this.sidebarSize.set({
      width: 340,
      height: window.innerHeight - 100,
    });

    // Also reset the directive position if available
    if (this.draggableDirective) {
      this.draggableDirective.setPosition(0, 0);
    }
  }

  /**
   * Extract menu categories from local data, handling multiple possible data structures
   */
  private extractMenuCategories(): any[] {
    const localData = this.localData();

    console.log('[ComponentCustomizer] extractMenuCategories called:', {
      localData,
      localDataKeys: Object.keys(localData || {}),
      hasCategories: !!localData?.categories,
      categoriesCount: localData?.categories?.length || 0,
      menuCategories: localData?.menu?.categories,
      menuCategoriesCount: localData?.menu?.categories?.length || 0,
      localDataStructure: JSON.stringify(localData, null, 2),
    });

    // Primary: Check if categories are directly available in local data
    if (
      localData?.categories &&
      Array.isArray(localData.categories) &&
      localData.categories.length > 0
    ) {
      console.log(
        '[ComponentCustomizer] Found categories in localData.categories'
      );
      return localData.categories;
    }

    // Secondary: Check if categories are nested under menu property
    if (
      localData?.menu?.categories &&
      Array.isArray(localData?.menu?.categories) &&
      localData.menu.categories.length > 0
    ) {
      console.log(
        '[ComponentCustomizer] Found categories in localData.menu.categories'
      );
      return localData.menu.categories;
    }

    // Tertiary: Check if the entire localData is a categories array
    if (
      Array.isArray(localData) &&
      localData.length > 0 &&
      localData[0] &&
      typeof localData[0] === 'object' &&
      'name' in localData[0] &&
      'items' in localData[0]
    ) {
      console.log(
        '[ComponentCustomizer] localData is itself a categories array'
      );
      return localData;
    }

    // Quaternary: Check if localData has any property that contains categories
    if (localData && typeof localData === 'object') {
      for (const [key, value] of Object.entries(localData)) {
        if (Array.isArray(value) && value.length > 0) {
          const firstItem = value[0];
          if (
            firstItem &&
            typeof firstItem === 'object' &&
            'name' in firstItem &&
            'items' in firstItem
          ) {
            console.log(
              `[ComponentCustomizer] Found categories in localData.${key}`
            );
            return value;
          }
        }
      }
    }

    // Special case: If we have an empty categories array, return it (don't override with defaults)
    if (localData?.categories && Array.isArray(localData.categories)) {
      console.log(
        '[ComponentCustomizer] Found empty categories array, returning it'
      );
      return localData.categories;
    }

    // Final fallback: Return empty array (don't return defaults here, let the editor handle it)
    console.log(
      '[ComponentCustomizer] No categories found, returning empty array'
    );
    return [];
  }
}
