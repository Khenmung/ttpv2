import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSubjectMarkCompComponent } from './student-subject-mark-comp.component';

describe('StudentSubjectMarkCompComponent', () => {
  let component: StudentSubjectMarkCompComponent;
  let fixture: ComponentFixture<StudentSubjectMarkCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StudentSubjectMarkCompComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentSubjectMarkCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
