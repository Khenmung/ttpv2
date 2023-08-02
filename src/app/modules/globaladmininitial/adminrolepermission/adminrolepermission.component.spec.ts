import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminrolepermissionComponent } from './adminrolepermission.component';

describe('AdminrolepermissionComponent', () => {
  let component: AdminrolepermissionComponent;
  let fixture: ComponentFixture<AdminrolepermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminrolepermissionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminrolepermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
