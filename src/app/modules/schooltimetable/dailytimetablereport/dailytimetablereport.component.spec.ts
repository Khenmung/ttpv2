import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailytimetablereportComponent } from './dailytimetablereport.component';

describe('DailytimetablereportComponent', () => {
  let component: DailytimetablereportComponent;
  let fixture: ComponentFixture<DailytimetablereportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DailytimetablereportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DailytimetablereportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
