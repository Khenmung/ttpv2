import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleorganizationComponent } from './singleorganization.component';

describe('SingleorganizationComponent', () => {
  let component: SingleorganizationComponent;
  let fixture: ComponentFixture<SingleorganizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleorganizationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleorganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
