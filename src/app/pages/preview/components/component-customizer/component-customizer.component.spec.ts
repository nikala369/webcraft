import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentCustomizerComponent } from './component-customizer.component';

describe('ComponentCustomizerComponent', () => {
  let component: ComponentCustomizerComponent;
  let fixture: ComponentFixture<ComponentCustomizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComponentCustomizerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComponentCustomizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
