import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionbankboardComponent } from './questionbankboard.component';

describe('QuestionbankboardComponent', () => {
  let component: QuestionbankboardComponent;
  let fixture: ComponentFixture<QuestionbankboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionbankboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionbankboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
