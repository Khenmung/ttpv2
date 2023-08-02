import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionandexamComponent } from './questionandexam.component';

describe('QuestionandexamComponent', () => {
  let component: QuestionandexamComponent;
  let fixture: ComponentFixture<QuestionandexamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionandexamComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionandexamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
