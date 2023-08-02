import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassdetailComponent } from './classdetail.component';

describe('ClassdetailComponent', () => {
  let component: ClassdetailComponent;
  let fixture: ComponentFixture<ClassdetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ClassdetailComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassdetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
