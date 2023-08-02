import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassboardComponent } from './classboard.component';

describe('ClassboardComponent', () => {
  let component: ClassboardComponent;
  let fixture: ComponentFixture<ClassboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [ClassboardComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
