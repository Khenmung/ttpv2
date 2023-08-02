import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleAppPermissiondashboardComponent } from './RoleAppPermissiondashboard.component';

describe('ApproledashboardComponent', () => {
  let component: RoleAppPermissiondashboardComponent;
  let fixture: ComponentFixture<RoleAppPermissiondashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [RoleAppPermissiondashboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleAppPermissiondashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
