import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddstudentfeepaymentComponent } from './addstudentfeepayment.component';

describe('AddstudentfeepaymentComponent', () => {
  let component: AddstudentfeepaymentComponent;
  let fixture: ComponentFixture<AddstudentfeepaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AddstudentfeepaymentComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddstudentfeepaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
