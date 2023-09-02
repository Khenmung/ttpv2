import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetreportComponent } from './getreport.component';

describe('GetreportComponent', () => {
  let component: GetreportComponent;
  let fixture: ComponentFixture<GetreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [GetreportComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GetreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
