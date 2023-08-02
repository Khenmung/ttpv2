import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiscboardComponent } from './miscboard.component';

describe('MiscboardComponent', () => {
  let component: MiscboardComponent;
  let fixture: ComponentFixture<MiscboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [MiscboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MiscboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
