import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsPremiumComponent } from './projects-premium.component';

describe('ProjectsPremiumComponent', () => {
  let component: ProjectsPremiumComponent;
  let fixture: ComponentFixture<ProjectsPremiumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsPremiumComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProjectsPremiumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
