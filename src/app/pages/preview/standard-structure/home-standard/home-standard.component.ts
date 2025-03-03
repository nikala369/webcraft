import {Component, inject, Input, Signal} from '@angular/core';
import {Customizations} from "../../preview.component";

@Component({
  selector: 'app-home-standard',
  standalone: true,
  imports: [],
  templateUrl: './home-standard.component.html',
  styleUrl: './home-standard.component.scss'
})
export class HomeStandardComponent {
  customizations = inject(routerOutletData) as Signal<Customizations>;
  @Input() routerOutletData;
}
