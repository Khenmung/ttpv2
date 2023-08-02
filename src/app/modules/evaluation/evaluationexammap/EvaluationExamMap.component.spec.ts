import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationExamMapComponent } from './EvaluationExamMap.component';

describe('EvaluationComponent', () => {
  let component: EvaluationExamMapComponent;
  let fixture: ComponentFixture<EvaluationExamMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationExamMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationExamMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
