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
export class CustomSelectComponent implements ControlValueAccessor {
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
  toggleDropdown(): void {
    if (!this.disabled) {
      this.isOpen.update((v) => !v);

      // Add smart positioning after dropdown opens
      if (this.isOpen()) {
        setTimeout(() => this.positionDropdown(), 10);
      }
    }
  }

  // Smart dropdown positioning with simple above/below logic
  private positionDropdown(): void {
    const selectElement = this.elementRef.nativeElement;
    const dropdown = selectElement.querySelector('.select-dropdown');

    if (!dropdown) return;

    const rect = selectElement.getBoundingClientRect();
    const dropdownHeight = dropdown.offsetHeight || 200; // Fallback height
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom - 20; // Add some padding
    const spaceAbove = rect.top - 20; // Add some padding

    // Determine if dropdown should appear above or below
    if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
      dropdown.classList.add('dropdown-above');
    } else {
      dropdown.classList.remove('dropdown-above');
    }
  }

  selectOption(option: SelectOption): void {
    if (!option.disabled) {
      this.selectedValue.set(option.value);
      this.onChange(option.value);
      this.selectionChange.emit(option.value);
      this.isOpen.set(false);
      this.onTouched();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  @HostListener('window:scroll', ['$event'])
  @HostListener('window:resize', ['$event'])
  onWindowChange(): void {
    if (this.isOpen()) {
      // Reposition dropdown on scroll or resize
      setTimeout(() => this.positionDropdown(), 10);
    }
  }

  // Get accent color based on plan
  getAccentColor(): string {
    return this.planType === 'premium' ? '#9e6aff' : '#2876ff';
  }
}
