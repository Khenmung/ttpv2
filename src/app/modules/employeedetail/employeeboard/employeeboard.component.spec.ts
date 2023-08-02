import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeboardComponent } from './employeeboard.component';

describe('EmployeeboardComponent', () => {
  let component: EmployeeboardComponent;
  let fixture: ComponentFixture<EmployeeboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [EmployeeboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
