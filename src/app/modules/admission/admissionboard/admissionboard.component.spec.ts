import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmissionboardComponent } from './admissionboard.component';

describe('AdmissionboardComponent', () => {
  let component: AdmissionboardComponent;
  let fixture: ComponentFixture<AdmissionboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdmissionboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmissionboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
