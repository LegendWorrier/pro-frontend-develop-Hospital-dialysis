import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';

import { BackButtonGroupComponent } from './back-button-group.component';

describe('BackButtonGroupComponent', () => {
  let component: BackButtonGroupComponent;
  let fixture: ComponentFixture<BackButtonGroupComponent>;

  let nav, router;

  beforeEach(waitForAsync(() => {
    nav = jasmine.createSpyObj('NavController', ['']);
    router = jasmine.createSpyObj('Router', ['']);

    //setup mock
    router.getCurrentNavigation = jasmine.createSpy().and.returnValue(null);

    TestBed.configureTestingModule({
      declarations: [ BackButtonGroupComponent ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: NavController, useValue: nav },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BackButtonGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
