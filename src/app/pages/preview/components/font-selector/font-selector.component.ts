import {Component, EventEmitter, Input, Output, signal} from '@angular/core';

@Component({
  selector: 'app-font-selector',
  standalone: true,
  imports: [],
  templateUrl: './font-selector.component.html',
  styleUrl: './font-selector.component.scss'
})
export class FontSelectorComponent {
  @Input() fonts: string[] = [];
  @Output() fontChange = new EventEmitter<string>();
  selectedFont = signal<string>('Roboto');

  onFontSelect(font: any) {
    let fontValue = font.target.value;
    this.selectedFont.set(fontValue);
    this.fontChange.emit(fontValue);
  }
}
