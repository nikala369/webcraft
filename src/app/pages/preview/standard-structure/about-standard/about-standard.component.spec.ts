import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutStandardComponent } from './about-standard.component';

describe('AboutStandardComponent', () => {
  let component: AboutStandardComponent;
  let fixture: ComponentFixture<AboutStandardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutStandardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AboutStandardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
