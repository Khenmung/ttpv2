import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportboardComponent } from './reportboard.component';

describe('ResultboardComponent', () => {
  let component: ReportboardComponent;
  let fixture: ComponentFixture<ReportboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ReportboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
