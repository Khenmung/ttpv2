import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStudentFeetypeComponent } from './addstudentfeetype.component';

describe('AddStudentFeetypeComponent', () => {
  let component: AddStudentFeetypeComponent;
  let fixture: ComponentFixture<AddStudentFeetypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddStudentFeetypeComponent]
    });
    fixture = TestBed.createComponent(AddStudentFeetypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
