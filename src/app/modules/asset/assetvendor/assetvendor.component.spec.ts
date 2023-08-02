import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetVendorComponent } from './assetvendor.component';

describe('VendorComponent', () => {
  let component: AssetVendorComponent;
  let fixture: ComponentFixture<AssetVendorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetVendorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
