import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassgroupComponent } from './classgroup.component';

describe('ClassgroupComponent', () => {
  let component: ClassgroupComponent;
  let fixture: ComponentFixture<ClassgroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ClassgroupComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassgroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
