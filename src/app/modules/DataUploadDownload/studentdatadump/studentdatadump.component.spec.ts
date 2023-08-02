import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentDatadumpComponent } from './studentdatadump.component';

describe('DatadumpComponent', () => {
  let component: StudentDatadumpComponent;
  let fixture: ComponentFixture<StudentDatadumpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentDatadumpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentDatadumpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
