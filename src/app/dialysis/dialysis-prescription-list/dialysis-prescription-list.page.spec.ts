import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AlertController, IonicModule, IonNav, ModalController, Platform } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Patient } from 'src/app/patients/patient';
import { HemoDialysisService } from '../hemo-dialysis.service';

import { DialysisPrescriptionListPage } from './dialysis-prescription-list.page';

describe('DialysisPrescriptionListPage', () => {
  let component: DialysisPrescriptionListPage;
  let fixture: ComponentFixture<DialysisPrescriptionListPage>;

  let modal: ModalController;
  let alertCtl: AlertController;
  let hemoService: HemoDialysisService;
  let auth: AuthService;
  let nav: IonNav;
  let pltSpy;

  beforeEach(waitForAsync(() => {
    modal = jasmine.createSpyObj('ModalController', ['create']);
    alertCtl = jasmine.createSpyObj('AlertController', ['create']);
    hemoService = jasmine.createSpyObj('HemoDialysisService', ['getDialysisPrescriptionList']);
    auth = jasmine.createSpyObj('AuthService', ['currentUser']);
    nav = jasmine.createSpyObj('IonNav', ['push']);
    pltSpy = jasmine.createSpyObj('Platform', ['is', 'width']);

    // setup mock
    hemoService.getDialysisPrescriptionList = jasmine.createSpy().and.returnValue(new Observable);
    auth.currentUser.checkPermissionLevel = jasmine.createSpy().and.returnValue(true);
    pltSpy.width = jasmine.createSpy().and.returnValue(500);

    TestBed.configureTestingModule({
      declarations: [ DialysisPrescriptionListPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: modal },
        { provide: AlertController, useValue: alertCtl },
        { provide: HemoDialysisService, useValue: hemoService },
        { provide: AuthService, useValue: auth },
        { provide: IonNav, useValue: nav },
        { provide: Platform, useValue: pltSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DialysisPrescriptionListPage);
    component = fixture.componentInstance;
    component.patient = new Patient;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
