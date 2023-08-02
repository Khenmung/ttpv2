import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMasterDataComponent } from './add-master-data.component';

describe('AddMasterDataComponent', () => {
  let component: AddMasterDataComponent;
  let fixture: ComponentFixture<AddMasterDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AddMasterDataComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMasterDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
