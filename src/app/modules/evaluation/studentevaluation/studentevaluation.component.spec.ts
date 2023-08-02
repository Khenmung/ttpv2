import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentEvaluationComponent } from './studentevaluation.component';

describe('StudentactivityComponent', () => {
  let component: StudentEvaluationComponent;
  let fixture: ComponentFixture<StudentEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StudentEvaluationComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
