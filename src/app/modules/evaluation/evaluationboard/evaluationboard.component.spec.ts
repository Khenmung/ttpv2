import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationboardComponent } from './evaluationboard.component';

describe('EvaluationboardComponent', () => {
  let component: EvaluationboardComponent;
  let fixture: ComponentFixture<EvaluationboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
