import { ComponentFixture, TestBed } from '@angular/core/testing';

import { studentprimaryinfoComponent } from './studentprimaryinfo.component';

describe('AddstudentComponent', () => {
  let component: studentprimaryinfoComponent;
  let fixture: ComponentFixture<studentprimaryinfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [studentprimaryinfoComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(studentprimaryinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
