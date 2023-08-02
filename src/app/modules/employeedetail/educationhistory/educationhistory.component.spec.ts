import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationhistoryComponent } from './educationhistory.component';

describe('EducationhistoryComponent', () => {
  let component: EducationhistoryComponent;
  let fixture: ComponentFixture<EducationhistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [EducationhistoryComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationhistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
