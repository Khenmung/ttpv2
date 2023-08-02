import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceboardComponent } from './attendanceboard.component';

describe('AttendanceboardComponent', () => {
  let component: AttendanceboardComponent;
  let fixture: ComponentFixture<AttendanceboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AttendanceboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
