import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutPremiumComponent } from './about-premium.component';

describe('AboutPremiumComponent', () => {
  let component: AboutPremiumComponent;
  let fixture: ComponentFixture<AboutPremiumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutPremiumComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AboutPremiumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
