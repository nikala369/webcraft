import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

export class NgLetContext<T> {
  constructor(public $implicit: T) {}
}

/**
 * NgLet directive - Assigns a value to a local template variable
 *
 * This is useful for removing duplicate safe navigation operators in templates
 * and improving performance by avoiding repeated expressions
 *
 * Example:
 * ```html
 * <ng-container *ngLet="selectedBuild() as build">
 *   {{ build.name }}
 *   {{ build.status }}
 * </ng-container>
 * ```
 */
@Directive({
  selector: '[ngLet]',
  standalone: true,
})
export class NgLetDirective<T> {
  private _context = new NgLetContext<T | null>(null);

  constructor(
    private _viewContainer: ViewContainerRef,
    private _templateRef: TemplateRef<NgLetContext<T>>
  ) {}

  /**
   * The value to assign to the local template variable
   */
  @Input()
  set ngLet(value: T) {
    this._context.$implicit = value;
    this._viewContainer.clear();
    this._viewContainer.createEmbeddedView(this._templateRef, this._context);
  }
}
