import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationresultlistComponent } from './evaluationresultlist.component';

describe('EvaluationresultlistComponent', () => {
  let component: EvaluationresultlistComponent;
  let fixture: ComponentFixture<EvaluationresultlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationresultlistComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationresultlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
