import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppuserdashboardComponent } from './appuserdashboard.component';

describe('AppuserdashboardComponent', () => {
  let component: AppuserdashboardComponent;
  let fixture: ComponentFixture<AppuserdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AppuserdashboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppuserdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
