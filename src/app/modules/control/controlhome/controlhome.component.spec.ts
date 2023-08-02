import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlhomeComponent } from './controlhome.component';

describe('ControlhomeComponent', () => {
  let component: ControlhomeComponent;
  let fixture: ComponentFixture<ControlhomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ControlhomeComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlhomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
