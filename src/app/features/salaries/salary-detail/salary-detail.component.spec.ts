import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaryDetailComponent } from './salary-detail.component';

describe('SalaryDetailComponent', () => {
  let component: SalaryDetailComponent;
  let fixture: ComponentFixture<SalaryDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalaryDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalaryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
