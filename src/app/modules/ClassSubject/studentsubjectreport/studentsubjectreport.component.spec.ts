import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSubjectReportComponent } from './studentsubjectreport.component';

describe('StudentSubjectReportComponent', () => {
  let component: StudentSubjectReportComponent;
  let fixture: ComponentFixture<StudentSubjectReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentSubjectReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentSubjectReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
