import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubjectBoardComponent } from './subjectboard.component';

describe('SubjectdashboardComponent', () => {
  let component: SubjectBoardComponent;
  let fixture: ComponentFixture<SubjectBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [SubjectBoardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubjectBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
