import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassmasterdashboardComponent } from './classmasterdashboard.component';

describe('ClasssubjectdashboardComponent', () => {
  let component: ClassmasterdashboardComponent;
  let fixture: ComponentFixture<ClassmasterdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ClassmasterdashboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassmasterdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
