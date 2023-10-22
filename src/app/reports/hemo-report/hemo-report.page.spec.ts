import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user';
import { HemoDialysisService } from 'src/app/dialysis/hemo-dialysis.service';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';

import { HemoReportPage } from './hemo-report.page';

describe('HemoReportPage', () => {
  let component: HemoReportPage;
  let fixture: ComponentFixture<HemoReportPage>;

  let hemo: HemoDialysisService;
  let authSpy;
  let master: MasterdataService;
  let navCtl: NavController

  beforeEach(waitForAsync(() => {
    hemo = jasmine.createSpyObj('HemoDialysisService', ['']);
    authSpy = jasmine.createSpyObj('AuthService', { currentUser: new User });
    master = jasmine.createSpyObj('MasterdataService', ['getUnitList']);
    navCtl = jasmine.createSpyObj('NavController', ['']);

    // setup mock
    authSpy.currentUser.units = [-1];
    master.getUnitList = jasmine.createSpy().and.returnValue(of([-1]));

    TestBed.configureTestingModule({
      declarations: [ HemoReportPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: HemoDialysisService, useValue: hemo },
        { provide: AuthService, useValue: authSpy },
        { provide: MasterdataService, useValue: master },
        { provide: NavController, useValue: navCtl },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HemoReportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
