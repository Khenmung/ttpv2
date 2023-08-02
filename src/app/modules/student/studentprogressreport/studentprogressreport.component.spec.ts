import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentprogressreportComponent } from './studentprogressreport.component';

describe('StudentprogressreportComponent', () => {
  let component: StudentprogressreportComponent;
  let fixture: ComponentFixture<StudentprogressreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StudentprogressreportComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentprogressreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
