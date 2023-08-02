import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAttendanceReportComponent } from './employeeattendancereport.component';

describe('EmployeetotalattendanceComponent', () => {
  let component: EmployeeAttendanceReportComponent;
  let fixture: ComponentFixture<EmployeeAttendanceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeAttendanceReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeAttendanceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
