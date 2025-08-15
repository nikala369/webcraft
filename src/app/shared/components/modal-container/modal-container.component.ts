import {
  Component,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  Type,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  HostListener,
  OnInit,
  ChangeDetectorRef,
  inject,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalConfig } from '../../../core/services/modal/modal.service'; // Adjust path as needed

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="onBackdropClick()"></div>
    <div
      class="modal-content"
      [style.width]="config.width || 'auto'"
      [style.height]="config.height || 'auto'"
      [style.maxWidth]="'90vw'"
      [style.maxHeight]="'90vh'"
    >
      <!-- Child component is loaded here -->
      <ng-container #modalContentHost></ng-container>
    </div>
  `,
  styleUrls: ['./modal-container.component.scss'],
})
export class ModalContainerComponent implements OnInit, AfterViewInit {
  @ViewChild('modalContentHost', { read: ViewContainerRef, static: true })
  modalContentHost!: ViewContainerRef;

  @Input() childComponentType!: Type<any>;
  @Input() config: ModalConfig = {};
  @Output() closeEvent = new EventEmitter<any>();

  @HostBinding('class.visible')
  isVisible = false;

  private childComponentRef: ComponentRef<any> | null = null;
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    console.log(
      'Modal container initialized with component type:',
      this.childComponentType
    );
    console.log('Modal config:', this.config);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.loadChildComponent();
    }, 0);
  }

  loadChildComponent(): void {
    if (!this.childComponentType) {
      console.error('No component type provided to modal container');
      return;
    }

    try {
      this.modalContentHost.clear();

      console.log(
        'Creating component in modal container:',
        this.childComponentType.name
      );
      this.childComponentRef = this.modalContentHost.createComponent(
        this.childComponentType
      );

      // Pass data to the child component if provided in config
      if (this.config?.data && this.childComponentRef.instance) {
        console.log('Setting data on child component:', this.config.data);
        Object.keys(this.config.data).forEach((key) => {
          this.childComponentRef!.instance[key] = this.config.data[key];
        });
      }

      // Subscribe to child component's output events
      // Handle both generic and specific event names

      // Handle save events (generic 'save' or specific like 'menuSave')
      if (this.childComponentRef.instance.save) {
        console.log('Subscribing to save event on child component');
        this.childComponentRef.instance.save.subscribe((result: any) => {
          console.log('Save event received with result:', result);
          this.close(result);
        });
      } else if (this.childComponentRef.instance.menuSave) {
        console.log('Subscribing to menuSave event on child component');
        this.childComponentRef.instance.menuSave.subscribe((result: any) => {
          console.log('MenuSave event received with result:', result);
          this.close(result);
        });
      } else {
        console.warn('Child component does not have a save or menuSave output');
      }

      // Handle cancel events (generic 'cancel' or specific like 'menuCancel')
      if (this.childComponentRef.instance.cancel) {
        console.log('Subscribing to cancel event on child component');
        this.childComponentRef.instance.cancel.subscribe(() => {
          console.log('Cancel event received from child component');
          this.close();
        });
      } else if (this.childComponentRef.instance.menuCancel) {
        console.log('Subscribing to menuCancel event on child component');
        this.childComponentRef.instance.menuCancel.subscribe(() => {
          console.log('MenuCancel event received from child component');
          this.close();
        });
      } else {
        console.warn(
          'Child component does not have a cancel or menuCancel output'
        );
      }

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error creating component in modal:', error);
    }
  }

  onBackdropClick(): void {
    // Add logic here if you want to allow closing by clicking the backdrop
    // Check config if `disableClose` is set, etc.
    console.log('Backdrop clicked');

    // If disableClose is true in config, don't close on backdrop click
    if (this.config?.disableClose) {
      return;
    }

    this.close(); // Default: close on backdrop click
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    // If disableClose is true in config, don't close on escape key
    if (this.config?.disableClose) {
      return;
    }

    this.close(); // Close on escape key
  }

  close(result?: any): void {
    console.log('Modal container closing with result:', result);
    this.closeEvent.emit(result);
  }

  // --- Animation Control Methods ---
  enter(): void {
    // Called by ModalService after attaching to DOM
    console.log('Modal container enter animation');
    this.isVisible = true;
    this.cdr.detectChanges();
  }

  leave(): Promise<void> {
    // Called by ModalService before detaching
    console.log('Modal container leave animation');
    this.isVisible = false;
    this.cdr.detectChanges();
    // Return a promise that resolves after animation completes
    return new Promise((resolve) => setTimeout(resolve, 300));
  }
}
