import { ComponentFixture, TestBed } from '@angular/core/testing';

import { searchstudentComponent } from './searchstudent.component';

describe('DashboardstudentComponent', () => {
  let component: searchstudentComponent;
  let fixture: ComponentFixture<searchstudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [searchstudentComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(searchstudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
