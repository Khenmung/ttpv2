import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamSubjectMarkEntryComponent } from './examsubjectmarkentry.component';

describe('ExamSubjectMarkEntryComponent', () => {
  let component: ExamSubjectMarkEntryComponent;
  let fixture: ComponentFixture<ExamSubjectMarkEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ExamSubjectMarkEntryComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamSubjectMarkEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
