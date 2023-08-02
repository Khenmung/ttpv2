import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeedocumentsComponent } from './employeedocuments.component';

describe('EmployeedocumentsComponent', () => {
  let component: EmployeedocumentsComponent;
  let fixture: ComponentFixture<EmployeedocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [EmployeedocumentsComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeedocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
