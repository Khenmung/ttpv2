import { ComponentFixture, TestBed } from '@angular/core/testing';

import { pageDashboardComponent } from './pageDashboard.component';

describe('PagecontentComponent', () => {
  let component: pageDashboardComponent;
  let fixture: ComponentFixture<pageDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [pageDashboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(pageDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
