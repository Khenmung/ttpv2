import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamhomeComponent } from './examhome.component';

describe('ExamhomeComponent', () => {
  let component: ExamhomeComponent;
  let fixture: ComponentFixture<ExamhomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ExamhomeComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamhomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
