import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeecollectionreportComponent } from './feecollectionreport.component';

describe('FeecollectionreportComponent', () => {
  let component: FeecollectionreportComponent;
  let fixture: ComponentFixture<FeecollectionreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [FeecollectionreportComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeecollectionreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
