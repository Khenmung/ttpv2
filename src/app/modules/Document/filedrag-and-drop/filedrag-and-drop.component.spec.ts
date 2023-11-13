import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiledragAndDropComponent } from './filedrag-and-drop.component';

describe('FiledragAndDropComponent', () => {
  let component: FiledragAndDropComponent;
  let fixture: ComponentFixture<FiledragAndDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [FiledragAndDropComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FiledragAndDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
