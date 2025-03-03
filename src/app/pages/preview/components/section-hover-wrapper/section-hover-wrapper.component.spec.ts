import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionHoverWrapperComponent } from './section-hover-wrapper.component';

describe('SectionHoverWrapperComponent', () => {
  let component: SectionHoverWrapperComponent;
  let fixture: ComponentFixture<SectionHoverWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHoverWrapperComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SectionHoverWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
