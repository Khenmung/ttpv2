import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDashboardComponent } from './homedashboard.component';

describe('DashboardComponent', () => {
  let component: HomeDashboardComponent;
  let fixture: ComponentFixture<HomeDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [HomeDashboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
