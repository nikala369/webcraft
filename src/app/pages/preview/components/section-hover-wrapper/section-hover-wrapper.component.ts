import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollService } from '../../../../core/services/shared/scroll/scroll.service';
import { ThemeColorsService } from '../../../../core/services/theme/theme-colors.service';

@Component({
  selector: 'app-section-hover-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-hover-wrapper.component.html',
  styleUrls: ['./section-hover-wrapper.component.scss'],
})
export class SectionHoverWrapperComponent implements OnInit {
  // Legacy inputs for backward compatibility
  @Input() isMobile = false;
  @Input() isMobileView: any;
  @Input() backgroundColor: any = '';
  @Output() onEdit = new EventEmitter<void>();

  // Modern inputs for updated components
  @Input() sectionKey: string = '';
  @Input() sectionName: string = 'Section';
  @Input() sectionPath: string = '';
  @Input() editable: boolean = true;
  @Input() currentPlan: string = 'standard';
  @Input() zIndex: number = 5; // Default z-index
  @Output() sectionSelected = new EventEmitter<{
    key: string;
    name: string;
    path?: string;
  }>();

  // Services
  isViewOnlyStateService = inject(ScrollService);
  private themeColorsService = inject(ThemeColorsService);

  // State
  isHovered = false;
  accentColor = '';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // Set accent color based on plan
    this.accentColor = this.themeColorsService.getPrimaryColor(
      this.currentPlan as 'standard' | 'premium'
    );

    // Apply the z-index to this component
    if (this.zIndex) {
      this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
      this.renderer.setStyle(this.el.nativeElement, 'z-index', this.zIndex);
    }

    // Apply CSS variable for accent color
    this.renderer.setProperty(
      this.el.nativeElement,
      'style',
      `--hover-accent-color: ${this.accentColor};`
    );
  }

  /**
   * Handle click on edit button
   * Support both legacy and modern event patterns
   */
  handleEdit() {
    if (this.sectionKey && this.sectionName) {
      // Modern pattern
      this.sectionSelected.emit({
        key: this.sectionKey,
        name: this.sectionName,
        path: this.sectionPath,
      });
    } else {
      // Legacy pattern
      this.onEdit.emit();
    }
  }
}
