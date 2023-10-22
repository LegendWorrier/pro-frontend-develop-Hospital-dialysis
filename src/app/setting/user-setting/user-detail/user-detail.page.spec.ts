import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { of } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user';
import { UserService } from 'src/app/auth/user.service';
import { MasterdataService } from 'src/app/masterdata/masterdata.service';
import { AppPipeModule } from 'src/app/pipes/app.pipe.module';

import { UserDetailPage } from './user-detail.page';

describe('UserDetailPage', () => {
  let component: UserDetailPage;
  let fixture: ComponentFixture<UserDetailPage>;

  let auth, master, user;

  beforeEach(waitForAsync(() => {
    auth = jasmine.createSpyObj('AuthService',  { currentUser: new User } );
    master = jasmine.createSpyObj('MasterdataService',  ['getUnitList']);
    user = jasmine.createSpyObj('UserService',  ['']);
    let nav = jasmine.createSpyObj('NavController', ['']);

    //setup mock
    auth.currentUser.units = [-1];
    master.getUnitList = jasmine.createSpy().and.returnValue(of([-1]));
    auth.checkPermission = jasmine.createSpy();

    TestBed.configureTestingModule({
      declarations: [ UserDetailPage ],
      imports: [IonicModule.forRoot(), AppPipeModule],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: MasterdataService, useValue: master },
        { provide: UserService, useValue: user },
        { provide: NavController, useValue: nav }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
