import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchooltimetableComponent } from './schooltimetable.component';

describe('SchooltimetableComponent', () => {
  let component: SchooltimetableComponent;
  let fixture: ComponentFixture<SchooltimetableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SchooltimetableComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SchooltimetableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
