import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AchievementandpointComponent } from './achievementandpoint.component';

describe('AchievementandpointComponent', () => {
  let component: AchievementandpointComponent;
  let fixture: ComponentFixture<AchievementandpointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AchievementandpointComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AchievementandpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
