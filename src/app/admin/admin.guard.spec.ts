import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Route, RouterState } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user';

import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let authService: AuthService;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', {
      currentUser: new User
    })

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService }
      ]
    });
    guard = TestBed.inject(AdminGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should pass when current user is admin', () => {
    authService.currentUser.isAdmin = true;
    const route: Route = {};
    expect(guard.canLoad(route, [])).toBeTrue();
  });

  it('should not pass when current user is not admin', () => {
    authService.currentUser.isAdmin = false;
    const route: Route = {};
    expect(guard.canLoad(route, [])).toBeFalse();
  });

});
