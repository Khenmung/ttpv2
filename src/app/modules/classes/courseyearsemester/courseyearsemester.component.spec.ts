import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseYearsemesterComponent } from './courseyearsemester.component';

describe('ClassyearsemesterComponent', () => {
  let component: CourseYearsemesterComponent;
  let fixture: ComponentFixture<CourseYearsemesterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CourseYearsemesterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseYearsemesterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
