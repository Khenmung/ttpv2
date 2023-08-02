import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassgroupmappingComponent } from './classgroupmapping.component';

describe('ClassgroupmappingComponent', () => {
  let component: ClassgroupmappingComponent;
  let fixture: ComponentFixture<ClassgroupmappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClassgroupmappingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassgroupmappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
