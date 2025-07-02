import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  Renderer2,
  inject,
} from '@angular/core';

export interface DragPosition {
  x: number;
  y: number;
}

export interface DragBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

@Directive({
  selector: '[appDraggable]',
  standalone: true,
})
export class DraggableDirective implements OnInit, OnDestroy {
  @Input() dragHandle?: string;
  @Input() dragBoundary: string = 'window';
  @Input() dragEnabled: boolean = true;
  @Input() initialPosition?: DragPosition;
  @Input() constrainToViewport: boolean = true;
  @Input() savePosition: boolean = true;
  @Input() positionKey: string = 'draggable-position';

  @Output() dragStart = new EventEmitter<DragPosition>();
  @Output() dragMove = new EventEmitter<DragPosition>();
  @Output() dragEnd = new EventEmitter<DragPosition>();
  @Output() boundsExceeded = new EventEmitter<string>();

  private renderer = inject(Renderer2);
  private isDragging = false;
  private currentX = 0;
  private currentY = 0;
  private initialX = 0;
  private initialY = 0;
  private startX = 0;
  private startY = 0;
  private dragElement: HTMLElement;
  private handleElement?: HTMLElement;
  private boundaryElement?: HTMLElement;
  private removeListeners: (() => void)[] = [];
  private animationFrameId?: number;

  constructor(private el: ElementRef) {
    this.dragElement = this.el.nativeElement;
  }

  ngOnInit(): void {
    // Initialize the drag element reference
    this.dragElement = this.el.nativeElement;

    // Apply initial styles
    this.setupElement();

    // Store directive reference on element for external access (if needed)
    (this.dragElement as any).__draggableDirective = this;

    // Load saved position or use initial position only if savePosition is true
    if (this.savePosition) {
      const savedPosition = this.loadPosition();
      if (savedPosition) {
        this.internalSetPosition(savedPosition.x, savedPosition.y, false);
      } else if (this.initialPosition) {
        this.internalSetPosition(
          this.initialPosition.x,
          this.initialPosition.y,
          false
        );
      }
    } else if (this.initialPosition) {
      // If not saving position, always use initial position
      this.internalSetPosition(
        this.initialPosition.x,
        this.initialPosition.y,
        false
      );
    }

    // Setup drag handle
    this.setupDragHandle();

    // Setup boundary element
    this.setupBoundary();

    // Ensure element stays within bounds on window resize
    this.setupResizeListener();
  }

  ngOnDestroy() {
    this.cleanup();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    // Remove directive reference
    delete (this.dragElement as any).__draggableDirective;
  }

  private setupElement(): void {
    // Set initial styles
    this.renderer.setStyle(this.dragElement, 'touch-action', 'none');
    this.renderer.setStyle(this.dragElement, 'will-change', 'transform');

    // Add transition for smooth reset
    this.renderer.setStyle(
      this.dragElement,
      'transition',
      'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    );
  }

  private setupDragHandle(): void {
    if (this.dragHandle) {
      this.handleElement = this.dragElement.querySelector(
        this.dragHandle
      ) as HTMLElement;
      if (this.handleElement) {
        this.renderer.setStyle(this.handleElement, 'cursor', 'move');
        this.renderer.setStyle(this.handleElement, 'touch-action', 'none');
      }
    } else {
      this.renderer.setStyle(this.dragElement, 'cursor', 'move');
      this.renderer.setStyle(this.dragElement, 'touch-action', 'none');
    }
  }

  private setupBoundary(): void {
    if (this.dragBoundary === 'parent') {
      this.boundaryElement = this.dragElement.parentElement as HTMLElement;
    } else if (this.dragBoundary !== 'window' && this.dragBoundary) {
      this.boundaryElement = document.querySelector(
        this.dragBoundary
      ) as HTMLElement;
    }
  }

  private setupResizeListener(): void {
    const resizeListener = this.renderer.listen('window', 'resize', () => {
      if (!this.isDragging) {
        this.constrainToBounds();
      }
    });
    this.removeListeners.push(resizeListener);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (!this.dragEnabled || event.button !== 0) return;

    if (
      this.handleElement &&
      !this.handleElement.contains(event.target as Node)
    ) {
      return;
    }

    event.preventDefault();
    this.startDrag(event.clientX, event.clientY);
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (!this.dragEnabled) return;

    if (
      this.handleElement &&
      !this.handleElement.contains(event.target as Node)
    ) {
      return;
    }

    event.preventDefault();
    const touch = event.touches[0];
    this.startDrag(touch.clientX, touch.clientY);
  }

  private startDrag(clientX: number, clientY: number): void {
    this.isDragging = true;

    // Remove transition during drag for smooth movement
    this.renderer.removeStyle(this.dragElement, 'transition');

    // Store start position
    this.startX = clientX;
    this.startY = clientY;
    this.initialX = clientX - this.currentX;
    this.initialY = clientY - this.currentY;

    // Add drag class
    this.renderer.addClass(this.dragElement, 'dragging');

    // Emit drag start
    this.dragStart.emit({ x: this.currentX, y: this.currentY });

    // Add global listeners
    this.addGlobalListeners();
  }

  private drag(clientX: number, clientY: number): void {
    if (!this.isDragging) return;

    // Calculate new position
    let newX = clientX - this.initialX;
    let newY = clientY - this.initialY;

    // Apply constraints if enabled
    if (this.constrainToViewport) {
      const bounds = this.getBounds();
      const constrained = this.constrainPosition(newX, newY, bounds);
      newX = constrained.x;
      newY = constrained.y;
    }

    // Update position immediately without animation frame for responsiveness
    this.currentX = newX;
    this.currentY = newY;
    this.updateTransform();
    this.dragMove.emit({ x: this.currentX, y: this.currentY });
  }

  private endDrag(): void {
    if (!this.isDragging) return;

    this.isDragging = false;

    // Re-add transition after drag ends
    this.renderer.setStyle(
      this.dragElement,
      'transition',
      'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    );

    // Remove drag class
    this.renderer.removeClass(this.dragElement, 'dragging');

    // Clean up listeners
    this.removeGlobalListeners();

    // Save position if enabled
    if (this.savePosition) {
      this.saveCurrentPosition();
    }

    // Emit drag end
    this.dragEnd.emit({ x: this.currentX, y: this.currentY });
  }

  private internalSetPosition(
    x: number,
    y: number,
    save: boolean = true
  ): void {
    // Apply constraints
    if (this.constrainToViewport) {
      const bounds = this.getBounds();
      const constrained = this.constrainPosition(x, y, bounds);
      x = constrained.x;
      y = constrained.y;
    }

    this.currentX = x;
    this.currentY = y;

    // Use requestAnimationFrame for smooth position updates
    requestAnimationFrame(() => {
      this.updateTransform();
    });

    if (save && this.savePosition) {
      this.saveCurrentPosition();
    }
  }

  private updateTransform(): void {
    this.renderer.setStyle(
      this.dragElement,
      'transform',
      `translate3d(${this.currentX}px, ${this.currentY}px, 0)`
    );
  }

  private getBounds(): DragBounds {
    const rect = this.dragElement.getBoundingClientRect();
    const originalX = rect.left - this.currentX;
    const originalY = rect.top - this.currentY;

    let bounds: DragBounds = {
      minX: -Infinity,
      maxX: Infinity,
      minY: -Infinity,
      maxY: Infinity,
    };

    if (this.dragBoundary === 'window') {
      // Keep element fully within viewport
      bounds = {
        minX: -originalX,
        maxX: window.innerWidth - rect.width - originalX,
        minY: -originalY,
        maxY: window.innerHeight - rect.height - originalY,
      };
    } else if (this.boundaryElement) {
      const boundaryRect = this.boundaryElement.getBoundingClientRect();
      bounds = {
        minX: boundaryRect.left - originalX,
        maxX: boundaryRect.right - rect.width - originalX,
        minY: boundaryRect.top - originalY,
        maxY: boundaryRect.bottom - rect.height - originalY,
      };
    }

    return bounds;
  }

  private constrainPosition(
    x: number,
    y: number,
    bounds: DragBounds
  ): DragPosition {
    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, y)),
    };
  }

  private constrainToBounds(): void {
    const bounds = this.getBounds();
    const constrained = this.constrainPosition(
      this.currentX,
      this.currentY,
      bounds
    );

    if (constrained.x !== this.currentX || constrained.y !== this.currentY) {
      this.internalSetPosition(constrained.x, constrained.y);
    }
  }

  private addGlobalListeners(): void {
    // Mouse events
    const mouseMoveListener = this.renderer.listen(
      'document',
      'mousemove',
      (e: MouseEvent) => {
        this.drag(e.clientX, e.clientY);
      }
    );

    const mouseUpListener = this.renderer.listen('document', 'mouseup', () => {
      this.endDrag();
    });

    // Touch events
    const touchMoveListener = this.renderer.listen(
      'document',
      'touchmove',
      (e: TouchEvent) => {
        if (e.touches.length > 0) {
          this.drag(e.touches[0].clientX, e.touches[0].clientY);
        }
      }
    );

    const touchEndListener = this.renderer.listen(
      'document',
      'touchend',
      () => {
        this.endDrag();
      }
    );

    // Cancel on escape key
    const escapeListener = this.renderer.listen(
      'document',
      'keydown',
      (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.isDragging) {
          // Reset to start position
          this.currentX = this.startX - this.initialX;
          this.currentY = this.startY - this.initialY;
          this.updateTransform();
          this.endDrag();
        }
      }
    );

    this.removeListeners.push(
      mouseMoveListener,
      mouseUpListener,
      touchMoveListener,
      touchEndListener,
      escapeListener
    );
  }

  private removeGlobalListeners(): void {
    this.removeListeners.forEach((remove) => remove());
    this.removeListeners = [];
  }

  private cleanup(): void {
    this.removeGlobalListeners();
    this.renderer.setStyle(this.dragElement, 'will-change', 'auto');
  }

  private saveCurrentPosition(): void {
    if (this.positionKey) {
      const position = { x: this.currentX, y: this.currentY };
      localStorage.setItem(this.positionKey, JSON.stringify(position));
    }
  }

  private loadPosition(): DragPosition | null {
    if (this.positionKey) {
      const saved = localStorage.getItem(this.positionKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  // Public API methods
  public setPosition(x: number, y: number): void {
    console.log('[DraggableDirective] Setting position to:', x, y);

    // Clear any ongoing animations
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Apply constraints if needed
    if (this.constrainToViewport) {
      const bounds = this.getBounds();
      const constrained = this.constrainPosition(x, y, bounds);
      x = constrained.x;
      y = constrained.y;
    }

    // Use animation frame for smooth movement
    this.animationFrameId = requestAnimationFrame(() => {
      // Add transition for smooth movement
      this.renderer.setStyle(
        this.dragElement,
        'transition',
        'transform 0.3s ease'
      );

      // Set the position
      this.currentX = x;
      this.currentY = y;
      this.updateTransform();

      // Save the new position
      if (this.savePosition) {
        this.saveCurrentPosition();
      }

      // Remove transition after animation completes
      setTimeout(() => {
        this.renderer.removeStyle(this.dragElement, 'transition');
      }, 300);
    });
  }

  public resetPosition(): void {
    console.log('[DraggableDirective] Resetting position to origin');

    // Clear any ongoing animations
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Reset to origin (0, 0) with animation
    this.animationFrameId = requestAnimationFrame(() => {
      // Add transition for smooth reset
      this.renderer.setStyle(
        this.dragElement,
        'transition',
        'transform 0.3s ease'
      );

      this.currentX = 0;
      this.currentY = 0;
      this.updateTransform();

      // Remove transition after animation completes
      setTimeout(() => {
        this.renderer.removeStyle(this.dragElement, 'transition');
      }, 300);
    });

    // Clear saved position
    if (this.positionKey) {
      localStorage.removeItem(this.positionKey);
    }

    // Emit position change
    setTimeout(() => {
      this.dragEnd.emit({ x: 0, y: 0 });
    }, 300);
  }

  public centerInViewport(): void {
    const rect = this.dragElement.getBoundingClientRect();
    const currentTransform = window.getComputedStyle(
      this.dragElement
    ).transform;

    // Get current transform values
    let currentTranslateX = 0;
    let currentTranslateY = 0;

    if (currentTransform && currentTransform !== 'none') {
      const matrix = currentTransform.match(/matrix.*\((.+)\)/);
      if (matrix) {
        const values = matrix[1].split(', ');
        currentTranslateX = parseFloat(values[4]) || 0;
        currentTranslateY = parseFloat(values[5]) || 0;
      }
    }

    // Calculate the position without current transform
    const rectWithoutTransform = {
      left: rect.left - currentTranslateX,
      top: rect.top - currentTranslateY,
      width: rect.width,
      height: rect.height,
    };

    const x =
      (window.innerWidth - rectWithoutTransform.width) / 2 -
      rectWithoutTransform.left;
    const y =
      (window.innerHeight - rectWithoutTransform.height) / 2 -
      rectWithoutTransform.top;

    this.setPosition(x, y);
  }
}
