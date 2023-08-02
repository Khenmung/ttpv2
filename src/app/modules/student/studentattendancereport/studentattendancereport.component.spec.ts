import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentattendancereportComponent } from './studentattendancereport.component';

describe('StudentattendancereportComponent', () => {
  let component: StudentattendancereportComponent;
  let fixture: ComponentFixture<StudentattendancereportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StudentattendancereportComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentattendancereportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
