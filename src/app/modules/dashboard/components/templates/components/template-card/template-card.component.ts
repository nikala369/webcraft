import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnDestroy,
  ChangeDetectorRef,
  NgZone,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../../../../shared/components/icon/icon.component';
import { PlanBadgeComponent } from '../../../../../../shared/components/plan-badge/plan-badge.component';
import { SafeResourceUrlPipe } from '../../../../../../shared/pipes/safe-resource-url.pipe';
import { UserTemplate, TemplateStatus } from '../../templates.component';

@Component({
  selector: 'app-template-card',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    PlanBadgeComponent,
    SafeResourceUrlPipe,
  ],
  template: `
    <div
      class="template-card card-style"
      [ngClass]="{
        'card--premium': isPremium(template),
        'card--published': template.status === TemplateStatus.Published,
        'card--draft': template.status === TemplateStatus.Draft,
        'card--standard': !isPremium(template)
      }"
    >
      <!-- Template Preview Area -->
      <div class="template-preview-container">
        <div class="template-preview-image-wrapper">
          <!-- Draft image: userBuild is null -->
          <ng-container *ngIf="!template.userBuild; else userBuildBlock">
            <div class="template-preview-image-container">
              <div class="preview-loading-overlay" *ngIf="isPreviewLoading">
                <span class="loading-spinner"></span>
              </div>
              <img
                [src]="
                  template.thumbnailUrl || '/assets/images/draft-background-image.png'"
                [alt]="template.name"
                class="template-img"
                (load)="onPreviewLoad()"
                (error)="onPreviewLoad()"
              />
            </div>
          </ng-container>
          <ng-template #userBuildBlock>
            <!-- userBuild exists -->
            <ng-container *ngIf="!template.url; else previewBlock">
              <!-- userBuild exists but url/address is null: show error overlay immediately -->
              <div class="preview-error-overlay">
                <app-icon name="alert-circle" width="32" height="32"></app-icon>
                <span>Preview unavailable</span>
                <button
                  *ngIf="template.status === TemplateStatus.Published"
                  class="retry-button"
                  (click)="retryLoading()"
                >
                  <app-icon name="refresh" width="14" height="14"></app-icon>
                  Retry
                </button>
              </div>
            </ng-container>
            <ng-template #previewBlock>
              <!-- userBuild exists and url exists -->
              <div
                #previewContainer
                class="template-iframe-link"
                [class.clickable]="template.status === TemplateStatus.Published"
                [attr.tabindex]="
                  template.status === TemplateStatus.Published ? 0 : null
                "
                (click)="
                  template.status === TemplateStatus.Published
                    ? openTemplateUrl(template.url)
                    : null
                "
              >
                <div class="preview-loading-overlay" *ngIf="isPreviewLoading">
                  <span class="loading-spinner"></span>
                </div>
                <iframe
                  #previewIframe
                  *ngIf="iframeUrl"
                  [src]="iframeUrl | safeResourceUrl"
                  class="template-preview-iframe"
                  title="Website Preview"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  loading="lazy"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  (load)="onPreviewLoad()"
                  (error)="onPreviewError()"
                  referrerpolicy="no-referrer"
                ></iframe>
                <div class="iframe-hover-overlay">
                  <span class="view-site-text">{{
                    template.status === TemplateStatus.Published
                      ? 'Visit Site'
                      : 'Preview Unavailable'
                  }}</span>
                </div>
                <!-- Error overlay if preview fails -->
                <div class="preview-error-overlay" *ngIf="previewError">
                  <app-icon
                    name="alert-circle"
                    width="32"
                    height="32"
                  ></app-icon>
                  <span>Preview unavailable</span>
                  <button
                    *ngIf="template.status === TemplateStatus.Published"
                    class="retry-button"
                    (click)="retryLoading()"
                  >
                    <app-icon name="refresh" width="14" height="14"></app-icon>
                    Retry
                  </button>
                </div>
              </div>
            </ng-template>
          </ng-template>
          <!-- Status badge -->
          <div
            class="status-badge-overlay"
            [ngClass]="{
              published: template.status === TemplateStatus.Published,
              draft: template.status === TemplateStatus.Draft,
              stopped: template.status === TemplateStatus.Stopped
            }"
          >
            <app-icon
              *ngIf="template.status === TemplateStatus.Published"
              name="check"
              width="12"
              height="12"
            ></app-icon>
            <!-- Using circle with dot for draft -->
            <span
              *ngIf="template.status === TemplateStatus.Draft"
              class="status-icon draft-icon"
            ></span>
            <!-- Using circle with x for stopped -->
            <span
              *ngIf="template.status === TemplateStatus.Stopped"
              class="status-icon stopped-icon"
            ></span>
            {{
              template.status === TemplateStatus.Published
                ? 'Published'
                : template.status === TemplateStatus.Stopped
                ? 'Stopped'
                : 'Draft'
            }}
          </div>
          <div *ngIf="isPremium(template)" class="premium-overlay"></div>
        </div>
      </div>

      <!-- Template Content -->
      <div class="template-content">
        <!-- Header Badges: Only plan badge now -->
        <div class="template-header-badges">
          <app-plan-badge [plan]="template.plan || 'standard'"></app-plan-badge>
        </div>

        <!-- Template Info -->
        <div class="template-info">
          <h3 class="template-name">
            {{ template.name }}
            <span class="template-type">{{ template.type }}</span>
            <span *ngIf="isPremium(template)" class="premium-badge">
              <app-icon name="star" width="10" height="10"></app-icon>
              Premium
            </span>
          </h3>
          <div class="template-meta">
            <span class="meta-item">
              <app-icon name="calendar" width="14" height="14"></app-icon>
              <span>{{ template.createdAt | date : 'MMM d, yyyy' }}</span>
            </span>
          </div>
          <p class="template-description">
            {{ template.description || 'A customizable website template' }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="template-actions">
          <div class="action-buttons">
            <button
              class="action-btn preview-btn"
              (click)="view.emit(template)"
              title="Preview template"
            >
              <app-icon name="eye" width="16" height="16"></app-icon>
              <span>Preview</span>
            </button>
            <button
              class="action-btn edit-btn"
              (click)="edit.emit(template)"
              title="Edit template"
            >
              <app-icon name="edit" width="16" height="16"></app-icon>
              <span>Edit</span>
            </button>
            <button
              class="action-btn delete-btn"
              (click)="delete.emit(template)"
              title="Delete template"
            >
              <app-icon name="trash" width="16" height="16"></app-icon>
              <span>Delete</span>
            </button>
          </div>
          <div class="action-divider"></div>
          <button
            class="publish-btn"
            [disabled]="
              template.isPublishing ||
              template.status === TemplateStatus.Published ||
              template.status === TemplateStatus.Stopped
            "
            [class.disabled-btn]="
              template.status === TemplateStatus.Published ||
              template.status === TemplateStatus.Stopped
            "
            (click)="publish.emit(template)"
          >
            <ng-container *ngIf="template.isPublishing">
              <span class="loading-spinner"></span>
              <span>Publishing...</span>
            </ng-container>
            <ng-container *ngIf="!template.isPublishing">
              <app-icon name="publish" width="16" height="16"></app-icon>
              <span>Publish</span>
            </ng-container>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../templates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateCardComponent implements OnDestroy, AfterViewInit {
  private _template!: UserTemplate;
  private previewLoadStart = 0;
  private previewLoadTimeout: any;
  private previewFallbackTimeout: any;
  private checkContentTimeout: any;
  private previewRetryCount = 0;
  private readonly MAX_RETRIES = 3;
  private readonly FALLBACK_TIMEOUT = 15000; // 15 seconds - increased timeout
  private readonly MIN_LOADING_DURATION = 750; // 750ms - minimum display time
  private readonly RETRY_BACKOFF = 4000; // 4 seconds of additional time per retry
  private resizeObserver: ResizeObserver | null = null;
  private contentCheckCount = 0;
  private readonly MAX_CONTENT_CHECKS = 5;

  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  @ViewChild('previewIframe') previewIframe?: ElementRef<HTMLIFrameElement>;
  @ViewChild('previewContainer') previewContainer?: ElementRef<HTMLDivElement>;

  // Using a separate property for iframe URL with timestamp to avoid caching
  iframeUrl: string | null = null;

  @Input()
  set template(value: UserTemplate) {
    this._template = value;
    this.resetPreviewState();

    // If userBuild is null, it's a draft: show image, handled by template
    if (!value.userBuild) {
      this.isPreviewLoading = false;
      this.previewError = false;
      return;
    }

    // If userBuild exists but url is null, show error overlay immediately
    if (value.userBuild && !value.url) {
      this.isPreviewLoading = false;
      this.previewError = true;
      return;
    }

    // If userBuild exists and url exists, load the preview
    if (
      value &&
      value.url &&
      (value.status === TemplateStatus.Published ||
        value.status === TemplateStatus.Stopped)
    ) {
      setTimeout(() => {
        this.loadPreview(value);
      }, 0);
    }
  }
  get template(): UserTemplate {
    return this._template;
  }

  @Output() edit = new EventEmitter<UserTemplate>();
  @Output() view = new EventEmitter<UserTemplate>();
  @Output() delete = new EventEmitter<UserTemplate>();
  @Output() publish = new EventEmitter<UserTemplate>();

  // Expose the enum to the template
  TemplateStatus = TemplateStatus;

  // Preview loading state
  isPreviewLoading = true;
  previewError = false;

  constructor() {}

  ngAfterViewInit(): void {
    // Attempt to load the preview if it's still in loading state after view init
    if (this.isPreviewLoading && this._template && this._template.url) {
      // Set up a resize observer to detect when iframe content loads/changes
      if (
        this.previewContainer?.nativeElement &&
        typeof ResizeObserver !== 'undefined'
      ) {
        try {
          this.resizeObserver = new ResizeObserver((entries) => {
            // If we're still loading and we detect content has been added
            if (this.isPreviewLoading) {
              for (const entry of entries) {
                // Check if the iframe has rendered content by checking height changes
                if (entry.contentRect.height > 0) {
                  // Content has loaded - complete loading after a short delay
                  setTimeout(() => {
                    this.onPreviewLoad();
                  }, 300);
                }
              }
            }
          });

          this.resizeObserver.observe(this.previewContainer.nativeElement);
        } catch (e) {
          // ResizeObserver might not be supported or might fail
          console.error('Failed to create ResizeObserver:', e);
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.clearAllTimeouts();

    // Clean up observers
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  isPremium(template: UserTemplate): boolean {
    return !!(
      template.type &&
      typeof template.type === 'string' &&
      template.type.toLowerCase().includes('premium')
    );
  }

  openTemplateUrl(url: string | undefined): void {
    if (url) {
      const fullUrl = this.ensureHttps(url);
      window.open(fullUrl, '_blank');
    }
  }

  resetPreviewState(): void {
    // Clear existing timeouts
    this.clearAllTimeouts();

    // Reset state
    this.isPreviewLoading = true;
    this.previewError = false;
    this.previewRetryCount = 0;
    this.contentCheckCount = 0;
    this.previewLoadStart = Date.now();
    this.iframeUrl = null;
  }

  /**
   * Add https:// to URLs that don't have a protocol
   */
  ensureHttps(url: string): string {
    if (!url) return url;
    if (url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    if (!url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  }

  loadPreview(template: UserTemplate): void {
    // Only proceed if we have a URL
    if (!template.url) {
      this.isPreviewLoading = false;
      this.previewError = true;
      this.cdr.markForCheck();
      return;
    }

    try {
      // Add timestamp and retry count to force fresh load and avoid caching
      const url = new URL(this.ensureHttps(template.url));
      url.searchParams.set('t', Date.now().toString());

      if (this.previewRetryCount > 0) {
        url.searchParams.set('retry', this.previewRetryCount.toString());
      }

      this.iframeUrl = url.toString();

      // Set fallback timeout - longer for retries with exponential backoff
      const timeout =
        this.previewRetryCount > 0
          ? this.FALLBACK_TIMEOUT + this.previewRetryCount * this.RETRY_BACKOFF
          : this.FALLBACK_TIMEOUT;

      // Set a fallback timeout in case the iframe doesn't trigger load events
      this.previewFallbackTimeout = setTimeout(() => {
        this.ngZone.run(() => {
          console.warn('Iframe load timeout for', template.name);
          this.isPreviewLoading = false;
          this.previewError = true;
          this.cdr.markForCheck();
        });
      }, timeout);

      // Schedule additional content checks for iframes that might load but not show content
      this.scheduleContentCheck();
    } catch (e) {
      // Handle URL parsing errors
      console.error(`Error parsing URL for template ${template.id}:`, e);
      this.isPreviewLoading = false;
      this.previewError = true;
      this.cdr.markForCheck();
    }
  }

  /**
   * Schedule a check for iframe content
   * Some iframes might load successfully but not contain any visible content
   */
  scheduleContentCheck(): void {
    // Clear existing check
    if (this.checkContentTimeout) {
      clearTimeout(this.checkContentTimeout);
    }

    // Schedule a new check
    this.checkContentTimeout = setTimeout(() => {
      this.checkIframeContent();
    }, 3000); // Check after 3 seconds
  }

  /**
   * Check if the iframe actually has visible content
   */
  checkIframeContent(): void {
    // Only check if still loading
    if (!this.isPreviewLoading || this.previewError) return;

    this.contentCheckCount++;

    // Get the iframe element
    const iframe = this.previewIframe?.nativeElement;
    if (!iframe) return;

    try {
      // Try to access iframe document - may fail due to cross-origin restrictions
      const hasContent =
        iframe.contentDocument &&
        iframe.contentDocument.body &&
        iframe.contentDocument.body.innerHTML &&
        iframe.contentDocument.body.innerHTML.length > 50;

      if (hasContent) {
        // Content looks good
        this.onPreviewLoad();
        return;
      }
    } catch (e) {
      // Cross-origin restrictions prevent accessing content
      // This is expected and not an error
    }

    // If we've checked multiple times and still no content,
    // either keep checking or fail based on the count
    if (this.contentCheckCount >= this.MAX_CONTENT_CHECKS) {
      // Too many checks - either page is truly empty or we can't detect content
      // We'll accept the load but schedule one final check
      setTimeout(() => {
        this.isPreviewLoading = false;
        this.cdr.markForCheck();
      }, 500);
    } else {
      // Schedule another check
      this.scheduleContentCheck();
    }
  }

  onPreviewLoad(): void {
    this.clearAllTimeouts();

    const elapsed = Date.now() - this.previewLoadStart;

    // Function to complete loading and update UI
    const completeLoading = () => {
      this.ngZone.run(() => {
        this.isPreviewLoading = false;
        this.previewError = false;
        this.cdr.markForCheck();
      });
    };

    // Ensure minimum loading duration for visual consistency
    if (elapsed < this.MIN_LOADING_DURATION) {
      this.previewLoadTimeout = setTimeout(() => {
        completeLoading();
      }, this.MIN_LOADING_DURATION - elapsed);
    } else {
      completeLoading();
    }
  }

  onPreviewError(): void {
    this.clearAllTimeouts();

    console.error(`Preview error for template: ${this._template.name}`);

    // Only set previewError for published/stopped
    if (
      this._template.status === TemplateStatus.Published ||
      this._template.status === TemplateStatus.Stopped
    ) {
      // If we've already retried the maximum number of times, show error
      if (this.previewRetryCount >= this.MAX_RETRIES) {
        this.ngZone.run(() => {
          this.isPreviewLoading = false;
          this.previewError = true;
          this.cdr.markForCheck();
        });
        return;
      }

      // Otherwise, retry loading with exponential backoff
      const retryDelay = 1000 * Math.pow(2, this.previewRetryCount);
      console.log(
        `Retrying preview load in ${retryDelay}ms (attempt ${
          this.previewRetryCount + 1
        }/${this.MAX_RETRIES})`
      );

      setTimeout(() => {
        this.retryLoading();
      }, retryDelay);
    } else {
      // For drafts, just treat as loaded (never show error overlay)
      this.ngZone.run(() => {
        this.isPreviewLoading = false;
        this.previewError = false;
        this.cdr.markForCheck();
      });
    }
  }

  /**
   * Retry loading the preview with exponential backoff
   */
  retryLoading(): void {
    if (this.previewRetryCount >= this.MAX_RETRIES) {
      console.error(
        `Maximum retry attempts (${this.MAX_RETRIES}) reached for template: ${this._template.name}`
      );
      return;
    }

    // Increment retry count
    this.previewRetryCount++;

    // Reset loading state
    this.isPreviewLoading = true;
    this.previewError = false;
    this.previewLoadStart = Date.now();
    this.contentCheckCount = 0;

    // Clear any existing timeouts
    this.clearAllTimeouts();

    // Force iframe reload by temporarily setting the URL to null
    this.iframeUrl = null;

    // Give the DOM a chance to update
    setTimeout(() => {
      // Reload with the template
      this.loadPreview(this._template);
      this.cdr.markForCheck();
    }, 50);
  }

  /**
   * Clear all timeouts to prevent memory leaks
   */
  clearAllTimeouts(): void {
    if (this.previewLoadTimeout) {
      clearTimeout(this.previewLoadTimeout);
      this.previewLoadTimeout = null;
    }

    if (this.previewFallbackTimeout) {
      clearTimeout(this.previewFallbackTimeout);
      this.previewFallbackTimeout = null;
    }

    if (this.checkContentTimeout) {
      clearTimeout(this.checkContentTimeout);
      this.checkContentTimeout = null;
    }
  }
}
