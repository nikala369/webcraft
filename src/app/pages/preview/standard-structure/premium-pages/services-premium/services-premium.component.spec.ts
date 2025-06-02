import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesPremiumComponent } from './services-premium.component';

describe('ServicesPremiumComponent', () => {
  let component: ServicesPremiumComponent;
  let fixture: ComponentFixture<ServicesPremiumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesPremiumComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ServicesPremiumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
