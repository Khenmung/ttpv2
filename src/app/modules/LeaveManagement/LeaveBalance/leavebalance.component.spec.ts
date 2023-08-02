import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveBalanceComponent } from './leavebalance.component';

describe('GradeLeaveComponent', () => {
  let component: LeaveBalanceComponent;
  let fixture: ComponentFixture<LeaveBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [LeaveBalanceComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
