import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSalaryComponentComponent } from './employee-salary-component.component';

describe('EmployeeSalaryComponentComponent', () => {
  let component: EmployeeSalaryComponentComponent;
  let fixture: ComponentFixture<EmployeeSalaryComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [EmployeeSalaryComponentComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeSalaryComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
