import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupactivityComponent } from './groupactivity.component';

describe('GroupactivityComponent', () => {
  let component: GroupactivityComponent;
  let fixture: ComponentFixture<GroupactivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupactivityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupactivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
