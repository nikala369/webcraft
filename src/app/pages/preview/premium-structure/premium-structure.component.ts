import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-premium-structure',
  standalone: true,
  imports: [],
  templateUrl: './premium-structure.component.html',
  styleUrl: './premium-structure.component.scss'
})
export class PremiumStructureComponent {
  @Input() customizations: any;
  @Output() componentClick = new EventEmitter<string>();

  handleClick(componentId: string) {
    this.componentClick.emit(componentId);
  }
}
