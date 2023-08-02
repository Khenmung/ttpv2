import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentprofilereportComponent } from './studentprofilereport.component';

describe('StudentprofilereportComponent', () => {
  let component: StudentprofilereportComponent;
  let fixture: ComponentFixture<StudentprofilereportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentprofilereportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentprofilereportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
