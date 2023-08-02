import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationMasterComponent } from './evaluationmaster.component';

describe('EvaluationnameComponent', () => {
  let component: EvaluationMasterComponent;
  let fixture: ComponentFixture<EvaluationMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationMasterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
