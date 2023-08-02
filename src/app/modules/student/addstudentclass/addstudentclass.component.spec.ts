import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddstudentclassComponent } from './addstudentclass.component';

describe('AddstudentclassComponent', () => {
  let component: AddstudentclassComponent;
  let fixture: ComponentFixture<AddstudentclassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AddstudentclassComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddstudentclassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
