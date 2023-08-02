import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountNatureComponent } from './accountnature.component';

describe('AccountgroupornatureComponent', () => {
  let component: AccountNatureComponent;
  let fixture: ComponentFixture<AccountNatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountNatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountNatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
