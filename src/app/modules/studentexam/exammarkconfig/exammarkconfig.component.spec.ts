import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExammarkconfigComponent } from './exammarkconfig.component';

describe('ExammarkconfigComponent', () => {
  let component: ExammarkconfigComponent;
  let fixture: ComponentFixture<ExammarkconfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExammarkconfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExammarkconfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
