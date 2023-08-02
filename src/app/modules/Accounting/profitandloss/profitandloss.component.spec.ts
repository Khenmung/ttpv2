import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitandlossComponent } from './profitandloss.component';

describe('ProfitandlossComponent', () => {
  let component: ProfitandlossComponent;
  let fixture: ComponentFixture<ProfitandlossComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfitandlossComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfitandlossComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
