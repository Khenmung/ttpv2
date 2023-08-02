import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomfeaturerolepermissionComponent } from './customfeaturerolepermission.component';

describe('CustomfeaturerolepermissionComponent', () => {
  let component: CustomfeaturerolepermissionComponent;
  let fixture: ComponentFixture<CustomfeaturerolepermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomfeaturerolepermissionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomfeaturerolepermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
