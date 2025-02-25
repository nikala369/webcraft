import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardStructureComponent } from './standard-structure.component';

describe('StandardStructureComponent', () => {
  let component: StandardStructureComponent;
  let fixture: ComponentFixture<StandardStructureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StandardStructureComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StandardStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
