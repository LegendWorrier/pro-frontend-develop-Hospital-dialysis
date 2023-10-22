import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/auth/user.service';
import { HemoDialysisService } from '../../hemo-dialysis.service';

import { CosignRequestPopupComponent } from './cosign-request-popup.component';

describe('CosignRequestPopupComponent', () => {
  let component: CosignRequestPopupComponent;
  let fixture: ComponentFixture<CosignRequestPopupComponent>;

  let userSpy, authSpy, hemoSpy, popupSpy;

  beforeEach(waitForAsync(() => {
    userSpy = jasmine.createSpyObj('UserService', ['getAllUser']);
    authSpy = jasmine.createSpyObj('AuthService', ['currentUser']);
    hemoSpy = jasmine.createSpyObj('HemoDialysisService', ['addCosign']);
    popupSpy = jasmine.createSpyObj('PopoverController', ['create']);

    // setup mock
    userSpy.getAllUser = jasmine.createSpy('getAllUser').and.returnValue(new Observable);

    TestBed.configureTestingModule({
      declarations: [ CosignRequestPopupComponent ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: UserService, useValue: userSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: HemoDialysisService, useValue: hemoSpy },
        { provide: PopoverController, useValue: popupSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CosignRequestPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
