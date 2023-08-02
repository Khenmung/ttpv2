import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportConfigItemComponent } from './reportconfigitem.component';

describe('ReportconfigdataComponent', () => {
  let component: ReportConfigItemComponent;
  let fixture: ComponentFixture<ReportConfigItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ReportConfigItemComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportConfigItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
