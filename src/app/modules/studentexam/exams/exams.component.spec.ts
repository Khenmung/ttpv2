import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamsComponent } from './exams.component';

describe('ExamsComponent', () => {
  let component: ExamsComponent;
  let fixture: ComponentFixture<ExamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ExamsComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
