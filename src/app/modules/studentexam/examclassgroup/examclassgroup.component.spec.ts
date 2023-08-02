import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamclassgroupComponent } from './examclassgroup.component';

describe('ExamclassgroupComponent', () => {
  let component: ExamclassgroupComponent;
  let fixture: ComponentFixture<ExamclassgroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExamclassgroupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamclassgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
