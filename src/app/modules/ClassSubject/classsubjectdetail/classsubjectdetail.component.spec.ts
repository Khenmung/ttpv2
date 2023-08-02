import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassSubjectDetailComponent } from './classsubjectdetail.component';

describe('ClasssubjectdashboardComponent', () => {
  let component: ClassSubjectDetailComponent;
  let fixture: ComponentFixture<ClassSubjectDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ClassSubjectDetailComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassSubjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
