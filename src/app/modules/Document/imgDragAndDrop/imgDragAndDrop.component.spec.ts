import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgDragAndDropComponent } from './imgDragAndDrop';

describe('FileDragAndDropComponent', () => {
  let component: ImgDragAndDropComponent;
  let fixture: ComponentFixture<ImgDragAndDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ImgDragAndDropComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgDragAndDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
