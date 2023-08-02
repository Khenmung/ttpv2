import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPlanFeatureComponent } from './customerplanfeature.component';

describe('CustomerplanfeatureComponent', () => {
  let component: CustomerPlanFeatureComponent;
  let fixture: ComponentFixture<CustomerPlanFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerPlanFeatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerPlanFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
