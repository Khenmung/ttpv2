import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeereceiptComponent } from './feereceipt.component';

describe('FeereceiptComponent', () => {
  let component: FeereceiptComponent;
  let fixture: ComponentFixture<FeereceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [FeereceiptComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeereceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
