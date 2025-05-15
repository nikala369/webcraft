// src/app/core/services/ui/view-management.service.ts

import {
  Injectable,
  OnDestroy,
  Renderer2,
  RendererFactory2,
  signal,
  computed,
  ElementRef,
  NgZone,
} from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

export const ANIMATION_DURATIONS = {
  FADE_IN: 300,
  FADE_OUT: 300,
  FULLSCREEN_TRANSITION: 300,
};

// Define the desired static offset from the top for programmatic exits
const PROGRAMMATIC_EXIT_SCROLL_OFFSET_Y = 200; // User can adjust this to 100, 150, or their preferred value

@Injectable({ providedIn: 'root' })
export class ViewManagementService implements OnDestroy {
  private destroy$ = new Subject<void>();
  private renderer: Renderer2;

  private previewContainerElement: HTMLElement | null = null;
  private builderAnchorElement: HTMLElement | null = null;

  private _isMobileView = signal<boolean>(window.innerWidth <= 768);
  private _viewMode = signal<'view-desktop' | 'view-mobile'>('view-desktop');
  private _isFullscreen = signal<boolean>(false);
  private _preFsScroll = signal<number>(-1); // -1 means reset/no specific position

  readonly isMobileView = this._isMobileView.asReadonly();
  readonly viewMode = this._viewMode.asReadonly();
  readonly isFullscreen = this._isFullscreen.asReadonly();
  readonly isEditingAllowed = computed(
    () => this._viewMode() !== 'view-mobile'
  );

  constructor(rendererFactory: RendererFactory2, private ngZone: NgZone) {
    this.renderer = rendererFactory.createRenderer(null, null);

    fromEvent(window, 'resize')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateIsMobile());

    const nativeFullscreenEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ];
    nativeFullscreenEvents.forEach((evt) =>
      document.addEventListener(evt, this.onNativeFullscreenChange, false)
    );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    const nativeFullscreenEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ];
    nativeFullscreenEvents.forEach((evt) =>
      document.removeEventListener(evt, this.onNativeFullscreenChange, false)
    );
    this.previewContainerElement = null;
    this.builderAnchorElement = null;
  }

  registerPreviewContainer(containerRef: ElementRef<HTMLElement> | null): void {
    this.previewContainerElement = containerRef?.nativeElement || null;
    // console.log('[ViewMgmt] Preview Container registered:', !!this.previewContainerElement);
  }

  registerBuilderAnchor(anchorRef: ElementRef<HTMLElement> | null): void {
    this.builderAnchorElement = anchorRef?.nativeElement || null;
    // console.log('[ViewMgmt] Builder Anchor registered:', !!this.builderAnchorElement);
  }

  setViewMode(mode: 'view-desktop' | 'view-mobile'): void {
    if (this._viewMode() === mode) return;
    this._viewMode.set(mode);
    // console.log(`[ViewMgmt] View mode set to: ${mode}`);
  }

  setFullscreen(enterFullscreen: boolean): void {
    const currentlyFullscreen = this._isFullscreen();
    if (currentlyFullscreen === enterFullscreen) {
      // console.log(`[ViewMgmt] setFullscreen called with no change (${enterFullscreen}). Current: ${currentlyFullscreen}`);
      return;
    }

    // console.log(`[ViewMgmt] Setting fullscreen to: ${enterFullscreen}`);

    if (enterFullscreen) {
      if (this._preFsScroll() !== -1 && this._preFsScroll() !== 0) {
        this._preFsScroll.set(window.scrollY);
        // console.log(`[ViewMgmt] Entering fullscreen, stored scrollY: ${window.scrollY}px`);
      } else {
        // console.log(`[ViewMgmt] Entering fullscreen, _preFsScroll is ${this._preFsScroll()}, not capturing window.scrollY.`);
      }

      this._isFullscreen.set(true);
      this.renderer.addClass(document.body, 'fullscreen-mode');
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
    } else {
      this._isFullscreen.set(false);
      this.renderer.removeClass(document.body, 'fullscreen-mode');
      this.renderer.removeStyle(document.body, 'overflow');
      this.restoreScrollPosition();
    }
  }

  public setDesiredRestoreScrollPosition(position: number): void {
    this._preFsScroll.set(position);
    // console.log(`[ViewMgmt] Desired restore scroll position explicitly set to: ${position}px`);
  }

  resetStoredScrollPosition(): void {
    // console.log('[ViewMgmt] Stored scroll position explicitly reset to -1.');
    this._preFsScroll.set(-1);
  }

  private restoreScrollPosition(): void {
    this.ngZone.onStable
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(() => {
        this.ngZone.runOutsideAngular(() => {
          requestAnimationFrame(() => {
            const storedScrollPos = this._preFsScroll();
            let scrollTargetY: number;
            let scrollMethod = 'unknown';

            // console.log(`[ViewMgmt] Attempting to restore scroll. Stored/Desired pos: ${storedScrollPos}`);

            if (storedScrollPos > 0) {
              // Case 1: User was scrolled, then manually toggled fullscreen. Restore that position.
              scrollTargetY = storedScrollPos;
              scrollMethod = `Restored to explicitly stored/captured user scroll position: ${storedScrollPos}px`;
            } else if (storedScrollPos === 0) {
              // Case 2: Scroll was explicitly set to 0 (e.g., by PreviewComponent.resetCustomizations).
              // This means "go to the very top of the page".
              scrollTargetY = 0;
              scrollMethod = `Restored to explicitly set top (0px).`;
            } else if (storedScrollPos === -1) {
              // Case 3: Programmatic fullscreen entry (e.g., "edit" from templates page) or reset state.
              // MODIFIED: Scroll to a fixed offset from the top.
              scrollTargetY = PROGRAMMATIC_EXIT_SCROLL_OFFSET_Y;
              scrollMethod = `Programmatic fullscreen exit or reset state: Scrolled to fixed offset ${PROGRAMMATIC_EXIT_SCROLL_OFFSET_Y}px from top.`;
            } else {
              // Fallback for any unexpected storedScrollPos value (e.g., < -1).
              // Defaulting to the same fixed offset might be reasonable here too.
              scrollTargetY = PROGRAMMATIC_EXIT_SCROLL_OFFSET_Y;
              scrollMethod = `Fallback for unexpected storedScrollPos (${storedScrollPos}): Scrolled to fixed offset ${PROGRAMMATIC_EXIT_SCROLL_OFFSET_Y}px from top.`;
            }

            window.scrollTo({ top: scrollTargetY, behavior: 'auto' });
            // console.log(`[ViewMgmt] ${scrollMethod}`);

            // Always reset the stored scroll position after attempting restoration for the next cycle.
            this.resetStoredScrollPosition();
          });
        });
      });
  }

  private updateIsMobile(): void {
    const isNowMobile = window.innerWidth <= 768;
    if (this._isMobileView() !== isNowMobile) {
      this._isMobileView.set(isNowMobile);
      // Consider if the following logic is always desired, as per previous discussion.
      // if (isNowMobile && this._viewMode() === 'view-mobile') {
      //   this._viewMode.set('view-desktop');
      // }
    }
  }

  private onNativeFullscreenChange = (): void => {
    const isBrowserFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    if (this._isFullscreen() && !isBrowserFullscreen) {
      // console.log('[ViewMgmt] Native fullscreen exited (e.g., ESC pressed). Syncing internal state.');
      this.setFullscreen(false);
    } else if (!this._isFullscreen() && isBrowserFullscreen) {
      // console.log('[ViewMgmt] Native fullscreen entered independently. Syncing internal state.');
      this._isFullscreen.set(true);
      this.renderer.addClass(document.body, 'fullscreen-mode');
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
      this._preFsScroll.set(-1); // Ensure consistent state for potential exit
    }
  };
}
