import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchdashboardComponent } from './batchdashboard.component';

describe('BatchdashboardComponent', () => {
  let component: BatchdashboardComponent;
  let fixture: ComponentFixture<BatchdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [BatchdashboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
