import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkhistoryComponent } from './workhistory.component';

describe('WorkhistoryComponent', () => {
  let component: WorkhistoryComponent;
  let fixture: ComponentFixture<WorkhistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [WorkhistoryComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkhistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
