import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobaladminboardComponent } from './globaladminboard.component';

describe('GlobaladminboardComponent', () => {
  let component: GlobaladminboardComponent;
  let fixture: ComponentFixture<GlobaladminboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [GlobaladminboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobaladminboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
