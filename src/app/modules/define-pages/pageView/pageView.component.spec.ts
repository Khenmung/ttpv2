import { ComponentFixture, TestBed } from '@angular/core/testing';

import { pageViewComponent } from './pageView.component';

describe('DetailspostComponent', () => {
  let component: pageViewComponent;
  let fixture: ComponentFixture<pageViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [pageViewComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(pageViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
