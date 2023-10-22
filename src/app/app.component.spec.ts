import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';

import { LoadingController, ModalController, Platform } from '@ionic/angular';
import { Plugins } from '@capacitor/core'

import { AppComponent } from './app.component';
import { AuthService } from './auth/auth.service';
import { SwUpdate } from '@angular/service-worker';
import { DarkMode } from 'capacitor-dark-mode';

const { SplashScreen, StatusBar, Keyboard } = Plugins

describe('AppComponent', () => {

  let platformReadySpy, platformSpy, modalSpy, authSpy, loadingSpy, swSpy;

  beforeEach(waitForAsync(() => {
    platformReadySpy = Promise.resolve();
    platformSpy = jasmine.createSpyObj('Platform', { ready: platformReadySpy, is: false });
    modalSpy = jasmine.createSpyObj('ModalController', ['create']);
    authSpy = jasmine.createSpyObj('AuthService', ['currentUser']);
    loadingSpy = jasmine.createSpyObj('LoadingController', ['create']);
    swSpy = jasmine.createSpyObj('SwUpdate', { isEnabled: false, checkForUpdate:null, available: { subscribe: null }, activated: { subscribe: null } });
    SplashScreen.hide = jasmine.createSpy('SplashScreen.hide');

    // setup platform
    platformSpy.is.and.callFake((plt: string) => {
      if (plt === 'capacitor') {
        return true;
      }
      if (plt === 'android') {
        return false;
      }
    });

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Platform, useValue: platformSpy },
        { provide: ModalController, useValue: modalSpy },
        { provide: LoadingController, useValue: loadingSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: SwUpdate, useValue: swSpy },
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize the app', async () => {
    TestBed.createComponent(AppComponent);
    expect(platformSpy.ready).toHaveBeenCalled();
    await platformReadySpy;
    expect(SplashScreen.hide).toHaveBeenCalled();
  });

  it('should initialize the app when platform is Android', async () => {
    platformSpy.is.and.callFake((plt: string) => {
      if (plt === "capacitor") {
        return true;
      }
      if (plt === "android") {
        return true;
      }
    });
    TestBed.createComponent(AppComponent);
    expect(platformSpy.ready).toHaveBeenCalled();
    await platformReadySpy;
    expect(SplashScreen.hide).toHaveBeenCalled();
  });

  it('should initialize the app when platform is Non-Native', async () => {
    platformSpy.is.and.callFake((plt: string) => {
      if (plt === "capacitor") {
        return false;
      }
      if (plt === "android") {
        return false;
      }
    });
    swSpy.available.subscribe = jasmine.createSpy('SwUpdate.available.subscribe');
    swSpy.activated.subscribe = jasmine.createSpy('SwUpdate.activated.subscribe');
    DarkMode.isDarkModeOn = jasmine.createSpy('isDarkModeOn');
    TestBed.createComponent(AppComponent);
    expect(platformSpy.ready).toHaveBeenCalled();
    await platformReadySpy;
    expect(SplashScreen.hide).toHaveBeenCalled();
    expect(DarkMode.isDarkModeOn).not.toHaveBeenCalled();
  });

});
