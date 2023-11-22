import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentstatusComponent } from './studentstatus.component';

describe('StudentstatusComponent', () => {
  let component: StudentstatusComponent;
  let fixture: ComponentFixture<StudentstatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StudentstatusComponent]
    });
    fixture = TestBed.createComponent(StudentstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
