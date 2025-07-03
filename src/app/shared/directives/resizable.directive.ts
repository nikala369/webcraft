import {
  Directive,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  Renderer2,
  inject,
} from '@angular/core';

// --- Interfaces ---
export interface ResizeEvent {
  width: number;
  height: number;
  deltaX: number;
  deltaY: number;
}

export interface ResizeBounds {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

// --- Directive ---
@Directive({
  selector: '[appResizable]',
  standalone: true,
})
export class ResizableDirective implements OnInit, OnDestroy {
  // --- Inputs & Outputs ---
  @Input() resizeEnabled: boolean = true;
  @Input() resizeHandles: string[] = ['right', 'bottom', 'corner'];
  @Input() resizeBounds: ResizeBounds = {
    minWidth: 200,
    maxWidth: 800,
    minHeight: 300,
    maxHeight: window.innerHeight - 40,
  };
  @Input() saveSize: boolean = true;
  @Input() sizeKey: string = 'resizable-size';

  @Output() resizeStart = new EventEmitter<ResizeEvent>();
  @Output() resizing = new EventEmitter<ResizeEvent>();
  @Output() resizeEnd = new EventEmitter<ResizeEvent>();

  // --- Private Properties ---
  private renderer = inject(Renderer2);
  private element: HTMLElement = inject(ElementRef).nativeElement;

  private isResizing = false;
  private currentHandle: string = '';
  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;
  private startLeft = 0;
  private startTop = 0;
  private resizeFrameId: number | null = null;

  private handles: Map<string, HTMLElement> = new Map();
  private persistentListeners: (() => void)[] = [];
  private globalListeners: (() => void)[] = [];

  // --- Lifecycle Hooks ---
  ngOnInit(): void {
    if (this.resizeEnabled) {
      this.setupElement();
      this.createHandles();
      this.loadSavedSize();
    }
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  // --- Core Logic ---
  private setupElement(): void {
    const position = window.getComputedStyle(this.element).position;
    if (position === 'static') {
      this.renderer.setStyle(this.element, 'position', 'relative');
    }
    this.renderer.addClass(this.element, 'resizable');
  }

  private createHandles(): void {
    this.resizeHandles.forEach((handle) => {
      const handleEl = this.renderer.createElement('div');
      this.renderer.addClass(handleEl, 'resize-handle');
      this.renderer.addClass(handleEl, `resize-handle-${handle}`);
      this.renderer.setStyle(
        handleEl,
        'cursor',
        this.getCursorForHandle(handle)
      );
      this.positionHandle(handleEl, handle);
      this.renderer.appendChild(this.element, handleEl);
      this.handles.set(handle, handleEl);

      const onDown = (clientX: number, clientY: number) => {
        if (this.resizeEnabled) {
          this.startResize(clientX, clientY, handle);
        }
      };

      const mouseDown = this.renderer.listen(
        handleEl,
        'mousedown',
        (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          onDown(e.clientX, e.clientY);
        }
      );

      const touchStart = this.renderer.listen(
        handleEl,
        'touchstart',
        (e: TouchEvent) => {
          e.preventDefault();
          e.stopPropagation();
          onDown(e.touches[0].clientX, e.touches[0].clientY);
        }
      );

      this.persistentListeners.push(mouseDown, touchStart);
    });
  }

  private startResize(clientX: number, clientY: number, handle: string): void {
    this.isResizing = true;
    this.currentHandle = handle;
    this.startX = clientX;
    this.startY = clientY;

    const rect = this.element.getBoundingClientRect();
    this.startWidth = rect.width;
    this.startHeight = rect.height;
    this.startLeft = this.element.offsetLeft;
    this.startTop = this.element.offsetTop;

    this.renderer.addClass(this.element, 'resizing');
    this.resizeStart.emit({
      width: this.startWidth,
      height: this.startHeight,
      deltaX: 0,
      deltaY: 0,
    });
    this.addGlobalListeners();
  }

  private onResize(clientX: number, clientY: number): void {
    if (!this.isResizing) return;

    if (this.resizeFrameId) {
      cancelAnimationFrame(this.resizeFrameId);
    }

    this.resizeFrameId = requestAnimationFrame(() => {
      const deltaX = clientX - this.startX;
      const deltaY = clientY - this.startY;
      let newWidth = this.startWidth;
      let newHeight = this.startHeight;
      let newLeft = this.startLeft;
      let newTop = this.startTop;

      // Handle width changes
      if (
        this.currentHandle.includes('right') ||
        this.currentHandle === 'corner'
      ) {
        newWidth = this.startWidth + deltaX;
      }
      if (this.currentHandle.includes('left')) {
        newWidth = this.startWidth - deltaX;
        newLeft = this.startLeft + deltaX;
      }

      // Handle height changes
      if (
        this.currentHandle.includes('bottom') ||
        this.currentHandle === 'corner'
      ) {
        newHeight = this.startHeight + deltaY;
      }
      if (this.currentHandle.includes('top')) {
        newHeight = this.startHeight - deltaY;
        newTop = this.startTop + deltaY;
      }

      // Apply bounds constraints
      const minWidth = this.resizeBounds.minWidth ?? 200;
      const maxWidth = this.resizeBounds.maxWidth ?? 800;
      const minHeight = this.resizeBounds.minHeight ?? 300;
      const maxHeight = this.resizeBounds.maxHeight ?? window.innerHeight;

      const constrainedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
      const constrainedHeight = Math.max(
        minHeight,
        Math.min(newHeight, maxHeight)
      );

      // Calculate position adjustments for left/top handles
      if (this.currentHandle.includes('left')) {
        // Adjust position based on the difference between new and constrained width
        const widthDiff = newWidth - constrainedWidth;
        newLeft = this.startLeft + deltaX - widthDiff;
      }

      if (this.currentHandle.includes('top')) {
        // Adjust position based on the difference between new and constrained height
        const heightDiff = newHeight - constrainedHeight;
        newTop = this.startTop + deltaY - heightDiff;
      }

      // Apply new dimensions
      this.renderer.setStyle(this.element, 'width', `${constrainedWidth}px`);
      this.renderer.setStyle(this.element, 'height', `${constrainedHeight}px`);

      // Apply position changes for left/top handles
      if (
        this.currentHandle.includes('left') ||
        this.currentHandle.includes('top')
      ) {
        // Temporarily store current transform
        const currentTransform = this.element.style.transform;

        // Apply position changes
        if (this.currentHandle.includes('left')) {
          this.renderer.setStyle(this.element, 'left', `${newLeft}px`);
        }
        if (this.currentHandle.includes('top')) {
          this.renderer.setStyle(this.element, 'top', `${newTop}px`);
        }

        // Restore transform if it was set
        if (currentTransform) {
          this.renderer.setStyle(this.element, 'transform', currentTransform);
        }
      }

      // Emit resize event
      this.resizing.emit({
        width: constrainedWidth,
        height: constrainedHeight,
        deltaX: deltaX,
        deltaY: deltaY,
      });
    });
  }

  private endResize(): void {
    if (!this.isResizing) return;
    this.isResizing = false;
    if (this.resizeFrameId) {
      cancelAnimationFrame(this.resizeFrameId);
      this.resizeFrameId = null;
    }
    this.renderer.removeClass(this.element, 'resizing');
    const finalRect = this.element.getBoundingClientRect();
    if (this.saveSize) {
      this.saveCurrentSize(finalRect.width, finalRect.height);
    }
    this.resizeEnd.emit({
      width: finalRect.width,
      height: finalRect.height,
      deltaX: finalRect.width - this.startWidth,
      deltaY: finalRect.height - this.startHeight,
    });
    this.removeGlobalListeners();
  }

  // --- Listener Management ---
  private addGlobalListeners(): void {
    const onMove = (clientX: number, clientY: number) =>
      this.onResize(clientX, clientY);
    this.globalListeners.push(
      this.renderer.listen('document', 'mousemove', (e: MouseEvent) =>
        onMove(e.clientX, e.clientY)
      ),
      this.renderer.listen(
        'document',
        'touchmove',
        (e: TouchEvent) =>
          e.touches.length > 0 &&
          onMove(e.touches[0].clientX, e.touches[0].clientY)
      ),
      this.renderer.listen('document', 'mouseup', () => this.endResize()),
      this.renderer.listen('document', 'touchend', () => this.endResize()),
      this.renderer.listen('document', 'mouseleave', () => this.endResize())
    );
  }

  private removeGlobalListeners(): void {
    this.globalListeners.forEach((remove) => remove());
    this.globalListeners = [];
  }

  private cleanup(): void {
    if (this.resizeFrameId) {
      cancelAnimationFrame(this.resizeFrameId);
    }
    this.removeGlobalListeners();
    this.persistentListeners.forEach((remove) => remove());
    this.handles.forEach((handle) =>
      this.renderer.removeChild(this.element, handle)
    );
    this.handles.clear();
  }

  // --- Helper Methods ---
  private getCursorForHandle(handle: string): string {
    switch (handle) {
      case 'right':
      case 'left':
        return 'ew-resize';
      case 'bottom':
      case 'top':
        return 'ns-resize';
      case 'corner':
        return 'nwse-resize';
      case 'corner-tl':
        return 'nwse-resize';
      case 'corner-tr':
        return 'nesw-resize';
      case 'corner-bl':
        return 'nesw-resize';
      default:
        return 'auto';
    }
  }

  private positionHandle(handleEl: HTMLElement, handle: string): void {
    const styles: { [key: string]: string } = {
      position: 'absolute',
      zIndex: '10',
    };
    switch (handle) {
      case 'right':
        Object.assign(styles, {
          top: '0',
          right: '-4px',
          width: '8px',
          height: '100%',
        });
        break;
      case 'left':
        Object.assign(styles, {
          top: '0',
          left: '-4px',
          width: '8px',
          height: '100%',
        });
        break;
      case 'bottom':
        Object.assign(styles, {
          left: '0',
          bottom: '-4px',
          width: '100%',
          height: '8px',
        });
        break;
      case 'top':
        Object.assign(styles, {
          left: '0',
          top: '-4px',
          width: '100%',
          height: '8px',
        });
        break;
      case 'corner':
        Object.assign(styles, {
          right: '-4px',
          bottom: '-4px',
          width: '16px',
          height: '16px',
        });
        break;
    }
    Object.entries(styles).forEach(([key, value]) =>
      this.renderer.setStyle(handleEl, key, value)
    );
  }

  private saveCurrentSize(width: number, height: number): void {
    if (this.sizeKey) {
      localStorage.setItem(this.sizeKey, JSON.stringify({ width, height }));
    }
  }

  private loadSavedSize(): void {
    if (this.saveSize && this.sizeKey) {
      const saved = localStorage.getItem(this.sizeKey);
      if (saved) {
        try {
          const { width, height } = JSON.parse(saved);
          this.renderer.setStyle(this.element, 'width', `${width}px`);
          this.renderer.setStyle(this.element, 'height', `${height}px`);
        } catch {
          /* Ignore malformed data */
        }
      }
    }
  }

  private clamp(value: number, min?: number, max?: number): number {
    return Math.max(min ?? -Infinity, Math.min(value, max ?? Infinity));
  }

  // --- Public API ---
  public resetSize(width: number, height: number): void {
    // Apply new dimensions
    this.renderer.setStyle(this.element, 'width', `${width}px`);
    this.renderer.setStyle(this.element, 'height', `${height}px`);

    // Clear any saved size
    if (this.saveSize && this.sizeKey) {
      localStorage.removeItem(this.sizeKey);
    }

    // Emit resize end event
    this.resizeEnd.emit({
      width: width,
      height: height,
      deltaX: 0,
      deltaY: 0,
    });
  }
}
