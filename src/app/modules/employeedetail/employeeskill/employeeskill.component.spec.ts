import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeskillComponent } from './employeeskill.component';

describe('EmployeeskillComponent', () => {
  let component: EmployeeskillComponent;
  let fixture: ComponentFixture<EmployeeskillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [EmployeeskillComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeskillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
