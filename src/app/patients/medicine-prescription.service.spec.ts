import { TestBed } from '@angular/core/testing';

import { MedicinePrescriptionService } from './medicine-prescription.service';

describe('MedicinePrescriptionService', () => {
  let service: MedicinePrescriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedicinePrescriptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
