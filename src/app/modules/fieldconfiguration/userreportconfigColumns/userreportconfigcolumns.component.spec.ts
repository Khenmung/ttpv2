import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserReportConfigColumnsComponent } from './userreportconfigcolumns.component';

describe('UserreportconfigComponent', () => {
  let component: UserReportConfigColumnsComponent;
  let fixture: ComponentFixture<UserReportConfigColumnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [UserReportConfigColumnsComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserReportConfigColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
