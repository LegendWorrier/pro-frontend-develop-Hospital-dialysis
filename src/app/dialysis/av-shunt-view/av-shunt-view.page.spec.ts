import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, IonNav } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Patient } from 'src/app/patients/patient';
import { AvShuntService } from '../av-shunt.service';

import { AvShuntViewPage } from './av-shunt-view.page';

describe('AvShuntViewPage', () => {
  let component: AvShuntViewPage;
  let fixture: ComponentFixture<AvShuntViewPage>;
  let navSpy, avshuntSpy;

  beforeEach(waitForAsync(() => {
    navSpy = jasmine.createSpyObj('IonNav', ['push']);
    avshuntSpy = jasmine.createSpyObj('AvShuntService', ['getAvShuntSiteName', 'getAvShuntView']);

    // setup mock

    avshuntSpy.getAvShuntView = jasmine.createSpy('getAvShuntView').and.returnValue(new Observable);

    TestBed.configureTestingModule({
      declarations: [ AvShuntViewPage ],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: IonNav, useValue: navSpy },
        { provide: AvShuntService, useValue: avshuntSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AvShuntViewPage);
    component = fixture.componentInstance;
    component.patient = new Patient;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
