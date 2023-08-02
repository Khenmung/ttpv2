import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagesboardComponent } from './pagesboard.component';

describe('PagesboardComponent', () => {
  let component: PagesboardComponent;
  let fixture: ComponentFixture<PagesboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagesboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagesboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
