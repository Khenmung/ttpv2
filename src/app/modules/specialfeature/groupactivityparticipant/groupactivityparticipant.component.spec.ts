import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupactivityparticipantComponent } from './groupactivityparticipant.component';

describe('GroupactivityparticipantComponent', () => {
  let component: GroupactivityparticipantComponent;
  let fixture: ComponentFixture<GroupactivityparticipantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupactivityparticipantComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupactivityparticipantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
