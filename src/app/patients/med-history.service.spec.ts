import { TestBed } from '@angular/core/testing';

import { MedHistoryService } from './med-history.service';

describe('MedHistoryService', () => {
  let service: MedHistoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedHistoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
