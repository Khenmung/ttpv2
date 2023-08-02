import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentfamilynfriendComponent } from './studentfamilynfriend.component';

describe('StudentfamilynfriendComponent', () => {
  let component: StudentfamilynfriendComponent;
  let fixture: ComponentFixture<StudentfamilynfriendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentfamilynfriendComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentfamilynfriendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
