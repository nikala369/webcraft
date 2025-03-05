import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { StructureHeaderComponent } from '../components/structure-header/structure-header.component';
import { StructureFooterComponent } from '../components/structure-footer/structure-footer.component';
import { CommonModule } from '@angular/common';
import { Customizations } from '../preview.component';
import {SectionHoverWrapperComponent} from "../components/section-hover-wrapper/section-hover-wrapper.component";
import {RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-standard-structure',
  standalone: true,
  imports: [StructureHeaderComponent, StructureFooterComponent, SectionHoverWrapperComponent, CommonModule, RouterOutlet],
  templateUrl: './standard-structure.component.html',
  styleUrls: ['./standard-structure.component.scss']
})
export class StandardStructureComponent implements OnInit{
  // The parent passes in the customizations as a signal function for reactivity.
  @Input() customizations!: () => Customizations;
  @Input() isMobileLayout = false;
  @Input() isMobileView: any;
  @Input() selectedFont: any;

  // When a section is clicked, we emit an event with the section key.
  @Output() componentSelected = new EventEmitter<{ key: keyof Customizations; name: string }>();

  ngOnInit() {
  }

  handleComponentSelection(componentKey: keyof Customizations): void {
    // Create a simple object with a key and name.
    const selectedData = {
      key: componentKey,
      name: componentKey.charAt(0).toUpperCase() + componentKey.slice(1)
    };
    console.log(selectedData, 'selected data');
    this.componentSelected.emit(selectedData);
  }
}
