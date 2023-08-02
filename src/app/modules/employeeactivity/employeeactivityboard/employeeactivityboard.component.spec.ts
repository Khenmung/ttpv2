import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeactivityboardComponent } from './employeeactivityboard.component';

describe('EmployeeactivityboardComponent', () => {
  let component: EmployeeactivityboardComponent;
  let fixture: ComponentFixture<EmployeeactivityboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeactivityboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeactivityboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
