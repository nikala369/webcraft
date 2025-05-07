import {
  Component,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-template-controls',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="templates-controls">
      <div class="search-container">
        <app-icon
          name="search"
          width="16"
          height="16"
          class="search-icon"
        ></app-icon>
        <input
          type="search"
          placeholder="Search templates..."
          class="search-input"
          (input)="onSearchInput($event)"
          aria-label="Search templates"
        />
      </div>
      <div class="filter-container">
        <select
          class="filter-select"
          (change)="onFilterSelect($event)"
          aria-label="Filter templates"
        >
          <option value="all">All Templates</option>
          <option value="restaurant">Restaurant</option>
          <option value="salon">Salon</option>
          <option value="portfolio">Portfolio</option>
          <option value="architecture">Architecture</option>
        </select>
      </div>
      <div class="pagination-controls" *ngIf="totalPages > 1">
        <span class="pagination-info"
          >{{ currentPage + 1 }}/{{ totalPages }}</span
        >
        <div class="pagination-buttons">
          <button
            class="pagination-button"
            [disabled]="isFirstPage"
            (click)="onPrevPage()"
            aria-label="Previous page"
          >
            <app-icon name="arrow_back" [width]="16" [height]="16"></app-icon>
          </button>
          <button
            class="pagination-button"
            [disabled]="isLastPage"
            (click)="onNextPage()"
            aria-label="Next page"
          >
            <app-icon
              name="arrow_forward"
              [width]="16"
              [height]="16"
            ></app-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../../templates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateControlsComponent {
  @Input() totalPages: number = 1;
  @Input() currentPage: number = 0;
  @Input() isFirstPage: boolean = true;
  @Input() isLastPage: boolean = true;

  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<string>();
  @Output() prevPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchChange.emit(target.value);
  }

  onFilterSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filterChange.emit(target.value);
  }

  onPrevPage(): void {
    this.prevPage.emit();
  }

  onNextPage(): void {
    this.nextPage.emit();
  }
}
