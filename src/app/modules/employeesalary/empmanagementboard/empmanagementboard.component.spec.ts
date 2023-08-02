import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpmanagementboardComponent } from './empmanagementboard.component';

describe('EmpmanagementboardComponent', () => {
  let component: EmpmanagementboardComponent;
  let fixture: ComponentFixture<EmpmanagementboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [EmpmanagementboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpmanagementboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
