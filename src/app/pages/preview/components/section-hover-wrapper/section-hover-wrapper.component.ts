import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter, inject,
  Input,
  Output,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ScrollService} from "../../../../core/services/shared/scroll/scroll.service";

@Component({
  selector: 'app-section-hover-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-hover-wrapper.component.html',
  styleUrls: ['./section-hover-wrapper.component.scss'],
})
export class SectionHoverWrapperComponent {
  @Input() isMobile = false;
  @Input() isMobileView: any;
  @Input() backgroundColor: any = '';
  @Output() onEdit = new EventEmitter<void>();

  isViewOnlyStateService = inject(ScrollService);

  isHovered = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}
}
