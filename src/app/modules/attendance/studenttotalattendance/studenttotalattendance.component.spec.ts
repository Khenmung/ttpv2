import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudenttotalattendanceComponent } from './studenttotalattendance.component';

describe('StudenttotalattendanceComponent', () => {
  let component: StudenttotalattendanceComponent;
  let fixture: ComponentFixture<StudenttotalattendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudenttotalattendanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudenttotalattendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
