import {Component, Input, OnInit, signal} from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-structure-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './structure-header.component.html',
  styleUrl: './structure-header.component.scss'
})
export class StructureHeaderComponent implements OnInit{
  @Input() customizations: any;

  /** Signal for mobile menu toggle */
  isMobileMenuOpen = signal(false);

  ngOnInit() {
    console.log(this.customizations, 'customizations');
  }

  /** Toggle mobile menu visibility */
  toggleMobileMenu() {
    this.isMobileMenuOpen.update(state => !state);
  }

}
