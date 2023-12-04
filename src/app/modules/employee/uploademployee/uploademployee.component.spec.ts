import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploademployeeComponent } from './uploademployee.component';

describe('UploademployeeComponent', () => {
  let component: UploademployeeComponent;
  let fixture: ComponentFixture<UploademployeeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UploademployeeComponent]
    });
    fixture = TestBed.createComponent(UploademployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
