import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintmonoComponent } from './printmono.component';

describe('PrintmonoComponent', () => {
  let component: PrintmonoComponent;
  let fixture: ComponentFixture<PrintmonoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrintmonoComponent]
    });
    fixture = TestBed.createComponent(PrintmonoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
