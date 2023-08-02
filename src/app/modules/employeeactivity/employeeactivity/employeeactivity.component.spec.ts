import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeactivityComponent } from './employeeactivity.component';

describe('EmployeeactivityComponent', () => {
  let component: EmployeeactivityComponent;
  let fixture: ComponentFixture<EmployeeactivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeactivityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeactivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
