import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceFboLibComponent } from './face-fbo-lib.component';

describe('FaceFboLibComponent', () => {
  let component: FaceFboLibComponent;
  let fixture: ComponentFixture<FaceFboLibComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FaceFboLibComponent]
    });
    fixture = TestBed.createComponent(FaceFboLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
