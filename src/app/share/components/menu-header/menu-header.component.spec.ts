import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';

import { MenuHeaderComponent } from './menu-header.component';

describe('MenuHeaderComponent', () => {
  let component: MenuHeaderComponent;
  let fixture: ComponentFixture<MenuHeaderComponent>;

  let auth;

  beforeEach(waitForAsync(() => {
    auth = jasmine.createSpyObj('AuthService', ['currentUserUpdate']);
    auth.currentUserUpdate.subscribe = jasmine.createSpy();

    TestBed.configureTestingModule({
      declarations: [ MenuHeaderComponent ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: auth }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
