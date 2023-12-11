import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AverageConfigComponent } from './averageconfig.component';

describe('EverageConfigComponent', () => {
  let component: AverageConfigComponent;
  let fixture: ComponentFixture<AverageConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AverageConfigComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AverageConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
