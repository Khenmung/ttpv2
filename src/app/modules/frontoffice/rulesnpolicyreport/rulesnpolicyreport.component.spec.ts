import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesnpolicyreportComponent } from './rulesnpolicyreport.component';

describe('RulesnpolicyreportComponent', () => {
  let component: RulesnpolicyreportComponent;
  let fixture: ComponentFixture<RulesnpolicyreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RulesnpolicyreportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RulesnpolicyreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
