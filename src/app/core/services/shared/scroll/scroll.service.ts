import { Injectable, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ScrollService {
  modalOpen = signal(false);

  setModalOpen(isOpen: boolean) {
    this.modalOpen.set(isOpen);
  }

  constructor(private router: Router) {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {
        // Scroll to top if navigating to a non-preview route
        // or when initially navigating to the preview route
        if (
          !event.url.includes('/preview') ||
          (event.url.includes('/preview') &&
            !event.urlAfterRedirects.includes('/preview'))
        ) {
          window.scrollTo(0, 0);
        }
      });
  }
}
