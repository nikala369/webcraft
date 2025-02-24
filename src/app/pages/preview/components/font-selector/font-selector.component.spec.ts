import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FontSelectorComponent } from './font-selector.component';

describe('FontSelectorComponent', () => {
  let component: FontSelectorComponent;
  let fixture: ComponentFixture<FontSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FontSelectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FontSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
