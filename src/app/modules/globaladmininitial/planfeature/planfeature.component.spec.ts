import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanFeatureComponent } from './planfeature.component';

describe('PlanfeatureComponent', () => {
  let component: PlanFeatureComponent;
  let fixture: ComponentFixture<PlanFeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanFeatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanFeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
