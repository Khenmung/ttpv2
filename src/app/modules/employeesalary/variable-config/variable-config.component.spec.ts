import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableConfigComponent } from './variable-config.component';

describe('VariableConfigComponent', () => {
  let component: VariableConfigComponent;
  let fixture: ComponentFixture<VariableConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [VariableConfigComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VariableConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
