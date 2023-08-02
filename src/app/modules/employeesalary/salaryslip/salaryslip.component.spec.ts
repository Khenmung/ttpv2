import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryslipComponent } from './salaryslip.component';

describe('SalaryslipComponent', () => {
  let component: SalaryslipComponent;
  let fixture: ComponentFixture<SalaryslipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalaryslipComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalaryslipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
