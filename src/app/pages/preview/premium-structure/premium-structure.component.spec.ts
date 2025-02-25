import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiumStructureComponent } from './premium-structure.component';

describe('PremiumStructureComponent', () => {
  let component: PremiumStructureComponent;
  let fixture: ComponentFixture<PremiumStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremiumStructureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PremiumStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
