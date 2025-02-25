import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-standard-structure',
  standalone: true,
  imports: [],
  templateUrl: './standard-structure.component.html',
  styleUrl: './standard-structure.component.scss'
})
export class StandardStructureComponent {
  @Input() customizations: any;
  @Output() componentClick = new EventEmitter<string>();

  handleClick(componentId: string) {
    this.componentClick.emit(componentId);
  }
}
