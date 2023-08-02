import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoOfStudentComponent } from './no-of-student.component';

describe('NoOfStudentComponent', () => {
  let component: NoOfStudentComponent;
  let fixture: ComponentFixture<NoOfStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoOfStudentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoOfStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
