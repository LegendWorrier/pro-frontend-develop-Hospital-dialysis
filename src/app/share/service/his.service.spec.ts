import { TestBed } from '@angular/core/testing';

import { HisService } from './his.service';

describe('HisService', () => {
  let service: HisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
