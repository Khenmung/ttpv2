import { ComponentFixture, TestBed } from '@angular/core/testing';

import { userComponent } from './user.component';

describe('AppuserComponent', () => {
  let component: userComponent;
  let fixture: ComponentFixture<userComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [userComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(userComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
