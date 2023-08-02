import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubjectcomponentComponent } from './subjectcomponent.component';

describe('SubjectcomponentComponent', () => {
  let component: SubjectcomponentComponent;
  let fixture: ComponentFixture<SubjectcomponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubjectcomponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubjectcomponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
