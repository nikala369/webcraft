import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconComponent } from './icon.component';
import { By } from '@angular/platform-browser';

describe('IconComponent', () => {
  let component: IconComponent;
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(IconComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with default settings if no props are provided', () => {
    fixture.detectChanges();
    const svgEl = fixture.debugElement.query(By.css('svg'));
    expect(svgEl).toBeTruthy();
    expect(svgEl.attributes['width']).toBe('24');
    expect(svgEl.attributes['height']).toBe('24');
  });

  it('should respect custom width and height', () => {
    component.width = 32;
    component.height = 32;
    fixture.detectChanges();

    const svgEl = fixture.debugElement.query(By.css('svg'));
    expect(svgEl.attributes['width']).toBe('32');
    expect(svgEl.attributes['height']).toBe('32');
  });

  it('should apply fullscreen-icon class for fullscreen icons', () => {
    component.name = 'enterFullscreen';
    fixture.detectChanges();

    const svgEl = fixture.debugElement.query(By.css('svg'));
    expect(svgEl.classes['fullscreen-icon']).toBeTrue();
  });

  it('should not apply fullscreen-icon class for non-fullscreen icons', () => {
    component.name = 'star';
    fixture.detectChanges();

    const svgEl = fixture.debugElement.query(By.css('svg'));
    expect(svgEl.classes['fullscreen-icon']).toBeFalsy();
  });

  it('should set stroke to currentColor for exitFullscreen icons', () => {
    component.name = 'exitFullscreen';
    fixture.detectChanges();

    expect(component.getStrokeValue()).toBe('currentColor');

    const svgEl = fixture.debugElement.query(By.css('svg'));
    expect(svgEl.attributes['stroke']).toBe('currentColor');
  });

  it('should set stroke to none for non-exitFullscreen icons', () => {
    component.name = 'desktop';
    fixture.detectChanges();

    expect(component.getStrokeValue()).toBe('none');

    const svgEl = fixture.debugElement.query(By.css('svg'));
    expect(svgEl.attributes['stroke']).toBe('none');
  });

  it('should set stroke-width to 2 for exitFullscreen icons', () => {
    component.name = 'exitFullscreen';
    fixture.detectChanges();

    expect(component.getStrokeWidth()).toBe('2');

    const svgEl = fixture.debugElement.query(By.css('svg'));
    expect(svgEl.attributes['stroke-width']).toBe('2');
  });

  it('should render correct icon based on name', () => {
    // Test a few different icons
    const iconNames = ['desktop', 'mobile', 'star', 'save', 'edit', 'view'];

    for (const name of iconNames) {
      component.name = name;
      fixture.detectChanges();

      const iconContainer = fixture.debugElement.query(
        By.css(`[ngSwitchCase="${name}"]`)
      );
      expect(iconContainer).toBeTruthy();
    }
  });
});
