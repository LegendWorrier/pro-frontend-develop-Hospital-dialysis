import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule, LoadingController, ModalController, Platform } from '@ionic/angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { AuthService } from '../auth.service';

import { LoginPage } from './login.page';
import { LoginPageModule } from './login.module';
import { Observable } from 'rxjs';
import { AppConfig } from 'src/app/app.config';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;

  beforeEach(waitForAsync(() => {
    let authSpy = jasmine.createSpyObj('AuthService', ['currentUser']);
    let routerSpy = jasmine.createSpyObj('Router', ['Function']);
    let loadingSpy = jasmine.createSpyObj('LoadingController', ['create']);
    let orientationSpy = jasmine.createSpyObj('Orientation', ['onChange', 'type', 'ORIENTATIONS']);
    let modalSpy = jasmine.createSpyObj('ModalController', ['create']);
    let pltSpy = jasmine.createSpyObj('Platform', ['is']);

    // setup mock
    orientationSpy.onChange = jasmine.createSpy('onChange').and.returnValue(new Observable);
    orientationSpy.ORIENTATIONS = jasmine.createSpy('ORIENTATIONS').and.callThrough();
    AppConfig.config = {
      apiServer: '',
      centerName: '',
      reportService: '',
      secureDomain: '',
      decimalPrecision: 2
    }

    TestBed.configureTestingModule({
      declarations: [ LoginPage ],
      imports: [
        IonicModule.forRoot(),
        LoginPageModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: LoadingController, useValue: loadingSpy },
        { provide: ScreenOrientation, useValue: orientationSpy },
        { provide: ModalController, useValue: modalSpy },
        { provide: Platform, useValue: pltSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
