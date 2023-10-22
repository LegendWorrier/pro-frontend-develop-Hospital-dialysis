import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { InitService } from '../init.service';

import { InitPage } from './init.page';

describe('InitPage', () => {
  let component: InitPage;
  let fixture: ComponentFixture<InitPage>;

  let initSpy, storageSpy, routerSpy, navSpy;
  let activatedRoute: ActivatedRoute;

  beforeEach(waitForAsync(() => {
    initSpy = jasmine.createSpyObj('InitService', ['']);
    storageSpy = jasmine.createSpyObj('Storage', ['get', 'set']);
    routerSpy = jasmine.createSpyObj('Router', ['']);
    navSpy = jasmine.createSpyObj('NavController', ['']);
    activatedRoute = jasmine.createSpyObj('ActivatedRoute', ['']);

    TestBed.configureTestingModule({
      declarations: [ InitPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: InitService, useValue: initSpy },
        { provide: Storage, useValue: storageSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NavController, useValue: navSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InitPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
