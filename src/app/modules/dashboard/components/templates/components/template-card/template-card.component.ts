import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
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
          <ng-container
            *ngIf="
              (template.status === TemplateStatus.Published ||
                template.status === TemplateStatus.Stopped) &&
                template.url;
              else draftImage
            "
          >
            <div
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
              <iframe
                [src]="template.url | safeResourceUrl"
                class="template-preview-iframe"
                title="Website Preview"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                loading="lazy"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
              <div class="iframe-hover-overlay">
                <span class="view-site-text">{{
                  template.status === TemplateStatus.Published
                    ? 'Visit Site'
                    : 'Preview Unavailable'
                }}</span>
              </div>
            </div>
          </ng-container>
          <ng-template #draftImage>
            <img
              [src]="
                template.thumbnailUrl ||
                'https://via.placeholder.com/300x200?text=' + template.type
              "
              [alt]="template.name"
              class="template-img"
            />
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
export class TemplateCardComponent {
  @Input() template!: UserTemplate;
  @Output() edit = new EventEmitter<UserTemplate>();
  @Output() view = new EventEmitter<UserTemplate>();
  @Output() delete = new EventEmitter<UserTemplate>();
  @Output() publish = new EventEmitter<UserTemplate>();

  // Expose the enum to the template
  TemplateStatus = TemplateStatus;

  isPremium(template: UserTemplate): boolean {
    return !!(
      template.type &&
      typeof template.type === 'string' &&
      template.type.toLowerCase().includes('premium')
    );
  }

  openTemplateUrl(url: string | undefined): void {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
