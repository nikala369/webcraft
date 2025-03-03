import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeStandardComponent } from './home-standard.component';

describe('HomeStandardComponent', () => {
  let component: HomeStandardComponent;
  let fixture: ComponentFixture<HomeStandardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeStandardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeStandardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
