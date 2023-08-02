import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentboardComponent } from './studentboard.component';

describe('StudentboardComponent', () => {
  let component: StudentboardComponent;
  let fixture: ComponentFixture<StudentboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [StudentboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
