import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassEvaluationOptionComponent } from './classevaluationoption.component';

describe('ClassevaluationoptionComponent', () => {
  let component: ClassEvaluationOptionComponent;
  let fixture: ComponentFixture<ClassEvaluationOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassEvaluationOptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassEvaluationOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
