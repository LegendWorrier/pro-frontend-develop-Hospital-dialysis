import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuardService', () => {
  let service: AuthGuard;
  let authSpy, routerSpy;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', ['currentUser']);
    routerSpy = jasmine.createSpyObj('Router', ['Function']);
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    });
    service = TestBed.inject(AuthGuard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
