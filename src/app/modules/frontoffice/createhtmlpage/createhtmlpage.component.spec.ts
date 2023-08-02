import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatehtmlpageComponent } from './createhtmlpage.component';

describe('RulesorpolicyComponent', () => {
  let component: CreatehtmlpageComponent;
  let fixture: ComponentFixture<CreatehtmlpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatehtmlpageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatehtmlpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
