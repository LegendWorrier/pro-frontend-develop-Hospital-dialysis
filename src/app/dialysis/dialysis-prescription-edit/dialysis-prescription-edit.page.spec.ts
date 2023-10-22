import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { HemoDialysisService } from '../hemo-dialysis.service';
import { DialysisPrescriptionEditPageModule } from './dialysis-prescription-edit.module';

import { DialysisPrescriptionEditPage } from './dialysis-prescription-edit.page';

describe('DialysisPrescriptionEditPage', () => {
  let component: DialysisPrescriptionEditPage;
  let fixture: ComponentFixture<DialysisPrescriptionEditPage>;

  let route: ActivatedRoute;
  let router: Router;
  let plt: Platform;
  let master: MasterdataService;
  let hemoService: HemoDialysisService;
  let authSpy;
  
  beforeEach(waitForAsync(() => {
    route = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
    router = jasmine.createSpyObj('Router', ['getCurrentNavigation']);
    plt = jasmine.createSpyObj('Platform', ['width', 'is']);
    master = jasmine.createSpyObj('MasterdataService', ['getAnticoagulantList', 'getDialyzerList', 'getDialysateList', 'getNeedleList']);
    hemoService = jasmine.createSpyObj('HemoDialysisService', ['checkCanEdit']);
    authSpy = jasmine.createSpyObj('AuthService', ['currentUser']);
    let nav = jasmine.createSpyObj('NavController', ['']);

    // setup mock
    router.getCurrentNavigation = jasmine.createSpy().and.returnValue(null);
    plt.width = jasmine.createSpy().and.returnValue(200);
    route.snapshot = new ActivatedRouteSnapshot;
    route.snapshot.params = {};
    authSpy.currentUser.checkPermission = jasmine.createSpy().and.returnValue(true);
    hemoService.checkCanEdit = jasmine.createSpy().and.returnValue(true);
    master.getAnticoagulantList = jasmine.createSpy().and.returnValue(new Observable);
    master.getDialyzerList = jasmine.createSpy().and.returnValue(new Observable);
    master.getDialysateList = jasmine.createSpy().and.returnValue(new Observable);
    master.getNeedleList = jasmine.createSpy().and.returnValue(new Observable);

    TestBed.configureTestingModule({
      declarations: [ DialysisPrescriptionEditPage ],
      imports: [IonicModule.forRoot(), DialysisPrescriptionEditPageModule],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: router },
        { provide: Platform, useValue: plt },
        { provide: MasterdataService, useValue: master },
        { provide: HemoDialysisService, useValue: hemoService },
        { provide: AuthService, useValue: authSpy },
        { provide: NavController, useValue: nav },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DialysisPrescriptionEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
