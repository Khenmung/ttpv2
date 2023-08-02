import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateCertificateComponent } from './generatecertificate.component';

describe('IssueCertificateComponent', () => {
  let component: GenerateCertificateComponent;
  let fixture: ComponentFixture<GenerateCertificateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [GenerateCertificateComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerateCertificateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
