import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightComponent } from './right.component';

describe('RightComponent', () => {
  let component: RightComponent;
  let fixture: ComponentFixture<RightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [RightComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
