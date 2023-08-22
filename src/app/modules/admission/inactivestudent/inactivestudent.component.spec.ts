import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactivestudentComponent } from './inactivestudent.component';

describe('InactivestudentComponent', () => {
  let component: InactivestudentComponent;
  let fixture: ComponentFixture<InactivestudentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InactivestudentComponent]
    });
    fixture = TestBed.createComponent(InactivestudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
