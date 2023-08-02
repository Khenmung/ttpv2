import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyresultstatusComponent } from './verifyresultstatus.component';

describe('VerifyresultstatusComponent', () => {
  let component: VerifyresultstatusComponent;
  let fixture: ComponentFixture<VerifyresultstatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerifyresultstatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyresultstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
