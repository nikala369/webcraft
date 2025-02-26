import { Component, Input, Output, EventEmitter } from '@angular/core';
import { StructureHeaderComponent } from '../components/structure-header/structure-header.component';
import { StructureFooterComponent } from '../components/structure-footer/structure-footer.component';
import { CommonModule } from '@angular/common';
import { Customizations } from '../preview.component';

@Component({
  selector: 'app-standard-structure',
  standalone: true,
  imports: [StructureHeaderComponent, StructureFooterComponent, CommonModule],
  templateUrl: './standard-structure.component.html',
  styleUrls: ['./standard-structure.component.scss']
})
export class StandardStructureComponent {
  // The parent passes in the customizations as a signal function for reactivity.
  @Input() customizations!: () => Customizations;

  // When a section is clicked, we emit an event with the section key.
  @Output() componentSelected = new EventEmitter<{ key: keyof Customizations; name: string }>();

  handleComponentSelection(componentKey: keyof Customizations): void {
    // Create a simple object with a key and a human-friendly name.
    const selectedData = {
      key: componentKey,
      name: componentKey.charAt(0).toUpperCase() + componentKey.slice(1)
    };
    console.log(selectedData, 'selected data');
    this.componentSelected.emit(selectedData);
  }
}
