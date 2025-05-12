import {
  Component,
  Inject,
  inject,
  Input,
  PLATFORM_ID,
  signal,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  effect,
  DestroyRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  NavigationEnd,
} from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';
import { trigger, style, animate, transition } from '@angular/animations';
import { Subscription, filter, take } from 'rxjs';
import {
  UserTemplateService,
  UserTemplate,
} from '../../../core/services/template/user-template.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './profile-sidebar.component.html',
  styleUrls: ['./profile-sidebar.component.scss'],
  animations: [
    trigger('sidebarAnimation', [
      transition(':enter', [
        style({ right: '-360px', opacity: 0 }),
        animate('300ms ease-out', style({ right: '0', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ right: '-360px', opacity: 0 })),
      ]),
    ]),
    trigger('overlayAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms ease-in', style({ opacity: 0 }))]),
    ]),
    trigger('linkAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-10px)' }),
        animate(
          '200ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
  ],
})
export class ProfileSidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen = signal(false);

  isMobileDevice = signal(false);
  activeView = signal<'desktop' | 'mobile'>('desktop');
  activeRoute = signal('');
  private destroyRef = inject(DestroyRef);

  authService = inject(AuthService);
  private router = inject(Router);
  private userTemplateService = inject(UserTemplateService);
  private cdr = inject(ChangeDetectorRef);

  userTemplates: UserTemplate[] = [];
  premiumCount = 0;
  premiumProCount = 0;

  navLinks = [
    {
      path: '/app/templates',
      label: 'My Templates',
      icon: 'template',
      exact: false,
    },
    { path: '/app/builds', label: 'My Builds', icon: 'build', exact: false },
    {
      path: '/app/domains',
      label: 'Domain Settings',
      icon: 'domain',
      exact: false,
    },
    {
      path: '/app/settings',
      label: 'Account Settings',
      icon: 'settings',
      exact: false,
    },
  ];

  mainNavLinks = [
    { path: '/about', label: 'About', exact: true },
    { path: '/pricing', label: 'Plan', exact: true },
    { path: '/learn-more', label: 'Learn more', exact: true },
    { path: '/contact', label: 'Contact', exact: true },
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkViewport();
      window.addEventListener('resize', this.checkViewport.bind(this));
    }
    effect(() => {
      const isOpen = this.isOpen();
      this.cdr.detectChanges();
      if (isOpen) {
        setTimeout(() => this.fetchUserTemplates(), 0);
      } else {
        this.clearTemplateData();
      }
    });
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: any) => {
        this.activeRoute.set(event.urlAfterRedirects);
      });
    this.activeRoute.set(this.router.url);
    if (this.isOpen()) {
      this.fetchUserTemplates();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.checkViewport.bind(this));
    }
  }

  private checkViewport(): void {
    if (window.matchMedia('(max-width: 768px)').matches) {
      this.isMobileDevice.set(true);
      this.activeView.set('mobile');
    } else {
      this.isMobileDevice.set(false);
      this.activeView.set('desktop');
    }
  }

  toggle(): void {
    const currentState = this.isOpen();
    const newState = !currentState;
    this.isOpen.set(newState);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = newState ? 'hidden' : '';
    }
  }

  close(): void {
    this.isOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  getInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    const displayName = user.username || user.email || '';
    if (!displayName) return '?';
    return displayName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  logout(): void {
    this.authService.logout();
    this.close();
    this.router.navigate(['/auth/login']);
  }

  isRouteActive(path: string): boolean {
    return this.activeRoute().includes(path);
  }

  private fetchUserTemplates(): void {
    this.userTemplateService
      .searchUserTemplates(0, 20)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.userTemplates = response?.content || [];
          this.countTemplatePlans();
          this.cdr.detectChanges();
        },
        error: () => {
          this.clearTemplateData();
          this.cdr.detectChanges();
        },
      });
  }

  private clearTemplateData(): void {
    this.userTemplates = [];
    this.premiumCount = 0;
    this.premiumProCount = 0;
  }

  private countTemplatePlans(): void {
    if (!this.userTemplates || this.userTemplates.length === 0) {
      this.premiumCount = 0;
      this.premiumProCount = 0;
      return;
    }
    let premium = 0;
    let premiumPro = 0;
    for (const t of this.userTemplates) {
      if (!t || !t.template || !t.template.templatePlan) {
        continue;
      }
      const planType = t.template.templatePlan.type;
      if (planType === 'BASIC') premium++;
      else if (planType === 'PREMIUM') premiumPro++;
    }
    this.premiumCount = premium;
    this.premiumProCount = premiumPro;
  }
}
