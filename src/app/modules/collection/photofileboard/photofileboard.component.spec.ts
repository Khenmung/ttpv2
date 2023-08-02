import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotofileboardComponent } from './photofileboard.component';

describe('PhotofileboardComponent', () => {
  let component: PhotofileboardComponent;
  let fixture: ComponentFixture<PhotofileboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhotofileboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PhotofileboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
