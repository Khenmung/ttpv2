import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationstatusComponent } from './evaluationstatus.component';

describe('EvaluationstatusComponent', () => {
  let component: EvaluationstatusComponent;
  let fixture: ComponentFixture<EvaluationstatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationstatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluationstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
