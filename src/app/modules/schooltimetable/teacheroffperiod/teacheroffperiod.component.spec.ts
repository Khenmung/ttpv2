import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacheroffperiodComponent } from './teacheroffperiod.component';

describe('TeacheroffperiodComponent', () => {
  let component: TeacheroffperiodComponent;
  let fixture: ComponentFixture<TeacheroffperiodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeacheroffperiodComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacheroffperiodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
