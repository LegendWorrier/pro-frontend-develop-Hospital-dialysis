import { inject, TestBed } from '@angular/core/testing';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { AlertController } from '@ionic/angular';
import { AuthService } from './auth/auth.service';
import { GlobalErrorHandler } from './global-error-handler';

describe('GlobalErrorHandler', () => {
  let splashSpy, authSpy;

  beforeEach(() => {
    splashSpy = jasmine.createSpyObj('SplashScreen', ['hide']);
    authSpy = jasmine.createSpyObj('AuthService', ['']);

    TestBed.configureTestingModule({
      providers: [
        { provide: SplashScreen, useValue: splashSpy },
        { provide: AuthService, useValue: authSpy },

        GlobalErrorHandler
      ]
    });
  });

  it('should create an instance', inject([GlobalErrorHandler], (handler: GlobalErrorHandler) => {
    expect(handler).toBeTruthy();
  }));
});
