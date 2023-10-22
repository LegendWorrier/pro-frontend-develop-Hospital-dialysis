import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { IonicModule, NavController, Platform } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { AvShuntService } from '../av-shunt.service';
import { DehydrationCalculate, HemoDialysisService } from '../hemo-dialysis.service';
import { Hemosheet } from '../hemosheet';
import { EditHemosheet } from './edit-hemosheet';
import { HemosheetEditPageModule } from './hemosheet-edit.module';

import { HemosheetEditPage } from './hemosheet-edit.page';

describe('HemosheetEditPage', () => {
  let component: HemosheetEditPage;
  let fixture: ComponentFixture<HemosheetEditPage>;

  let plt: Platform;
  let activatedRoute: ActivatedRoute;
  let auth: AuthService;
  let hemo: HemoDialysisService;
  let avshunt: AvShuntService;
  let master: MasterdataService;

  beforeEach(waitForAsync(() => {
    plt = jasmine.createSpyObj('Platform', ['width', 'is']);
    activatedRoute = jasmine.createSpyObj('ActivatedRoute', ['snapshot']);
    auth = jasmine.createSpyObj('AuthService', ['currentUser']);
    hemo = jasmine.createSpyObj('HemoDialysisService', ['getTmpHemosheet', 'calculateDehydration', 'getDialysisPrescriptionList', 'setTmpHemosheet']);
    avshunt = jasmine.createSpyObj('AvShuntService', ['getAvShuntList']);
    master = jasmine.createSpyObj('MasterdataService', ['getUnitList']);
    let nav = jasmine.createSpyObj('NavController', ['']);
    let router = jasmine.createSpyObj('Router', ['getCurrentNavigation']);

    // setup mock
    activatedRoute.snapshot = new ActivatedRouteSnapshot;
    activatedRoute.snapshot.data = {};
    hemo.getTmpHemosheet = jasmine.createSpy().and.returnValue(new Hemosheet);
    hemo.calculateDehydration = jasmine.createSpy().and.returnValue(new DehydrationCalculate(new Hemosheet));
    hemo.getDialysisPrescriptionList = jasmine.createSpy().and.returnValue(new Observable);
    hemo.setTmpHemosheet = jasmine.createSpy();
    auth.currentUser.checkPermissionLevel = jasmine.createSpy().and.returnValue(true);
    avshunt.getAvShuntList = jasmine.createSpy().and.returnValue(new Observable);
    master.getUnitList = jasmine.createSpy().and.returnValue(new Observable);
    router.getCurrentNavigation = jasmine.createSpy().and.returnValue(null);
    
    TestBed.configureTestingModule({
      declarations: [ HemosheetEditPage ],
      imports: [IonicModule.forRoot(), HemosheetEditPageModule],
      providers: [
        { provide: Platform, useValue: plt },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: AuthService, useValue: auth },
        { provide: HemoDialysisService, useValue: hemo },
        { provide: AvShuntService, useValue: avshunt },
        { provide: MasterdataService, useValue: master },
        { provide: NavController, useValue: nav },
        { provide: Router, useValue: router },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HemosheetEditPage);
    component = fixture.componentInstance;
    component.hemosheet = <EditHemosheet>new Hemosheet;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
