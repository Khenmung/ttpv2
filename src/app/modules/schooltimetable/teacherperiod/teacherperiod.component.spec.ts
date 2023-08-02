import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherperiodComponent } from './teacherperiod.component';

describe('TeacherperiodComponent', () => {
  let component: TeacherperiodComponent;
  let fixture: ComponentFixture<TeacherperiodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeacherperiodComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherperiodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
