import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceCountComponent } from './attendancecount.component';

describe('AttendancereportComponent', () => {
  let component: AttendanceCountComponent;
  let fixture: ComponentFixture<AttendanceCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendanceCountComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendanceCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
