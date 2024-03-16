import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayPropertiesComponent } from './display-properties.component';

describe('DisplayPropertiesComponent', () => {
  let component: DisplayPropertiesComponent;
  let fixture: ComponentFixture<DisplayPropertiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DisplayPropertiesComponent]
    });
    fixture = TestBed.createComponent(DisplayPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
