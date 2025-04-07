import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  moveItemInArray,
  DragDropModule,
} from '@angular/cdk/drag-drop';

// Define interfaces for services data structure
export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  price?: string;
  duration?: string;
  icon?: string;
  image?: string;
  featured?: boolean;
  bookingUrl?: string; // Premium-only field
  tags?: string[]; // Premium-only field
}

@Component({
  selector: 'app-services-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './services-editor.component.html',
  styleUrls: ['./services-editor.component.scss'],
})
export class ServicesEditorComponent implements OnInit {
  // Inputs from modal service
  @Input() initialServices: ServiceItem[] = [];
  @Input() planType: 'standard' | 'premium' = 'standard';
  @Input() businessType: string = 'salon'; // salon, architecture, portfolio
  @Input() onSave?: (services: ServiceItem[]) => void;

  // For compatibility with both approaches - injected modal and direct use
  @Output() save = new EventEmitter<ServiceItem[]>();
  @Output() cancel = new EventEmitter<void>();

  // State management with signals
  services = signal<ServiceItem[]>([]);
  selectedServiceIndex = signal<number | null>(null);

  // Plan-based limits (standard: 4, premium: 10)
  maxServices = computed(() => (this.isPremium() ? 10 : 4));

  // Check if user has premium plan
  isPremium(): boolean {
    return this.planType === 'premium';
  }

  ngOnInit(): void {
    console.log(
      'ServicesEditorComponent initialized with plan:',
      this.planType
    );
    console.log('Initial services:', this.initialServices);
    console.log('Business type:', this.businessType);
    console.log('onSave callback present:', !!this.onSave);

    // Make a deep clone to prevent modifying the original data directly
    try {
      // Create deep copy of services
      const servicesCopy = structuredClone(this.initialServices) || [];

      // Ensure all services have IDs
      servicesCopy.forEach((service) => {
        if (!service.id)
          service.id = `svc${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
      });

      // Set the services signal
      this.services.set(servicesCopy);

      // Auto-select the first service if available
      if (servicesCopy.length > 0) {
        this.selectedServiceIndex.set(0);
      }

      console.log('Services initialized:', this.services());
    } catch (error) {
      console.error('Error initializing services:', error);
      // Fallback to a simpler approach
      this.services.set(JSON.parse(JSON.stringify(this.initialServices || [])));
    }
  }

  // --- Service Management ---

  canAddService(): boolean {
    return this.services().length < this.maxServices();
  }

  addService(): void {
    if (!this.canAddService()) return;

    // Generate a unique ID for the new service
    const newId = `svc${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create appropriate default service based on business type
    const newService: ServiceItem = {
      id: newId,
      title: 'New Service',
      description: 'Description of this service',
      price: this.businessType === 'salon' ? '$0.00' : '',
      duration: this.businessType === 'salon' ? '30 min' : '',
      icon: 'assets/standard-services/service-icon1.svg',
    };

    // Add to services list
    this.services.update((svcs) => [...svcs, newService]);
    // Auto-select the new service
    this.selectedServiceIndex.set(this.services().length - 1);

    console.log('Service added:', newService);
  }

  selectService(index: number): void {
    this.selectedServiceIndex.set(index);
  }

  selectedService = computed(() => {
    const index = this.selectedServiceIndex();
    return index !== null ? this.services()[index] : null;
  });

  removeService(index: number): void {
    // Remove the service
    this.services.update((svcs) => {
      const newSvcs = [...svcs];
      newSvcs.splice(index, 1);
      return newSvcs;
    });

    // Adjust selectedServiceIndex if needed
    if (
      this.selectedServiceIndex() === index ||
      this.selectedServiceIndex() === null
    ) {
      // If we're removing the selected service, select the first one
      this.selectedServiceIndex.set(this.services().length > 0 ? 0 : null);
    } else if (this.selectedServiceIndex()! > index) {
      // If we're removing a service before the selected one, adjust the index
      this.selectedServiceIndex.update((i) => (i !== null ? i - 1 : null));
    }

    console.log('Service removed, updated services:', this.services());
  }

  // For premium users: drag and drop services to reorder
  dropService(event: CdkDragDrop<ServiceItem[]>): void {
    if (!this.isPremium()) return; // Block if not premium

    // Track which service was selected before the move
    const selectedService = this.selectedService();

    // Reorder the list
    moveItemInArray(
      this.services() as ServiceItem[],
      event.previousIndex,
      event.currentIndex
    );

    // Force services signal update
    this.services.update((svcs) => [...svcs]);

    // Update the selected service index if needed
    if (selectedService) {
      const newIndex = this.services().findIndex(
        (s) => s.id === selectedService.id
      );
      this.selectedServiceIndex.set(newIndex);
    }

    console.log('Services reordered');
  }

  // Toggle featured status (premium only)
  toggleFeatured(service: ServiceItem): void {
    if (!this.isPremium()) return;

    service.featured = !service.featured;

    // Force update
    this.services.update((svcs) => [...svcs]);
  }

  // Get appropriate icon options based on business type
  getIconOptions(): string[] {
    if (this.businessType === 'salon') {
      return [
        'assets/standard-services/salon-icon1.svg',
        'assets/standard-services/salon-icon2.svg',
        'assets/standard-services/salon-icon3.svg',
        'assets/standard-services/salon-icon4.svg',
      ];
    } else if (this.businessType === 'architecture') {
      return [
        'assets/standard-services/arch-icon1.svg',
        'assets/standard-services/arch-icon2.svg',
        'assets/standard-services/arch-icon3.svg',
        'assets/standard-services/arch-icon4.svg',
      ];
    } else {
      return [
        'assets/standard-services/service-icon1.svg',
        'assets/standard-services/service-icon2.svg',
        'assets/standard-services/service-icon3.svg',
        'assets/standard-services/service-icon4.svg',
      ];
    }
  }

  // --- Save / Cancel ---

  onSaveClick(): void {
    // Perform validation before saving
    const invalidService = this.services().find((svc) => !svc.title.trim());
    if (invalidService) {
      alert(
        `Service "${
          invalidService.title || '(empty)'
        }" cannot have an empty name.`
      );

      // Select the invalid service
      const invalidIndex = this.services().findIndex(
        (svc) => svc === invalidService
      );
      this.selectService(invalidIndex);
      return;
    }

    const finalServices = this.services();
    console.log('Saving services data:', finalServices);

    // Support both callback and event approaches
    if (this.onSave) {
      console.log('Using onSave callback');
      this.onSave(finalServices);
    }

    this.save.emit(finalServices);
  }

  onCancelClick(): void {
    console.log('Cancelling services edit');
    this.cancel.emit();
  }
}
