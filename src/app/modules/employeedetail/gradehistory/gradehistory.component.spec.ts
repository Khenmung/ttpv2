import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradehistoryComponent } from './gradehistory.component';

describe('GradehistoryComponent', () => {
  let component: GradehistoryComponent;
  let fixture: ComponentFixture<GradehistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [GradehistoryComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GradehistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
