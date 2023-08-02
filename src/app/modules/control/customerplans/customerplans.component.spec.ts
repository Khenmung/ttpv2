import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPlansComponent } from './customerplans.component';

describe('CustomerappsComponent', () => {
  let component: CustomerPlansComponent;
  let fixture: ComponentFixture<CustomerPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [CustomerPlansComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
