import { ComponentFixture, TestBed } from '@angular/core/testing';

import { roleappAddComponent } from './roleappadd.component';

describe('ApproleuseraddComponent', () => {
  let component: roleappAddComponent;
  let fixture: ComponentFixture<roleappAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [roleappAddComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(roleappAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
