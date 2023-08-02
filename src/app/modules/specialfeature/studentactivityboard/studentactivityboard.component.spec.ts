import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentactivityboardComponent } from './studentactivityboard.component';

describe('StudentactivityboardComponent', () => {
  let component: StudentactivityboardComponent;
  let fixture: ComponentFixture<StudentactivityboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentactivityboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentactivityboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
