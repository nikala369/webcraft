import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactStandardComponent } from './contact-standard.component';

describe('ContactStandardComponent', () => {
  let component: ContactStandardComponent;
  let fixture: ComponentFixture<ContactStandardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactStandardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactStandardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
