import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeeDefinitionComponent } from './feedefinition.component';

describe('FeeMasterComponent', () => {
  let component: FeeDefinitionComponent;
  let fixture: ComponentFixture<FeeDefinitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeeDefinitionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeeDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
