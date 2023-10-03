import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EMarkComponent } from './e-mark.component';

describe('EvaluationresultComponent', () => {
  let component: EMarkComponent;
  let fixture: ComponentFixture<EMarkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EMarkComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EMarkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
