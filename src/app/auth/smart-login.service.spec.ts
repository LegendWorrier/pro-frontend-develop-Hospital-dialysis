import { TestBed } from '@angular/core/testing';

import { SmartLoginService } from './smart-login.service';

describe('SmartLoginService', () => {
  let service: SmartLoginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SmartLoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
