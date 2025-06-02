import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioPremiumComponent } from './portfolio-premium.component';

describe('PortfolioPremiumComponent', () => {
  let component: PortfolioPremiumComponent;
  let fixture: ComponentFixture<PortfolioPremiumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioPremiumComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PortfolioPremiumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
