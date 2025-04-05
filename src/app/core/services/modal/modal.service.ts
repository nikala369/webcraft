import {
  Injectable,
  ApplicationRef,
  Injector,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Type,
  ComponentFactoryResolver,
  RendererFactory2,
  Renderer2,
} from '@angular/core';
import { Subject, BehaviorSubject, Observable } from 'rxjs';
import { ModalContainerComponent } from '../../../shared/components/modal-container/modal-container.component';

export interface ModalConfig<TData = any> {
  data?: TData; // Data to pass to the modal component
  width?: string; // e.g., '500px', '80%'
  height?: string;
  disableClose?: boolean; // Whether to prevent closing on backdrop click and escape
  // Add other config options as needed
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalComponentRef: ComponentRef<ModalContainerComponent> | null =
    null;
  private readonly afterClosedSubject = new Subject<any>();
  public afterClosed$ = this.afterClosedSubject.asObservable();

  // Add a state observable to help with debugging
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  public isOpen$ = this.isOpenSubject.asObservable();

  private renderer: Renderer2;

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
    private environmentInjector: EnvironmentInjector,
    rendererFactory: RendererFactory2
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  /**
   * Check if a modal is currently open
   */
  public isModalOpen(): boolean {
    return !!this.modalComponentRef;
  }

  /**
   * Open a modal with the specified component
   */
  open<TComponent, TData = any, TResult = any>(
    componentType: Type<TComponent>,
    config?: ModalConfig<TData>
  ): void {
    console.log(
      'ModalService: Opening modal with component:',
      componentType.name
    );
    console.log('ModalService: Config:', config);

    // Ensure DOM is ready
    if (typeof document === 'undefined') {
      console.error('ModalService: Document is not available');
      return;
    }

    // Prevent opening multiple modals at once
    if (this.modalComponentRef) {
      console.warn(
        'ModalService: Another modal is already open. Closing it first.'
      );
      this.close();
    }

    try {
      // Create a wrapper div for the modal
      const modalWrapper = this.renderer.createElement('div');
      this.renderer.setAttribute(
        modalWrapper,
        'id',
        `modal-wrapper-${Date.now()}`
      );
      this.renderer.addClass(modalWrapper, 'modal-wrapper');

      // Add the wrapper to the body
      this.renderer.appendChild(document.body, modalWrapper);

      // Create the container component inside the wrapper
      this.modalComponentRef = createComponent(ModalContainerComponent, {
        environmentInjector: this.environmentInjector,
        hostElement: modalWrapper,
      });

      // Set modal container properties
      const instance = this.modalComponentRef.instance;
      instance.childComponentType = componentType;
      instance.config = config || {};

      // Ensure data gets passed correctly
      if (config?.data) {
        console.log('ModalService: Passing data to modal:', config.data);
      }

      // Attach to the Angular component tree and detect changes
      this.appRef.attachView(this.modalComponentRef.hostView);
      this.modalComponentRef.changeDetectorRef.detectChanges();

      // Update state
      this.isOpenSubject.next(true);

      // Subscribe to close events
      const closeSubscription = instance.closeEvent.subscribe(
        (result: TResult) => {
          console.log('ModalService: Modal closing with result:', result);
          this.close(result);
          closeSubscription.unsubscribe();
        }
      );

      // Trigger animation after a small delay
      setTimeout(() => {
        if (this.modalComponentRef) {
          console.log('ModalService: Triggering enter animation');
          instance.enter();
          this.modalComponentRef.changeDetectorRef.detectChanges();
        }
      }, 50);

      console.log('ModalService: Modal opened successfully');
    } catch (error) {
      console.error('ModalService: Error opening modal:', error);
      // Clean up in case of error
      this.close();
    }
  }

  /**
   * Close the currently open modal
   */
  close(result?: any): void {
    if (!this.modalComponentRef) {
      console.warn('ModalService: No modal is currently open');
      return;
    }

    console.log('ModalService: Closing modal with result:', result);

    // Trigger exit animation
    this.modalComponentRef.instance.leave().then(() => {
      if (this.modalComponentRef) {
        try {
          // Remove the component from Angular's view tree
          this.appRef.detachView(this.modalComponentRef.hostView);

          // Get the host element (wrapper div)
          const hostElement = this.modalComponentRef.location.nativeElement;

          // Destroy the component instance
          this.modalComponentRef.destroy();
          this.modalComponentRef = null;

          // Remove wrapper from DOM if it still exists
          if (hostElement && hostElement.parentNode) {
            hostElement.parentNode.removeChild(hostElement);
          }

          // Update state
          this.isOpenSubject.next(false);

          // Notify subscribers about the result
          this.afterClosedSubject.next(result);

          console.log('ModalService: Modal closed successfully');
        } catch (err) {
          console.error('ModalService: Error during modal cleanup:', err);
          this.isOpenSubject.next(false);
        }
      }
    });
  }

  /**
   * Force close any open modal (for emergency cleanup)
   */
  forceClose(): void {
    if (this.modalComponentRef) {
      try {
        this.appRef.detachView(this.modalComponentRef.hostView);
        const element = this.modalComponentRef.location.nativeElement;
        this.modalComponentRef.destroy();

        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }

        this.modalComponentRef = null;
        this.isOpenSubject.next(false);
        console.log('ModalService: Modal force closed');
      } catch (err) {
        console.error('ModalService: Error during force close:', err);
      }
    }
  }
}
