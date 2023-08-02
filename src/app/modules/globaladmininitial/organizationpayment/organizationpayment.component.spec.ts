import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationpaymentComponent } from './organizationpayment.component';

describe('OrganizationpaymentComponent', () => {
  let component: OrganizationpaymentComponent;
  let fixture: ComponentFixture<OrganizationpaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationpaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationpaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
