import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, IonNav, NavController } from '@ionic/angular';
import { of } from 'rxjs';
import { UserService } from 'src/app/auth/user.service';

import { UserSettingPage } from './user-setting.page';

describe('UserSettingPage', () => {
  let component: UserSettingPage;
  let fixture: ComponentFixture<UserSettingPage>;

  let user, ionNav;

  beforeEach(waitForAsync(() => {
    user = jasmine.createSpyObj('UserService', ['']);
    ionNav = jasmine.createSpyObj('IonNav', ['']);
    let nav = jasmine.createSpyObj('NavController', ['']);

    //setup mock
    user.getAllUser = jasmine.createSpy().and.returnValue(of([]));

    TestBed.configureTestingModule({
      declarations: [ UserSettingPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: UserService, useValue: user },
        { provide: IonNav, useValue: ionNav },
        { provide: NavController, useValue: nav },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserSettingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
