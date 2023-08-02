import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsentListComponent } from './absentlist.component';

describe('AttendancelistComponent', () => {
  let component: AbsentListComponent;
  let fixture: ComponentFixture<AbsentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbsentListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbsentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
