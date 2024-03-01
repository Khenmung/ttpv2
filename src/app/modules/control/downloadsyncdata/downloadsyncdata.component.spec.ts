import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadsyncdataComponent } from './downloadsyncdata.component';

describe('DownloadsyncdataComponent', () => {
  let component: DownloadsyncdataComponent;
  let fixture: ComponentFixture<DownloadsyncdataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DownloadsyncdataComponent]
    });
    fixture = TestBed.createComponent(DownloadsyncdataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
