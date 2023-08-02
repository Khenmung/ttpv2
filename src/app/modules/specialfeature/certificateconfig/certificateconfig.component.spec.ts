import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateconfigComponent } from './certificateconfig.component';

describe('CertificateconfigComponent', () => {
  let component: CertificateconfigComponent;
  let fixture: ComponentFixture<CertificateconfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CertificateconfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificateconfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
