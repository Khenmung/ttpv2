import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpComponentsComponent } from './emp-components.component';

describe('GradeComponentsComponent', () => {
  let component: EmpComponentsComponent;
  let fixture: ComponentFixture<EmpComponentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [EmpComponentsComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
