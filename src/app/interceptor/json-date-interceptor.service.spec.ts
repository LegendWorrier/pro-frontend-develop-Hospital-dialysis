import { TestBed } from '@angular/core/testing';
import { JsonDateInterceptor } from './json-date-interceptor.service';


describe('JsonDateInterceptorService', () => {
  let service: JsonDateInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = new JsonDateInterceptor();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
