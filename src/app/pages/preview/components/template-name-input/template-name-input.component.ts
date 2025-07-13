import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-template-name-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './template-name-input.component.html',
  styleUrls: ['./template-name-input.component.scss'],
})
export class TemplateNameInputComponent implements OnInit {
  @Input() businessType: string = '';
  @Input() businessTypeName: string = '';
  @Input() plan: 'standard' | 'premium' = 'standard';
  @Input() accentColor: string = '#4a8dff';
  @Output() templateNameConfirmed = new EventEmitter<string>();
  @Output() canceled = new EventEmitter<void>();

  templateName = signal<string>('');
  isValid = signal<boolean>(false);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    // Generate a smart default name based on business type
    const defaultName = this.generateDefaultName();
    this.templateName.set(defaultName);
    this.validateName();
  }

  private generateDefaultName(): string {
    const businessTypeName = this.businessTypeName || 'Business';
    const planSuffix = this.plan === 'premium' ? ' Pro' : '';

    // Generate business-specific default names
    switch (this.businessType) {
      case 'restaurant':
        return `My Restaurant Website${planSuffix}`;
      case 'salon':
        return `My Salon Website${planSuffix}`;
      case 'portfolio':
        return `My Portfolio Website${planSuffix}`;
      default:
        return `My ${businessTypeName} Website${planSuffix}`;
    }
  }

  onNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.templateName.set(input.value);
    this.validateName();
  }

  private validateName(): void {
    const name = this.templateName().trim();

    if (!name) {
      this.isValid.set(false);
      this.errorMessage.set('Please enter a name for your template');
      return;
    }

    if (name.length < 2) {
      this.isValid.set(false);
      this.errorMessage.set('Name must be at least 2 characters');
      return;
    }

    if (name.length > 50) {
      this.isValid.set(false);
      this.errorMessage.set('Name must be less than 50 characters');
      return;
    }

    // Check for invalid characters
    const invalidChars = /[<>:"\/\\|?*\x00-\x1F]/;
    if (invalidChars.test(name)) {
      this.isValid.set(false);
      this.errorMessage.set('Name contains invalid characters');
      return;
    }

    this.isValid.set(true);
    this.errorMessage.set('');
  }

  onConfirm(): void {
    if (this.isValid()) {
      this.templateNameConfirmed.emit(this.templateName().trim());
    }
  }

  onCancel(): void {
    this.canceled.emit();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.isValid()) {
      this.onConfirm();
    } else if (event.key === 'Escape') {
      this.onCancel();
    }
  }
}
