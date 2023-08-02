import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentActivityComponent } from './studentactivity.component';

describe('SportsResultComponent', () => {
  let component: StudentActivityComponent;
  let fixture: ComponentFixture<StudentActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentActivityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
