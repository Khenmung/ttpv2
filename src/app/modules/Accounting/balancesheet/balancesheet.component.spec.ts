import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalancesheetComponent } from './balancesheet.component';

describe('BalancesheetComponent', () => {
  let component: BalancesheetComponent;
  let fixture: ComponentFixture<BalancesheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BalancesheetComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalancesheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
