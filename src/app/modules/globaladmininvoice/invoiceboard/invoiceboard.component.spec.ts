import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceboardComponent } from './invoiceboard.component';

describe('InvoiceboardComponent', () => {
  let component: InvoiceboardComponent;
  let fixture: ComponentFixture<InvoiceboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
