import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendancepercentComponent } from './attendancepercent.component';

describe('AttendancepercentComponent', () => {
  let component: AttendancepercentComponent;
  let fixture: ComponentFixture<AttendancepercentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttendancepercentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendancepercentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
