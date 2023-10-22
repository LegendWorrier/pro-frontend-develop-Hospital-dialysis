import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IonicModule, NavController, Platform, PopoverController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/auth/user.service';
import { AvShuntService } from '../../av-shunt.service';
import { HemoDialysisService } from '../../hemo-dialysis.service';

import { DialysisInfoComponent } from './dialysis-info.component';
import { DialysisInfoModule } from './dialysis-info.module';

describe('DialysisInfoComponent', () => {
  let component: DialysisInfoComponent;
  let fixture: ComponentFixture<DialysisInfoComponent>;

  let hemoService: HemoDialysisService;
  let avshunt: AvShuntService;
  let auth: AuthService;
  let userService: UserService;
  let nav: NavController;
  let route: ActivatedRoute;
  let plt: Platform;
  let popupCtl: PopoverController;

  beforeEach(waitForAsync(() => {
    hemoService = jasmine.createSpyObj('HemoDialysisService', ['calculateTreatmentCount']);
    avshunt = jasmine.createSpyObj('AvShuntService', ['getAvShuntSiteName']);
    auth = jasmine.createSpyObj('AuthService', ['currentUser']);
    userService = jasmine.createSpyObj('UserService', ['getUser']);
    nav = jasmine.createSpyObj('NavController', ['navigateForward']);
    route = jasmine.createSpyObj('ActivatedRoute', [ '' ]);
    plt = jasmine.createSpyObj('Platform', ['is']);
    popupCtl = jasmine.createSpyObj('PopoverController', ['create']);

    //setup mock
    hemoService.calculateTreatmentCount = jasmine.createSpy().and.returnValue({ total: 10, thisMonth: 3 })

    TestBed.configureTestingModule({
      declarations: [ DialysisInfoComponent ],
      imports: [IonicModule.forRoot(), DialysisInfoModule],
      providers: [
        { provide: HemoDialysisService, useValue: hemoService },
        { provide: AvShuntService, useValue: avshunt },
        { provide: AuthService, useValue: auth },
        { provide: UserService, useValue: userService },
        { provide: NavController, useValue: nav },
        { provide: ActivatedRoute, useValue: route },
        { provide: Platform, useValue: plt },
        { provide: PopoverController, useValue: popupCtl },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DialysisInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
