import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HireCandidateComponent } from './hire-candidate.component';

describe('HireCandidateComponent', () => {
  let component: HireCandidateComponent;
  let fixture: ComponentFixture<HireCandidateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HireCandidateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HireCandidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
