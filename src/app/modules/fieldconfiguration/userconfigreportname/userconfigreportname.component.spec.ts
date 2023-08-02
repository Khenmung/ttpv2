import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserconfigreportnameComponent } from './userconfigreportname.component';

describe('UserconfigreportnameComponent', () => {
  let component: UserconfigreportnameComponent;
  let fixture: ComponentFixture<UserconfigreportnameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [UserconfigreportnameComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserconfigreportnameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
