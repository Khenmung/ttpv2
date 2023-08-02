import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachersubjectComponent } from './teachersubject.component';

describe('TeachersubjectComponent', () => {
  let component: TeachersubjectComponent;
  let fixture: ComponentFixture<TeachersubjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeachersubjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeachersubjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
