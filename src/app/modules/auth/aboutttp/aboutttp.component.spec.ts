import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutttpComponent } from './aboutttp.component';

describe('AboutttpComponent', () => {
  let component: AboutttpComponent;
  let fixture: ComponentFixture<AboutttpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AboutttpComponent]
    });
    fixture = TestBed.createComponent(AboutttpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
