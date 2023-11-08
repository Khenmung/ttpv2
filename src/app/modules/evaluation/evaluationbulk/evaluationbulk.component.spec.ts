import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationBulkComponent } from './evaluationbulk.component';

describe('EvaluationBulkComponent', () => {
  let component: EvaluationBulkComponent;
  let fixture: ComponentFixture<EvaluationBulkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationBulkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationBulkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
