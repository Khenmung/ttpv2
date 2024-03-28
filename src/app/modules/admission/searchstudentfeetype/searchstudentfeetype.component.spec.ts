import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchstudentfeetypeComponent } from './searchstudentfeetype.component';

describe('SearchstudentfeetypeComponent', () => {
  let component: SearchstudentfeetypeComponent;
  let fixture: ComponentFixture<SearchstudentfeetypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchstudentfeetypeComponent]
    });
    fixture = TestBed.createComponent(SearchstudentfeetypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
