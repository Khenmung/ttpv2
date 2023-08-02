import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintprogressreportComponent } from './printprogressreport.component';

describe('PrintprogressreportComponent', () => {
  let component: PrintprogressreportComponent;
  let fixture: ComponentFixture<PrintprogressreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintprogressreportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintprogressreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
