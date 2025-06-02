import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactPremiumComponent } from './contact-premium.component';

describe('ContactPremiumComponent', () => {
  let component: ContactPremiumComponent;
  let fixture: ComponentFixture<ContactPremiumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPremiumComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactPremiumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
