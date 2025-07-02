import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
  forwardRef,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

export interface SelectOption {
  value: any;
  label: string;
  icon?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true,
    },
  ],
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-8px)' }),
        animate(
          '200ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '150ms ease-in',
          style({ opacity: 0, transform: 'translateY(-8px)' })
        ),
      ]),
    ]),
  ],
})
export class CustomSelectComponent implements ControlValueAccessor, OnInit {
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() disabled: boolean = false;
  @Input() label?: string;
  @Input() description?: string;
  @Input() planType?: 'standard' | 'premium' = 'standard';

  @Output() selectionChange = new EventEmitter<any>();

  // Signals for reactive state
  isOpen = signal(false);
  selectedValue = signal<any>(null);

  // Dropdown positioning signals
  dropdownPosition = signal<{
    top: number;
    left: number;
    width: number;
    maxHeight?: number;
  } | null>(null);

  // Computed values
  selectedOption = computed(() => {
    const value = this.selectedValue();
    return this.options.find((opt) => opt.value === value);
  });

  displayText = computed(() => {
    const option = this.selectedOption();
    return option ? option.label : this.placeholder;
  });

  // ControlValueAccessor
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    console.log('[CustomSelect] Component initialized:', {
      label: this.label,
      options: this.options,
      placeholder: this.placeholder,
      disabled: this.disabled,
    });
  }

  writeValue(value: any): void {
    this.selectedValue.set(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Component methods
  toggleDropdown(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }

    if (!this.disabled) {
      const newState = !this.isOpen();
      console.log('[CustomSelect] Toggle dropdown:', {
        component: this.label,
        newState,
        options: this.options,
        optionsLength: this.options?.length,
      });

      if (newState) {
        // Calculate position when opening
        this.calculateDropdownPosition();
      }

      this.isOpen.set(newState);
    }
  }

  private calculateDropdownPosition(): void {
    const triggerElement: HTMLElement | null =
      this.elementRef.nativeElement.querySelector('.select-trigger');
    if (!triggerElement) return;

    // Bounding rect for the trigger (viewport coordinates)
    const triggerRect = triggerElement.getBoundingClientRect();

    // Find the nearest transformed ancestor (the sidebar container) – it will be the containing block for position:fixed
    let transformedParent: HTMLElement = this.elementRef
      .nativeElement as HTMLElement;
    while (transformedParent && transformedParent !== document.body) {
      const style = window.getComputedStyle(transformedParent);
      if (style.transform && style.transform !== 'none') {
        break;
      }
      if (transformedParent.parentElement) {
        transformedParent = transformedParent.parentElement as HTMLElement;
      } else {
        break;
      }
    }

    // Fallback to the host element if none found or hit document.body
    if (transformedParent === document.body) {
      transformedParent = this.elementRef.nativeElement as HTMLElement;
    }

    const parentRect = transformedParent.getBoundingClientRect();

    // Coordinates relative to transformed parent
    const relativeLeft = triggerRect.left - parentRect.left;
    const relativeTopBelow = triggerRect.bottom - parentRect.top + 8; // 8px gap
    const relativeTopAbove = triggerRect.top - parentRect.top - 8; // Gap above if flipped

    // Viewport height for available space calculation
    const viewportHeight = window.innerHeight;
    const dropdownMaxHeight = Math.min(240 + 32, viewportHeight * 0.6);

    // Determine whether to open below or above
    const spaceBelow = viewportHeight - triggerRect.bottom - 8;
    const spaceAbove = triggerRect.top - 8;
    let top = 0;
    let maxHeight = dropdownMaxHeight;
    if (spaceBelow >= dropdownMaxHeight || spaceBelow >= spaceAbove) {
      // Open below
      top = relativeTopBelow;
      maxHeight = Math.min(dropdownMaxHeight, spaceBelow);
    } else {
      // Open above
      top = relativeTopAbove - Math.min(dropdownMaxHeight, spaceAbove);
      maxHeight = Math.min(dropdownMaxHeight, spaceAbove);
    }

    // Ensure the dropdown stays within the parent horizontally
    let left = relativeLeft;
    const dropdownWidth = triggerRect.width;
    const parentWidth = parentRect.width;
    if (left + dropdownWidth > parentWidth) {
      left = parentWidth - dropdownWidth - 8;
    }
    if (left < 0) left = 0;

    this.dropdownPosition.set({
      top: top < 0 ? 0 : top,
      left,
      width: dropdownWidth,
      maxHeight: maxHeight < 100 ? 100 : maxHeight,
    });
  }

  selectOption(option: SelectOption, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!option.disabled) {
      console.log('[CustomSelect] Option selected:', option);
      this.selectedValue.set(option.value);
      this.onChange(option.value);
      this.selectionChange.emit(option.value);
      this.isOpen.set(false);
      this.onTouched();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Don't close if clicking inside the component or its dropdown
    const clickedInside =
      this.elementRef.nativeElement.contains(target) ||
      target.closest('.select-dropdown') !== null;

    if (!clickedInside && this.isOpen()) {
      this.isOpen.set(false);
    }
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  onWindowChange(): void {
    if (this.isOpen()) {
      // Recalculate position on scroll/resize
      this.calculateDropdownPosition();
    }
  }

  // Get accent color based on plan
  getAccentColor(): string {
    return this.planType === 'premium' ? '#9e6aff' : '#2876ff';
  }
}
