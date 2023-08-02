import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesearchComponent } from './employeesearch.component';

describe('EmployeesearchComponent', () => {
  let component: EmployeesearchComponent;
  let fixture: ComponentFixture<EmployeesearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [EmployeesearchComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeesearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
