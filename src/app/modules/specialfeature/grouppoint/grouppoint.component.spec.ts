import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrouppointComponent } from './grouppoint.component';

describe('GrouppointComponent', () => {
  let component: GrouppointComponent;
  let fixture: ComponentFixture<GrouppointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GrouppointComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrouppointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
