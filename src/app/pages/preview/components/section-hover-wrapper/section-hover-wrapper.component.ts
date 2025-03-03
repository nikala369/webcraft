import {AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, Renderer2} from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-section-hover-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-hover-wrapper.component.html',
  styleUrls: ['./section-hover-wrapper.component.scss']
})
export class SectionHoverWrapperComponent implements AfterViewInit {
  @Input() isMobile = false;
  @Input() backgroundColor: any = '';
  @Output() onEdit = new EventEmitter<void>();
  isHovered = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    // Get computed background color
    const bgColor = this.backgroundColor || window.getComputedStyle(this.el.nativeElement).backgroundColor;

    // If background is transparent (some elements inherit it), check the parent
    if (!bgColor || bgColor === 'rgba(0, 0, 0, 0)') {
      const parentBg = window.getComputedStyle(this.el.nativeElement.parentElement!).backgroundColor;
      this.applyBgDetection(parentBg);
    } else {
      this.applyBgDetection(bgColor);
    }
  }

  private applyBgDetection(color: string) {
    // Handle transparent backgrounds by checking ancestor elements
    if (color === 'rgba(0, 0, 0, 0)' || !color) {
      let parent = this.el.nativeElement.parentElement;
      while (parent) {
        const parentColor = window.getComputedStyle(parent).backgroundColor;
        if (parentColor !== 'rgba(0, 0, 0, 0)') {
          color = parentColor;
          break;
        }
        parent = parent.parentElement;
      }
    }

    // Fallback to light theme if no color found
    const isLight = color ? this.isLightColor(color) : true;
    this.renderer.setAttribute(this.el.nativeElement, 'data-light-bg', isLight.toString());
  }

  private isLightColor(color: string): boolean {
    const rgb = color.match(/\d+/g)?.map(Number);
    if (!rgb || rgb.length < 3) return true; // Default to light

    // Calculate relative luminance
    const luminance = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
    return luminance > 0.6; // More accurate threshold
  }
}
