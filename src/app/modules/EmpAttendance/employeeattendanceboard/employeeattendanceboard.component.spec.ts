import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeattendanceboardComponent } from './employeeattendanceboard.component';

describe('EmployeeattendanceboardComponent', () => {
  let component: EmployeeattendanceboardComponent;
  let fixture: ComponentFixture<EmployeeattendanceboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeattendanceboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeattendanceboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
