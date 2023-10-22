import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  let storageSpy, userSpy, alertSpy;

  beforeEach(() => {
    storageSpy = jasmine.createSpyObj('Storage', [ 'get', 'set', 'remove' ]);
    userSpy = jasmine.createSpyObj('UserService', ['getUser']);
    alertSpy = jasmine.createSpyObj('AlertController', ['create']);

    // setup storage
    storageSpy.get.and.callFake((key: string) => {
      return new Promise((resolve) => {
        resolve("test");
      });
    });

    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: Storage, useValue: storageSpy },
        { provide: UserService, useValue: userSpy },
        { provide: AlertController, useValue: alertSpy },

        AuthService
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
