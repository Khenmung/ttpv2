import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionandexamreportComponent } from './questionandexamreport.component';

describe('QuestionandexamreportComponent', () => {
  let component: QuestionandexamreportComponent;
  let fixture: ComponentFixture<QuestionandexamreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionandexamreportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionandexamreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
