import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalEntryComponent } from './JournalEntry.component';

describe('AccountingVoucherComponent', () => {
  let component: JournalEntryComponent;
  let fixture: ComponentFixture<JournalEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [JournalEntryComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
