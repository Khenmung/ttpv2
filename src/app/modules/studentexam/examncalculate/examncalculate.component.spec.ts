import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamncalculateComponent } from './examncalculate.component';

describe('ExamncalculateComponent', () => {
  let component: ExamncalculateComponent;
  let fixture: ComponentFixture<ExamncalculateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExamncalculateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamncalculateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
