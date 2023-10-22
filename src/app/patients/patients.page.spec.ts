import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { User } from '../auth/user';
import { UserService } from '../auth/user.service';
import { MasterdataService } from '../masterdata/masterdata.service';
import { PatientService } from './patient.service';

import { PatientsPage } from './patients.page';

describe('PatientsPage', () => {
  let component: PatientsPage;
  let fixture: ComponentFixture<PatientsPage>;

  let router: Router;
  let route: ActivatedRoute;
  let patientService: PatientService;
  let authSpy;
  let user: UserService;
  let master: MasterdataService

  beforeEach(waitForAsync(() => {
    route = jasmine.createSpyObj('ActivatedRoute', ['']);
    router = jasmine.createSpyObj('Router', ['']);
    patientService = jasmine.createSpyObj('PatientService', ['']);
    authSpy = jasmine.createSpyObj('AuthService', ['currentUser']);
    user = jasmine.createSpyObj('UserService', ['']);
    master = jasmine.createSpyObj('MasterdataService', ['']);

    // setup mock
    authSpy.currentUser.isPowerAdmin = jasmine.createSpy().and.returnValue(false);
    authSpy.currentUser.units = jasmine.createSpy().and.returnValue([ -1 ]);
    user.getDoctorListFromCache = jasmine.createSpy().and.resolveTo([]);
    master.getUnitList = jasmine.createSpy().and.returnValue(new Observable);

    TestBed.configureTestingModule({
      declarations: [PatientsPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        { provide: PatientService, useValue: patientService },
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: user },
        { provide: MasterdataService, useValue: master },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
