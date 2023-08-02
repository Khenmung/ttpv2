import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyResultsComponent } from './verifyresults.component';

describe('ResultsComponent', () => {
  let component: VerifyResultsComponent;
  let fixture: ComponentFixture<VerifyResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [VerifyResultsComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
