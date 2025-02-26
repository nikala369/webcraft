import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureHeaderComponent } from './structure-header.component';

describe('StructureHeaderComponent', () => {
  let component: StructureHeaderComponent;
  let fixture: ComponentFixture<StructureHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureHeaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StructureHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
