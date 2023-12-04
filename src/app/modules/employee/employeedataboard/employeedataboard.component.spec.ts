import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeedataBoardComponent } from './employeedataboard.component';

describe('EmployeedataBoardComponent', () => {
  let component: EmployeedataBoardComponent;
  let fixture: ComponentFixture<EmployeedataBoardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeedataBoardComponent]
    });
    fixture = TestBed.createComponent(EmployeedataBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
