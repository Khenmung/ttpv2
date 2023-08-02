import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelDataManagementComponent } from './excel-data-management.component';

describe('ExcelDataManagementComponent', () => {
  let component: ExcelDataManagementComponent;
  let fixture: ComponentFixture<ExcelDataManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ExcelDataManagementComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExcelDataManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
