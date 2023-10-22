import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { IonicModule, IonRouterOutlet } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/auth/user.service';
import { HemoDialysisService } from 'src/app/dialysis/hemo-dialysis.service';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { Patient } from '../patient';
import { PatientService } from '../patient.service';

import { PatientDetailPage } from './patient-detail.page';

describe('PatientDetailPage', () => {
  let component: PatientDetailPage;
  let fixture: ComponentFixture<PatientDetailPage>;

  let activatedRoute: ActivatedRoute;
  let auth: AuthService;
  let userService: UserService;
  let patientService: PatientService;
  let hemoService: HemoDialysisService;
  let master: MasterdataService;
  let ionRouter: IonRouterOutlet;

  beforeEach(waitForAsync(() => {
    activatedRoute = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
    auth = jasmine.createSpyObj('AuthService', ['']);
    userService = jasmine.createSpyObj('UserService', ['']);
    patientService = jasmine.createSpyObj('PatientService', ['']);
    hemoService = jasmine.createSpyObj('HemoDialysisService', ['getPatientHemosheet']);
    master = jasmine.createSpyObj('MasterdataService', ['getMedicineList']);
    ionRouter = jasmine.createSpyObj('IonRouterOutlet', ['']);

    // setup mock
    activatedRoute.snapshot = new ActivatedRouteSnapshot;
    activatedRoute.snapshot.data = { patient : new Patient };
    hemoService.getPatientHemosheet = jasmine.createSpy().and.returnValue(new Observable);
    master.getMedicineList = jasmine.createSpy().and.returnValue(new Observable);

    TestBed.configureTestingModule({
      declarations: [ PatientDetailPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: AuthService, useValue: auth },
        { provide: UserService, useValue: userService },
        { provide: PatientService, useValue: patientService },
        { provide: HemoDialysisService, useValue: hemoService },
        { provide: MasterdataService, useValue: master },
        { provide: IonRouterOutlet, useValue: ionRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientDetailPage);
    component = fixture.componentInstance;
    component.patient = new Patient;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
