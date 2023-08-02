import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnexamComponent } from './questionnexam.component';

describe('QuesitonnexamComponent', () => {
  let component: QuestionnexamComponent;
  let fixture: ComponentFixture<QuestionnexamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionnexamComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionnexamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
