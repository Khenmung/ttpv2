import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloademployeeComponent } from './downloademployee.component';

describe('DownloademployeeComponent', () => {
  let component: DownloademployeeComponent;
  let fixture: ComponentFixture<DownloademployeeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DownloademployeeComponent]
    });
    fixture = TestBed.createComponent(DownloademployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
