import {Component, computed, inject} from '@angular/core';
import {ConfirmationService} from "../../../core/services/shared/confirmation/confirmation.service";
import {CommonModule, NgClass} from "@angular/common";

@Component({
  selector: 'app-confirmation-message',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './confirmation-message.component.html',
  styleUrl: './confirmation-message.component.scss'
})
export class ConfirmationMessageComponent {
  private confirmationService = inject(ConfirmationService);

  // A computed signal that returns the current array of confirmations
  confirmations = computed(() => this.confirmationService.confirmations());

  remove(id: number): void {
    this.confirmationService.removeConfirmation(id);
  }
}
