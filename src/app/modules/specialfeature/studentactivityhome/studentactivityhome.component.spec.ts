import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentactivityhomeComponent } from './studentactivityhome.component';

describe('StudentactivityhomeComponent', () => {
  let component: StudentactivityhomeComponent;
  let fixture: ComponentFixture<StudentactivityhomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentactivityhomeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentactivityhomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
