import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmissionWithdrawnComponent } from './admissionwithdrawn.component';

describe('InactivestudentComponent', () => {
  let component: AdmissionWithdrawnComponent;
  let fixture: ComponentFixture<AdmissionWithdrawnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdmissionWithdrawnComponent]
    });
    fixture = TestBed.createComponent(AdmissionWithdrawnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
