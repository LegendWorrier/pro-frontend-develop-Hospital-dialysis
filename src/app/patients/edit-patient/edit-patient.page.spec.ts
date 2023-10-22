import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { IonicModule, IonRouterOutlet, NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user';
import { UserService } from 'src/app/auth/user.service';
import { FilterListModule } from 'src/app/directive/filter-list/filter-list.module';
import { HeaderThemeModule } from 'src/app/directive/header-theme.module';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';
import { PrettyPipe } from 'src/app/pipes/pretty.pipe';
import { SelectAsyncListModule } from 'src/app/share/components/select-async-list/select-async-list.module';
import { TagModule } from 'src/app/share/components/tag/tag.module';
import { HeaderModule } from 'src/app/share/header/header.module';
import { PatientService } from '../patient.service';
import { EditPatientPageModule } from './edit-patient.module';

import { EditPatientPage } from './edit-patient.page';

describe('EditPatientPage', () => {
  let component: EditPatientPage;
  let fixture: ComponentFixture<EditPatientPage>;

  let activatedRoute: ActivatedRoute;
  let master: MasterdataService;
  let authSpy;
  let userService: UserService;
  let patientService: PatientService;
  let ionRouter: IonRouterOutlet;

  beforeEach(waitForAsync(() => {
    activatedRoute = jasmine.createSpyObj('ActivatedRoute', ['']);
    master = jasmine.createSpyObj('MasterdataService', ['getUnitList', 'getDeathCauseList', 'getMedicineList', 'getStatusList']);
    authSpy = jasmine.createSpyObj('AuthService', ['currentUser']);
    userService = jasmine.createSpyObj('UserService', ['getDoctorListFromCache']);
    patientService = jasmine.createSpyObj('PatientService', ['']);
    ionRouter = jasmine.createSpyObj('IonRouterOutlet', ['']);
    let nav = jasmine.createSpyObj('NavController', ['']);
    let router = jasmine.createSpyObj('Router', ['getCurrentNavigation']);

    //setup mock
    authSpy.currentUser = jasmine.createSpy().and.returnValue(new User);
    master.getUnitList = jasmine.createSpy().and.returnValue(new Observable);
    master.getStatusList = jasmine.createSpy().and.returnValue(new Observable);
    master.getDeathCauseList = jasmine.createSpy().and.returnValue(new Observable);
    master.getMedicineList = jasmine.createSpy().and.returnValue(new Observable);
    userService.getDoctorListFromCache = jasmine.createSpy().and.resolveTo([]);
    activatedRoute.snapshot = new ActivatedRouteSnapshot;
    activatedRoute.snapshot.params = {};
    router.getCurrentNavigation = jasmine.createSpy().and.returnValue(null);

    TestBed.configureTestingModule({
      declarations: [ EditPatientPage ],
      imports: [
        IonicModule.forRoot(), 
        EditPatientPageModule
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: MasterdataService, useValue: master },
        { provide: AuthService, useValue: authSpy },
        { provide: UserService, useValue: userService },
        { provide: PatientService, useValue: patientService },
        { provide: IonRouterOutlet, useValue: ionRouter },
        { provide: NavController, useValue: nav },
        { provide: Router, useValue: router },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditPatientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
