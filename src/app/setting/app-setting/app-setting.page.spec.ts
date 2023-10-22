import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppPreferences } from '@ionic-native/app-preferences/ngx';
import { IonicModule, IonNav, NavController } from '@ionic/angular';

import { AppSettingPage } from './app-setting.page';

describe('AppSettingPage', () => {
  let component: AppSettingPage;
  let fixture: ComponentFixture<AppSettingPage>;

  let appPref: AppPreferences;
  let ionNav: IonNav;
  let nav: NavController;

  beforeEach(waitForAsync(() => {
    appPref = jasmine.createSpyObj('AppPref', ['fetch']);
    ionNav = jasmine.createSpyObj('IonNav', ['']);
    nav = jasmine.createSpyObj('NavController', ['']);

    //setup mock
    appPref.fetch = jasmine.createSpy();

    TestBed.configureTestingModule({
      declarations: [ AppSettingPage ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: AppPreferences, useValue: appPref },
        { provide: IonNav, useValue: ionNav },
        { provide: NavController, useValue: nav },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
