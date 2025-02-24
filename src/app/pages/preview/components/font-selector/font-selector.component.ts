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

  onFontSelect(font: string) {
    console.log(font, 'Font value')
    this.selectedFont.set(font);
    this.fontChange.emit(font);
  }
}
