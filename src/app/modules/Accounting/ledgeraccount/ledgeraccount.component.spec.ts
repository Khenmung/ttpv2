import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgerAccountComponent } from './ledgeraccount.component';

describe('LedgerAccountComponent', () => {
  let component: LedgerAccountComponent;
  let fixture: ComponentFixture<LedgerAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LedgerAccountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgerAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
