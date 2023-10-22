import { TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';

import { ModalService } from './modal.service';

describe('ModalService', () => {
  let service: ModalService;
  let modalCtl: ModalController;

  beforeEach(() => {
    modalCtl = jasmine.createSpyObj('ModalController', ['create']);

    TestBed.configureTestingModule({
      providers: [
        { provide: ModalController, useValue: modalCtl }
      ]
    });
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
