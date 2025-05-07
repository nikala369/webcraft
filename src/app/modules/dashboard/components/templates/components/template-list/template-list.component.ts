import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserTemplate } from '../../templates.component';
import { TemplateCardComponent } from '../template-card/template-card.component';

@Component({
  selector: 'app-template-list',
  standalone: true,
  imports: [CommonModule, TemplateCardComponent],
  template: `
    <div class="templates-list">
      <app-template-card
        *ngFor="let template of templates; trackBy: trackById"
        [template]="template"
        (edit)="edit.emit($event)"
        (view)="view.emit($event)"
        (delete)="delete.emit($event)"
        (publish)="publish.emit($event)"
      ></app-template-card>
    </div>
  `,
  styleUrls: ['../../templates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateListComponent {
  @Input() templates: UserTemplate[] = [];
  @Output() edit = new EventEmitter<UserTemplate>();
  @Output() view = new EventEmitter<UserTemplate>();
  @Output() delete = new EventEmitter<UserTemplate>();
  @Output() publish = new EventEmitter<UserTemplate>();

  trackById(_index: number, template: UserTemplate): string {
    return template.id;
  }
}
