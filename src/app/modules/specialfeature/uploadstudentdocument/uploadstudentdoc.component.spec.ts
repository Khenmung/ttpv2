import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentDocumentComponent } from './uploadstudentdoc.component';

describe('StudentDocumentComponent', () => {
  let component: StudentDocumentComponent;
  let fixture: ComponentFixture<StudentDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StudentDocumentComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
