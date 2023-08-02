import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactdashboardComponent } from './contactdashboard.component';

describe('ContactdashboardComponent', () => {
  let component: ContactdashboardComponent;
  let fixture: ComponentFixture<ContactdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ContactdashboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
