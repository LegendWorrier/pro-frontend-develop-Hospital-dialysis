import { TestBed } from '@angular/core/testing';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { AlertController, Platform } from '@ionic/angular';
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('Auth.Interceptor', () => {
  let authSpy, platformSpy, alertApy, splashSpy;

  let interceptor: AuthInterceptor;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', ['currentUser']);
    platformSpy = jasmine.createSpyObj('Platform', ['is']);
    alertApy = jasmine.createSpyObj('AlertController', ['create']);
    splashSpy = jasmine.createSpyObj('SplashScreen', ['hide']);
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Platform, useValue: platformSpy },
        { provide: AlertController, useValue: alertApy },
        { provide: SplashScreen, useValue: splashSpy },

        AuthInterceptor
      ]
    });

    interceptor = TestBed.inject(AuthInterceptor);
  });

  it('should create an instance', () => {
    expect(interceptor).toBeTruthy();
  });
});
