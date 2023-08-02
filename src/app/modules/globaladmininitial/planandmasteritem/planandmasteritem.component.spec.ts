import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanandmasteritemComponent } from './planandmasteritem.component';

describe('PlanandmasteritemComponent', () => {
  let component: PlanandmasteritemComponent;
  let fixture: ComponentFixture<PlanandmasteritemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanandmasteritemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanandmasteritemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
