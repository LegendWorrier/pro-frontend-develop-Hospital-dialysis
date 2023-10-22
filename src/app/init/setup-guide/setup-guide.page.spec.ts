import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { SetupGuidePage } from './setup-guide.page';

describe('SetupGuidePage', () => {
  let component: SetupGuidePage;
  let fixture: ComponentFixture<SetupGuidePage>;

  let routerSpy;

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj('Router', ['']);

    TestBed.configureTestingModule({
      declarations: [ SetupGuidePage ],
      imports: [IonicModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        //{ provide: Router, useValue: null },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SetupGuidePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
