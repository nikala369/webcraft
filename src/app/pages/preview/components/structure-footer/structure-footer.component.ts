import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-structure-footer',
  standalone: true,
  imports: [],
  templateUrl: './structure-footer.component.html',
  styleUrl: './structure-footer.component.scss',
})
export class StructureFooterComponent {
  @Input() customizations: any = {};
}
