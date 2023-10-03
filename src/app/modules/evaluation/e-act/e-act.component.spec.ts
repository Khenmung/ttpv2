import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EActComponent } from './e-act.component';

describe('StudentactivityComponent', () => {
  let component: EActComponent;
  let fixture: ComponentFixture<EActComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [EActComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EActComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
