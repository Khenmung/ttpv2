import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoteclassComponent } from './promoteclass.component';

describe('PromoteclassComponent', () => {
  let component: PromoteclassComponent;
  let fixture: ComponentFixture<PromoteclassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PromoteclassComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PromoteclassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
