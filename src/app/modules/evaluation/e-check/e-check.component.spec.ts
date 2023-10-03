import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ECheckComponent } from './e-check.component';

describe('EvaluationresultlistComponent', () => {
  let component: ECheckComponent;
  let fixture: ComponentFixture<ECheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ECheckComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ECheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
