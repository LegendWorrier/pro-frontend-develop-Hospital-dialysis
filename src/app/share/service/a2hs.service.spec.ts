import { TestBed } from '@angular/core/testing';

import { A2hsService } from './a2hs.service';

describe('A2hsService', () => {
  let service: A2hsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(A2hsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
