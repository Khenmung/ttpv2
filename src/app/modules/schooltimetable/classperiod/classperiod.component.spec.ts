import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassperiodComponent } from './classperiod.component';

describe('ClassperiodComponent', () => {
  let component: ClassperiodComponent;
  let fixture: ComponentFixture<ClassperiodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ClassperiodComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassperiodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
