import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavehomeComponent } from './leavehome.component';

describe('LeavehomeComponent', () => {
  let component: LeavehomeComponent;
  let fixture: ComponentFixture<LeavehomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeavehomeComponent]
    });
    fixture = TestBed.createComponent(LeavehomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
