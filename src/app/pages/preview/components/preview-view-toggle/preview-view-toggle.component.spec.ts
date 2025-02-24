import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewViewToggleComponent } from './preview-view-toggle.component';

describe('PreviewViewToggleComponent', () => {
  let component: PreviewViewToggleComponent;
  let fixture: ComponentFixture<PreviewViewToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewViewToggleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreviewViewToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
