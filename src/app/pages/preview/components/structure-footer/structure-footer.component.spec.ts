import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructureFooterComponent } from './structure-footer.component';

describe('StructureFooterComponent', () => {
  let component: StructureFooterComponent;
  let fixture: ComponentFixture<StructureFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructureFooterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StructureFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
