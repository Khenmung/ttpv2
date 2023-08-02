import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassEvaluationComponent } from './classevaluation.component';

describe('ClassEvaluationComponent', () => {
  let component: ClassEvaluationComponent;
  let fixture: ComponentFixture<ClassEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassEvaluationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
