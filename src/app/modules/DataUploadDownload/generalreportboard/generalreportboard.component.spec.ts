import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralReportboardComponent } from './generalreportboard.component';

describe('ReportboardComponent', () => {
  let component: GeneralReportboardComponent;
  let fixture: ComponentFixture<GeneralReportboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [GeneralReportboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralReportboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
