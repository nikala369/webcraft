import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuPremiumComponent } from './menu-premium.component';

describe('MenuPremiumComponent', () => {
  let component: MenuPremiumComponent;
  let fixture: ComponentFixture<MenuPremiumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuPremiumComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenuPremiumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
