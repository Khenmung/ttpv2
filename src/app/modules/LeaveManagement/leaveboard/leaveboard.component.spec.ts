import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveboardComponent } from './leaveboard.component';

describe('LeaveboardComponent', () => {
  let component: LeaveboardComponent;
  let fixture: ComponentFixture<LeaveboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [LeaveboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
