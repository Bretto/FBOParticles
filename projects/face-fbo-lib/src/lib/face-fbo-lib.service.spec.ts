import { TestBed } from '@angular/core/testing';

import { FaceFboLibService } from './face-fbo-lib.service';

describe('FaceFboLibService', () => {
  let service: FaceFboLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FaceFboLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
