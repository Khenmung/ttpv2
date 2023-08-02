import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingboardComponent } from './accountingboard.component';

describe('AccountingboardComponent', () => {
  let component: AccountingboardComponent;
  let fixture: ComponentFixture<AccountingboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AccountingboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountingboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
