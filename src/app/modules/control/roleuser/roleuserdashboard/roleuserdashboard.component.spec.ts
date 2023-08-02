import { ComponentFixture, TestBed } from '@angular/core/testing';

import { roleuserdashboardComponent } from './roleuserdashboard.component';

describe('ApproleuserdashboardComponent', () => {
  let component: roleuserdashboardComponent;
  let fixture: ComponentFixture<roleuserdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [roleuserdashboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(roleuserdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
