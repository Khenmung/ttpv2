import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationControlComponent } from './evaluationcontrol.component';

describe('EvaluationresultComponent', () => {
  let component: EvaluationControlComponent;
  let fixture: ComponentFixture<EvaluationControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
