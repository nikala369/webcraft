import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesEditorComponent } from './services-editor.component';

describe('ServicesEditorComponent', () => {
  let component: ServicesEditorComponent;
  let fixture: ComponentFixture<ServicesEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServicesEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
