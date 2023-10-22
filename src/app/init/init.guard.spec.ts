import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';

import { InitGuard as InitGuard } from './init.guard';
import { InitService } from './init.service';

describe('InitGuard', () => {
  let guard: InitGuard;

  let initSpy, routerSpy, storageSpy;

  beforeEach(() => {
    initSpy = jasmine.createSpyObj('InitService', ['']);
    routerSpy = jasmine.createSpyObj('Router', ['']);
    storageSpy = jasmine.createSpyObj('Storage', ['get', 'set']);

    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: InitService, useValue: initSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Storage, useValue: storageSpy },

        InitGuard
      ]
    });
    guard = TestBed.inject(InitGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
