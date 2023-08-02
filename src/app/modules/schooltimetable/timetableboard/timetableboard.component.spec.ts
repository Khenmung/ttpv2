import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimetableboardComponent } from './timetableboard.component';

describe('TimetableboardComponent', () => {
  let component: TimetableboardComponent;
  let fixture: ComponentFixture<TimetableboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [TimetableboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimetableboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
