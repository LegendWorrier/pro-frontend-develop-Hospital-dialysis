import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AlertController, LoadingController } from '@ionic/angular';

import { HemoDialysisService } from './hemo-dialysis.service';

describe('HemoDialysisService', () => {
  let service: HemoDialysisService;
  let httpTestingController: HttpTestingController;

  let alertSpy, loadingSpy;

  beforeEach(() => {
    alertSpy = jasmine.createSpyObj('AlertController', ['create']);
    loadingSpy = jasmine.createSpyObj('LoadingController', ['create']);

    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [
        { provide: AlertController, useValue: alertSpy },
        { provide: LoadingController, useValue: loadingSpy },

        HemoDialysisService
      ]
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(HemoDialysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
