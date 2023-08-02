import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolFeeTypesComponent } from './school-fee-types.component';

describe('SchoolFeeTypesComponent', () => {
  let component: SchoolFeeTypesComponent;
  let fixture: ComponentFixture<SchoolFeeTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SchoolFeeTypesComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolFeeTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
