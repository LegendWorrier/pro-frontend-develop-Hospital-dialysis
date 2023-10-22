import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PrettyPipe } from '../pipes/pretty.pipe';

import { AvShuntService } from './av-shunt.service';

describe('AvShuntService', () => {
  let service: AvShuntService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        PrettyPipe,
        AvShuntService
      ]
    });
    service = TestBed.inject(AvShuntService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
