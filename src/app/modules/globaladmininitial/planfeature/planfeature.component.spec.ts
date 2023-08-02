import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanfeatureComponent } from './planfeature.component';

describe('PlanfeatureComponent', () => {
  let component: PlanfeatureComponent;
  let fixture: ComponentFixture<PlanfeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanfeatureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanfeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
