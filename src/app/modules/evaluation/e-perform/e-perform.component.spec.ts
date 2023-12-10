import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EPerformComponent } from './e-perform.component';

describe('StudentactivityComponent', () => {
  let component: EPerformComponent;
  let fixture: ComponentFixture<EPerformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [EPerformComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EPerformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
