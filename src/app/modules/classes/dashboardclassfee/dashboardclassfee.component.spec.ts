import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardclassfeeComponent } from './dashboardclassfee.component';

describe('DashboardclassfeeComponent', () => {
  let component: DashboardclassfeeComponent;
  let fixture: ComponentFixture<DashboardclassfeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [DashboardclassfeeComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardclassfeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
