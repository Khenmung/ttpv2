import { ComponentFixture, TestBed } from '@angular/core/testing';

import { studentsubjectdashboardComponent } from './studentsubjectdashboard.component';

describe('ClasssubjectdashboardComponent', () => {
  let component: studentsubjectdashboardComponent;
  let fixture: ComponentFixture<studentsubjectdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [studentsubjectdashboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(studentsubjectdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
