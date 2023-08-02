import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigboardComponent } from './configboard.component';

describe('ConfigboardComponent', () => {
  let component: ConfigboardComponent;
  let fixture: ComponentFixture<ConfigboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ConfigboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
